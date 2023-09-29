import { NextFunction, Request, Response } from 'express'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { USER_MESSAGES } from '~/constants/messages'
import { HTTP_STATUS } from '~/constants/httpStatus'
import User from '~/models/schemas/User.schema'
import { success } from '~/utils/returnDataSuccess'

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
    req: Request<ParamsDictionary, any, RegisterReqBody>,
    res: Response,
    next: NextFunction
) => {
    const result = await userService.register(req.body)
    return res.json({
        message: USER_MESSAGES.REGISTER_SUCCESS,
        result
    })
}
