import { validate } from './../utils/validation'
import { checkSchema } from 'express-validator'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import userService from '~/services/user.services'

export const loginValidator = validate(
    checkSchema({
        email: {
            isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
            trim: true,
            custom: {
                options: async (value, { req }) => {
                    const user = await databaseService.users.find({ email: value })
                    if (!user) {
                        throw new ErrorWithStatus({
                            message: USER_MESSAGES.EMAIL_IS_NOT_EXISTS,
                            status: HTTP_STATUS.BAD_REQUEST
                        })
                    }
                    req.user = user

                    return true
                }
            }
        },

        password: {
            notEmpty: {
                errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
            },
            isString: {
                errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
            },
            trim: true,
            isLength: {
                errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
                options: {
                    min: 6,
                    max: 50
                }
            }
        }
    })
)

export const registerValidator = validate(
    checkSchema({
        name: {
            notEmpty: {
                errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
            },
            isString: {
                errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING
            },
            isLength: {
                options: { min: 3, max: 255 },
                errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_FROM_2_TO_100
            },
            trim: true
        },
        email: {
            notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
            isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
            trim: true,
            custom: {
                options: async (value) => {
                    const result = await userService.checkEmailExist(value).then((isExist: boolean) => {
                        if (isExist) {
                            throw new ErrorWithStatus({
                                message: USER_MESSAGES.EMAIL_ALREADY_EXISTS,
                                status: HTTP_STATUS.BAD_REQUEST
                            })
                        }
                        return true
                    })

                    return result
                }
            }
        },
        password: {
            notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
            isString: { errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING },
            isLength: {
                options: { min: 6, max: 50 },
                errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
            }
            // isStrongPassword: {
            //   options:{
            //     minLength: 6,
            //     minLowercase: 1,
            //     minUppercase: 1,
            //     minNumbers: 1,
            //     minSymbols: 1,
            //     returnScore: false,
            //     pointsPerUnique: 1,
            //     pointsPerRepeat: 0.5,
            //     pointsForContainingLower: 10,
            //     pointsForContainingUpper: 10,
            //     pointsForContainingNumber: 10,
            //     pointsForContainingSymbol: 10
            //   }
            // }
        },
        confirm_password: {
            notEmpty: { errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
            isString: { errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING },
            isLength: {
                options: { min: 6, max: 50 },
                errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_FROM_6_TO_50
            },
            custom: {
                options: (value, { req }) => {
                    if (value !== req.body.password) {
                        throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_EQUAL_TO_PASSWORD)
                    }
                    return true
                }
            }
        },
        date_of_birth: {
            isISO8601: {
                options: {
                    strict: true,
                    strictSeparator: true
                }
            },
            errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_A_ISO8601
        }
    })
)
