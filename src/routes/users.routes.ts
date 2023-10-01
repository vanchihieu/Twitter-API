import { Router } from 'express'
import { access } from 'fs'
import {
    emailVerifyValidator,
    loginController,
    logoutController,
    registerController
} from '~/controllers/users.controllers'
import {
    accessTokenValidator,
    emailVerifyTokenValidator,
    loginValidator,
    refreshTokenValidator,
    registerValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()

/**
 * Description: login a user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description: Register new user
 * Path: /register
 * Method: POST
 * Body: { email: string, password: string, confirm_password: string, name: string, date_of_birth: string }
 */

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: logout a user
 * Path: /logout
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: verify email when user client click on link in email
 * Path: /verify-email
 * Method: POST
 * Body: { email_refresh_token: string }
 */

usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyValidator))

export default usersRouter
