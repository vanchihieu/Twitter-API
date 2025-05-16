import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, TokenPayload } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { success } from '~/utils/returnDataSuccess'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { log } from 'console'
// import { sendForgotPasswordEmail, sendVerifyRegisterEmail } from '~/utils/email'
config()
class UserService {
    private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return signToken({
            payload: { user_id, token_type: TokenType.AccessToken, verify },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
            options: {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
            }
        })
    }

    private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return signToken({
            payload: { user_id, token_type: TokenType.RefreshToken, verify },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            options: {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
            }
        })
    }

    private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
    }

    private decodeRefreshToken(refresh_token: string) {
        return verifyToken({
            token: refresh_token,
            jwtSecret: process.env.jwtSecretRefreshToken as string
        })
    }

    private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return signToken({
            payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
            privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
            options: {
                expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
            }
        })
    }

    private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return signToken({
            payload: {
                user_id,
                token_type: TokenType.ForgotPasswordToken,
                verify
            },
            privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
            options: {
                expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
            }
        })
    }

    async register(payload: RegisterReqBody) {
        const user_id = new ObjectId()
        const email_verify_token = await this.signEmailVerifyToken({
            user_id: user_id.toString(),
            verify: UserVerifyStatus.Unverified
        })
        await databaseService.users.insertOne(
            new User({
                ...payload,
                _id: user_id,
                username: `user${user_id.toString()}`,
                email_verify_token,
                date_of_birth: new Date(payload.date_of_birth),
                password: hashPassword(payload.password)
            })
        )
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
            user_id: user_id.toString(),
            verify: UserVerifyStatus.Unverified
        })
        const { iat, exp } = await this.decodeRefreshToken(refresh_token)
        await databaseService.refreshToken.insertOne(
            new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat: iat ?? 0, exp: exp ?? 0 })
        )
        // Flow verify email
        // 1. Server send email to user
        // 2. User click link in email
        // 3. Client send request to server with email_verify_token
        // 4. Server verify email_verify_token
        // 5. Client receive access_token and refresh_token
        // await sendVerifyRegisterEmail(payload.email, email_verify_token)
        return {
            access_token,
            refresh_token
        }
    }

    async checkEmailExist(email: string) {
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    }

    async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })

        const { iat, exp } = await this.decodeRefreshToken(refresh_token)

        await databaseService.refreshToken.insertOne(
            new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat: iat ?? 0, exp: exp ?? 0 })
        )
        return [access_token, refresh_token]
    }

    async logout(refresh_token: string) {
        await databaseService.refreshToken.deleteOne({ token: refresh_token })
        return {
            message: USERS_MESSAGES.LOGOUT_SUCCESS
        }
    }

    async verifyEmail(user_id: string) {
        // Tạo giá trị cập nhật
        // MongoDB cập nhật giá trị
        const [token] = await Promise.all([
            this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
            databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
                {
                    $set: {
                        email_verify_token: '',
                        verify: UserVerifyStatus.Verified,
                        updated_at: '$$NOW'
                    }
                }
            ])
        ])
        const [access_token, refresh_token] = token
        const { iat, exp } = await this.decodeRefreshToken(refresh_token)

        await databaseService.refreshToken.insertOne(
            new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat: iat ?? 0, exp: exp ?? 0 })
        )
        return {
            access_token,
            refresh_token
        }
    }

    async resendVerifyEmail(user_id: string, email: string) {
        const email_verify_token = await this.signEmailVerifyToken({
            user_id,
            verify: UserVerifyStatus.Unverified
        })
        // await sendVerifyRegisterEmail(email, email_verify_token)

        // Cập nhật lại giá trị email_verify_token trong document user
        await databaseService.users.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $set: {
                    email_verify_token
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )
        return {
            message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
        }
    }

    async forgotPassword({ user_id, verify, email }: { user_id: string; email: string; verify: UserVerifyStatus }) {
        const forgot_password_token = await this.signForgotPasswordToken({
            user_id,
            verify
        })
        console.log('🚀 ~ UserService ~ forgotPassword ~ forgot_password_token:', forgot_password_token)

        await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
            {
                $set: {
                    forgot_password_token,
                    updated_at: '$$NOW'
                }
            }
        ])
        // await sendForgotPasswordEmail(email, forgot_password_token)

        return {
            message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
        }
    }

    async resetPassword(user_id: string, password: string) {
        databaseService.users.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $set: {
                    forgot_password_token: '',
                    password: hashPassword(password)
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )
        return {
            message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
        }
    }
}

const userService = new UserService()
export default userService
