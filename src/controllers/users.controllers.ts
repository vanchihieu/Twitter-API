import { NextFunction, Request, Response } from 'express'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'

import { USER_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'
import User from '~/models/schemas/User.schema'
import { success } from '~/utils/returnDataSuccess'
import { LogoutBody, RegisterBody, TokenPayload } from '~/models/requests/User.requests'

export const loginController = async (req: Request, res: Response) => {
    const { _id, verify } = req.user as User
    const user_id = _id?.toString() as string
    const [access_token, refresh_token] = await userService.login({ user_id, verify })
    res.status(HTTP_STATUS.OK).json(
        success(USER_MESSAGES.LOGIN_SUCCESS, {
            access_token,
            refresh_token,
            user: req.user
        })
    )
}
export const registerController = async (
    req: Request<ParamsDictionary, any, RegisterBody>,
    res: Response,
    next: NextFunction
) => {
    const result = await userService.register(req.body)
    return res.json({
        message: USER_MESSAGES.REGISTER_SUCCESS,
        result
    })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutBody>, res: Response) => {
    const { refresh_token } = req.body
    const response = await userService.logout(refresh_token)
    res.status(HTTP_STATUS.OK).json(response)
}

export const verifyEmailController = async (req: Request, res: Response) => {
    const { decoded_email_verify_token } = req.body
    const response = await userService.verifyEmailToken(decoded_email_verify_token as TokenPayload)
    res.status(HTTP_STATUS.OK).json(response)
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization as TokenPayload
    const response = await userService.resendVerifyEmailToken(user_id)
    res.status(HTTP_STATUS.OK).json(response)
}
