import jsonwebtoken from 'jsonwebtoken'
import crypto from 'crypto'
import { Environment } from '../environment/environment'

const buildAccessToken = (environment: Environment, id: string) => {
  const variables = environment.getJwtVariables()
  const { JWT_SECRET_KEY: secretKey, JWT_EXPIRES_IN: expiresIn } = variables
  const options = { expiresIn }
  const token = jsonwebtoken.sign({ id }, secretKey, options)
  return token
}

const decodeAccessToken = (token: string, secretKey: string) => {
  try {
    const data = jsonwebtoken.verify(token, secretKey) as {
      id: string
      iat: number
    }
    return data
  } catch (error) {
    return null
  }
}

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex')

export { buildAccessToken, decodeAccessToken, hashToken }
