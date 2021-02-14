import jsonwebtoken from 'jsonwebtoken'
import crypto from 'crypto'
import { Environment } from '../environment/environment'

const buildAccessToken = (environment: Environment, id: string) => {
  const variables = environment.getJwtVariables()
  const { JWT_SECRET_KEY: secretKey, JWT_EXPIRES_IN: expiresIn } = variables
  const options = { expiresIn }
  const accessToken = jsonwebtoken.sign({ id }, secretKey, options)
  return accessToken
}

const decodeAccessToken = (accessToken: string, secretKey: string) => {
  try {
    const data = jsonwebtoken.verify(accessToken, secretKey) as {
      id: string
      iat: number
    }
    return data
  } catch (error) {
    return null
  }
}

const hashResetToken = (resetToken: string) =>
  crypto.createHash('sha256').update(resetToken).digest('hex')

const buildCookieOptions = (environment: Environment) => {
  const { NODE_ENV } = environment.getNodeVariables()
  const { COOKIE_EXPIRES_IN } = environment.getJwtVariables()
  const amountInMs = Number(COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
  const expires = new Date(Date.now() + amountInMs)
  const secure = NODE_ENV === 'production'
  const cookieOptions = { expires, secure, httpOnly: true }
  return cookieOptions
}

export {
  buildAccessToken,
  decodeAccessToken,
  hashResetToken,
  buildCookieOptions,
}
