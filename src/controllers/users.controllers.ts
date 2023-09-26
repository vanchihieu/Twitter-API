import { Request, Response } from 'express'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'vanchihieu' && password === 'hi') {
    return res.send({ message: 'Login success' })
  }
  return res.status(400).json({ message: 'Login failed' })
}
