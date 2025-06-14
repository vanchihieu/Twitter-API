import { ParamsDictionary } from 'express-serve-static-core'
import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'

export interface RegisterReqBody {
    name: string
    email: string
    password: string
    confirm_password: string
    date_of_birth: string
}

export interface LogoutBody {
    refresh_token: string
}
export interface RefreshTokenBody {
    refresh_token: string
}

export interface RefreshTokenReqBody {
    refresh_token: string
}

export interface VerifyEmailReqBody {
    email_verify_token: string
}

export interface ResetPasswordBody {
    password: string
    confirm_password: string
    forgot_password_token: string
}

export interface UpdateMeRequestBody {
    name?: string
    date_of_birth?: string
    bio?: string
    location?: string
    website?: string
    username?: string
    avatar?: string
    cover_photo?: string
}

export interface FollowRequestBody {
    followed_user_id: string
}

export interface likeReqBody {
    tweet_id: string
}

export interface changePasswordReqBody {
    old_password: string
    password: string
    confirm_password: string
}

export interface GetProfileRequestParams extends ParamsDictionary {
    username: string
}

export interface UnfollowRequestParams extends ParamsDictionary {
    user_id: string
}

export interface TokenPayload extends JwtPayload {
    user_id: string
    token_type: TokenType
    verify: UserVerifyStatus
}

export interface ForgotPasswordReqBody {
    email: string
}

export interface VerifyForgotPasswordReqBody {
    forgot_password_token: string
}

export interface ResetPasswordReqBody {
    password: string
    confirm_password: string
    forgot_password_token: string
}

export interface GetProfileReqParams extends ParamsDictionary {
    username: string
}

export interface UpdateMeReqBody {
    name?: string
    date_of_birth?: string
    bio?: string
    location?: string
    website?: string
    username?: string
    avatar?: string
    cover_photo?: string
}

export interface FollowReqBody {
    followed_user_id: string
}

export interface UnfollowReqParams extends ParamsDictionary {
    user_id: string
}

export interface ChangePasswordReqBody {
    old_password: string
    password: string
    confirm_password: string
}
