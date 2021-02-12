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

export { buildAccessToken, decodeAccessToken, hashResetToken }
