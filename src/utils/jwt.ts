import jwt, { SignOptions } from 'jsonwebtoken'

export const signToken = ({
    payload,
    privateKey = process.env.JWT_SECRET as string,
    options = {
        algorithm: 'HS256'
    }
}: {
    payload: string | Buffer | object
    privateKey?: string
    options?: SignOptions
}) => {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(payload, privateKey, options || {}, (err: Error | null, token?: string) => {
            if (err) throw reject(err)
            return resolve(token as string)
        })
    })
}
