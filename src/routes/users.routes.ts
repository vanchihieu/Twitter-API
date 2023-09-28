import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { ErrorRequestHandler } from 'express'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
/**
 * Description: Register new user
 * Path: /register
 * Method: POST
 * Body: { email: string, password: string }
 */

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log(err.message)
    res.status(400).json({ message: err.message })
}

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default usersRouter
