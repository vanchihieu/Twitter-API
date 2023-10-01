import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterBody, TokenPayload } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { success } from '~/utils/returnDataSuccess'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
config()
class UserService {
    private signAccessToken(user_id: string) {
        return signToken({
            payload: {
                user_id,
                token_type: TokenType.AccessToken
            },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
            options: {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
            }
        })
    }

    private signRefreshToken(user_id: string) {
        return signToken({
            payload: {
                user_id,
                token_type: TokenType.RefreshToken
            },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            options: {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
            }
        })
    }

    private generateAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return signToken({
            payload: { user_id, token_type: TokenType.AccessToken, verify },
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
            options: {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
            }
        })
    }

    private generateRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return signToken({
            payload: { user_id, token_type: TokenType.RefreshToken, verify },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            options: {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
            }
        })
    }

    private generateAccessRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return Promise.all([
            this.generateAccessToken({ user_id, verify }),
            this.generateRefreshToken({ user_id, verify })
        ])
    }

    private generateVerifyEmailToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return signToken({
            payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
            privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
            options: {
                expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
            }
        })
    }

    async register(payload: RegisterBody) {
        const user_id = new ObjectId().toString()
        const email_verify_token = await this.generateVerifyEmailToken({ user_id, verify: UserVerifyStatus.Unverified })
        console.log('🚀 ~ UserService ~ register ~ email_verify_token:', email_verify_token)

        const [token] = await Promise.all([
            this.generateAccessRefreshToken({ user_id, verify: UserVerifyStatus.Unverified }),
            databaseService.users.insertOne(
                new User({
                    ...payload,
                    _id: new ObjectId(user_id),
                    date_of_birth: new Date(payload.date_of_birth),
                    password: hashPassword(payload.password),
                    email_verify_token
                })
            )
        ])

        const [access_token, refresh_token] = token
        await databaseService.refreshToken.insertOne(
            new RefreshToken({
                user_id: new ObjectId(user_id),
                token: refresh_token as string
            })
        )

        return success(USER_MESSAGES.REGISTER_SUCCESS, {
            access_token,
            refresh_token,
            email_verify_token
        })
    }

    async checkEmailExist(email: string) {
        const user = await databaseService.users.findOne({ email })
        return Boolean(user)
    }

    async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        const [access_token, refresh_token] = await this.generateAccessRefreshToken({ user_id, verify })

        await databaseService.refreshToken.insertOne(
            new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
        )
        return [access_token, refresh_token]
    }

    async logout(user_id: string) {
        await databaseService.refreshToken.deleteMany({ user_id: new ObjectId(user_id) })
        return success('Logout is successfully')
    }

    async verifyEmailToken(email_verify_token: TokenPayload) {
        const { user_id } = email_verify_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (!user) {
            throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            })
        }
        if (user.email_verify_token === '') {
            throw new ErrorWithStatus({
                message: USER_MESSAGES.EMAIL_ALREADY_VERIFY_BEFORE,
                status: HTTP_STATUS.OK
            })
        }

        const [access_token, refresh_token] = await this.generateAccessRefreshToken({
            user_id,
            verify: UserVerifyStatus.Verified
        })
        await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
            {
                $set: {
                    email_verify_token: '',
                    verify: UserVerifyStatus.Verified,
                    updated_at: '$$NOW'
                }
            }
        ])
        await databaseService.refreshToken.insertOne(
            new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
        )
        return {
            status: HTTP_STATUS.OK,
            message: USER_MESSAGES.EMAIL_VERIFY_IS_SUCCESSFULLY
        }
    }
}

const userService = new UserService()
export default userService
