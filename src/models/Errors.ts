import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

type ErrorsType = Record<
    string,
    {
        msg: string
        [key: string]: any
    }
>

class ErrorWithStatus {
    message: string
    status: number
    constructor({ message, status }: { message: string; status: number }) {
        this.message = message
        this.status = status
    }
}

class Entity extends ErrorWithStatus {
    // return status 422: validate error
    errors: ErrorsType
    constructor({
        message = USERS_MESSAGES.VALIDATION_ERROR,
        status = HTTP_STATUS.UNPROCESSABLE_ENTITY,
        errors
    }: {
        message?: string
        status?: number
        errors: ErrorsType
    }) {
        super({ message, status })
        this.errors = errors
    }
}

export { ErrorWithStatus, Entity }
