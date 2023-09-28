import express from 'express'
import { validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { Entity, ErrorWithStatus } from '~/models/Errors'
import { checkEmptyObj } from './utils'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
//https://express-validator.github.io/docs/guides/manually-running
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        await validations.run(req)

        const errors = validationResult(req)
        // không có lỗi thì next tiếp tục request
        if (errors.isEmpty()) {
            return next()
        }
        const objectErrors = errors.mapped()
        const entityErrors = new Entity({ errors: {} })
        const errorStatus = new ErrorWithStatus({ message: '', status: 400 })
        for (const key in objectErrors) {
            const { msg } = objectErrors[key]
            // trả về lỗi không phải là do validate
            if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
                errorStatus.message = msg.message
                errorStatus.status = msg.status
            } else {
                entityErrors.errors[key] = objectErrors[key]
            }
        }
        if (checkEmptyObj(entityErrors.errors)) return next(errorStatus)
        next(entityErrors)
    }
}
