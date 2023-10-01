import { config } from 'dotenv'
import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'
config()
const signToken = ({
    payload,
    privateKey,
    options = {
        algorithm: 'HS256'
    }
}: {
    payload: string | Buffer | object
    privateKey: string
    options?: SignOptions
}) => {
    return new Promise<string>((resolve, reject) => {
        if (!privateKey) {
            throw new Error('Private key is undefined')
        }
        jwt.sign(payload, privateKey, options || {}, (err: Error | null, token?: string) => {
            if (err) throw reject(err)
            return resolve(token as string)
        })
    })
}

const verifyToken = ({ token, jwtSecret }: { token: string; jwtSecret: string }) =>
    new Promise<TokenPayload>((resolve, reject) => {
        jwt.verify(token, jwtSecret as string, (err, decoded) => {
            if (err) throw reject(err)
            resolve(decoded as TokenPayload)
        })
    })

export { signToken, verifyToken }
