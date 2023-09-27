import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
/**
 * Description: Register new user
 * Path: /register
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/register', registerValidator, registerController)

export default usersRouter
