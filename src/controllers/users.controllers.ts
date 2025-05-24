import { NextFunction, Request, Response } from 'express'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'

import { USERS_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'
import User from '~/models/schemas/User.schema'
import { success } from '~/utils/returnDataSuccess'
import {
    ChangePasswordReqBody,
    FollowReqBody,
    ForgotPasswordReqBody,
    GetProfileReqParams,
    LogoutBody,
    RefreshTokenReqBody,
    RegisterReqBody,
    ResetPasswordReqBody,
    TokenPayload,
    UnfollowReqParams,
    UpdateMeReqBody,
    VerifyEmailReqBody,
    VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

export const loginController = async (req: Request, res: Response) => {
    const { _id, verify } = req.user as User
    const user_id = _id?.toString() as string
    const [access_token, refresh_token] = await userService.login({ user_id, verify })
    res.status(HTTP_STATUS.OK).json(
        success(USERS_MESSAGES.LOGIN_SUCCESS, {
            access_token,
            refresh_token,
            user: req.user
        })
    )
}
export const registerController = async (
    req: Request<ParamsDictionary, any, RegisterReqBody>,
    res: Response,
    next: NextFunction
) => {
    const result = await userService.register(req.body)
    return res.json({
        message: USERS_MESSAGES.REGISTER_SUCCESS,
        result
    })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutBody>, res: Response) => {
    const { refresh_token } = req.body
    const response = await userService.logout(refresh_token)
    res.status(HTTP_STATUS.OK).json(response)
}

export const refreshTokenController = async (
    req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
    res: Response
) => {
    const { refresh_token } = req.body
    const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload

    const result = await userService.refreshToken({ user_id, refresh_token, verify, exp })

    return res.json({
        message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
        result
    })
}

export const verifyEmailController = async (
    req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
    res: Response,
    next: NextFunction
) => {
    const { user_id } = req.decoded_email_verify_token as TokenPayload
    const user = await databaseService.users.findOne({
        _id: new ObjectId(user_id)
    })
    // Nếu không tìm thấy user thì mình sẽ báo lỗi
    if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: USERS_MESSAGES.USER_NOT_FOUND
        })
    }
    // Đã verify rồi thì mình sẽ không báo lỗi
    // Mà mình sẽ trả về status OK với message là đã verify trước đó rồi
    if (user.email_verify_token === '') {
        return res.json({
            message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
        })
    }
    const result = await userService.verifyEmail(user_id)
    return res.json({
        message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
        result
    })
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

    if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            message: USERS_MESSAGES.USER_NOT_FOUND
        })
    }

    if (user.verify === UserVerifyStatus.Verified) {
        return res.json({
            message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
        })
    }
    const result = await userService.resendVerifyEmail(user_id, user.email)
    return res.json(result)
}

export const forgotPasswordController = async (
    req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
    res: Response,
    next: NextFunction
) => {
    const { _id, verify, email } = req.user as User
    const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify, email })
    return res.json(result)
}

export const verifyForgotPasswordController = async (
    req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
    res: Response,
    next: NextFunction
) => {
    return res.json({
        message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
    })
}

export const resetPasswordController = async (
    req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
    res: Response,
    next: NextFunction
) => {
    const { user_id } = req.decoded_forgot_password_token as TokenPayload
    const { password } = req.body
    const result = await userService.resetPassword(user_id, password)
    return res.json(result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const user = await userService.getMe(user_id)
    return res.json({
        message: USERS_MESSAGES.GET_ME_SUCCESS,
        result: user
    })
}

export const getProfileController = async (
    req: Request<ParamsDictionary, any, GetProfileReqParams>,
    res: Response,
    next: NextFunction
) => {
    const { username } = req.params
    const user = await userService.getProfile(username)

    return res.json({
        message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
        result: user
    })
}

export const updateMeController = async (
    req: Request<ParamsDictionary, any, UpdateMeReqBody>,
    res: Response,
    next: NextFunction
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { body } = req
    const user = await userService.updateMe(user_id, body)

    return res.json({
        message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
        result: user
    })
}

export const followController = async (
    req: Request<ParamsDictionary, any, FollowReqBody>,
    res: Response,
    next: NextFunction
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { followed_user_id } = req.body
    const result = await userService.follow(user_id, followed_user_id)

    return res.json(result)
}

export const unfollowController = async (
    req: Request<ParamsDictionary, any, UnfollowReqParams>,
    res: Response,
    next: NextFunction
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { user_id: followed_user_id } = req.params as UnfollowReqParams

    const result = await userService.unfollow(user_id, followed_user_id)

    return res.json(result)
}

export const changePasswordController = async (
    req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
    res: Response,
    next: NextFunction
) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { password } = req.body
    const result = await userService.changePassword(user_id, password)
    return res.json(result)
}
