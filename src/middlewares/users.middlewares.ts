import { validate } from './../utils/validation'
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import userService from '~/services/user.services'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(400).json({
            message: 'Missing email or password'
        })
    }
    next()
}

export const registerValidator = validate(
    checkSchema({
        name: {
            notEmpty: true,
            isString: true,
            isLength: {
                options: { min: 3, max: 255 },
                errorMessage: 'Name should be at least 3 chars'
            },
            trim: true
        },
        email: {
            notEmpty: true,
            isEmail: true,
            errorMessage: 'Invalid email',
            trim: true,
            custom: {
                options: async (value, { req }) => {
                    const result = await userService.checkEmailExist(value).then((isExist: boolean) => {
                        if (isExist) {
                            throw new Error('Email already exists')
                        }
                        return true
                    })

                    return result
                }
            }
        },
        password: {
            notEmpty: true,
            isString: true,
            isLength: {
                options: { min: 6, max: 50 },
                errorMessage: 'Password should be at least 6 chars'
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
            notEmpty: true,
            isString: true,
            isLength: {
                options: { min: 6, max: 50 },
                errorMessage: 'Confirm Password should be at least 6 chars'
            },
            custom: {
                options: (value, { req }) => {
                    if (value !== req.body.password) {
                        throw new Error('Password confirmation does not match password')
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
            errorMessage: 'Invalid date of birth'
        }
    })
)
