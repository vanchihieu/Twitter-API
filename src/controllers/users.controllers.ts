import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'

export const loginController = (req: Request, res: Response) => {
    const { email, password } = req.body
    if (email === 'vanchihieu' && password === 'hi') {
        return res.send({ message: 'Login success' })
    }
    return res.status(400).json({ message: 'Login failed' })
}
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
    try {
        const result = await userService.register(req.body)
        return res.json({
            message: 'Register success',
            result
        })
    } catch (error) {
        return res.status(400).json({
            message: 'Register failed',
            error
        })
    }
}
