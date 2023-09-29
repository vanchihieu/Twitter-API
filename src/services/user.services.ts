import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { RefreshToken } from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'

class UserService {
    private signAccessToken(user_id: string) {
        return signToken({
            payload: {
                user_id,
                token_type: TokenType.AccessToken
            },
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
                expiresIn: process.env.ACCESS_EXPRIES_IN
            }
        })
    }

    private generateRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return signToken({
            payload: { user_id, token_type: TokenType.RefreshToken, verify },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            options: {
                expiresIn: process.env.REFRESH_EXPRIES_IN
            }
        })
    }

    private generateAccessRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
        return Promise.all([
            this.generateAccessToken({ user_id, verify }),
            this.generateRefreshToken({ user_id, verify })
        ])
    }
    async register(payload: RegisterReqBody) {
        const result = await databaseService.users.insertOne(
            new User({
                ...payload,
                date_of_birth: new Date(payload.date_of_birth),
                password: hashPassword(payload.password)
            })
        )

        const user_id = result.insertedId.toString()
        const [access_token, refresh_token] = await Promise.all([
            this.signAccessToken(user_id),
            this.signRefreshToken(user_id)
        ])

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
        const [access_token, refresh_token] = await this.generateAccessRefreshToken({ user_id, verify })
        await databaseService.refreshToken.insertOne(
            new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
        )
        return [access_token, refresh_token]
    }
}

const userService = new UserService()
export default userService
