import { StatusCodes } from 'http-status-codes'
import { RequestHandler, Request } from 'express'
import { pathOr, pickBy } from 'ramda'
import nodemailer from 'nodemailer'
import jsonwebtoken from 'jsonwebtoken'
import crypto from 'crypto'

import { Environment } from '../environment/environment'

export class ServerError extends Error {
  public status: string = ''
  constructor(
    message: string,
    private statusCode: number = StatusCodes.BAD_REQUEST
  ) {
    super(message)
    this.statusCode = statusCode
    this.status = statusCode.toString().startsWith('4')
      ? StatusTexts.FAILURE
      : StatusTexts.ERROR
    Error.captureStackTrace(this, this.constructor)
  }
}

export enum StatusTexts {
  SUCCESS = 'success',
  FAILURE = 'failure',
  ERROR = 'error',
}

export const tryCatch = (handler: RequestHandler): RequestHandler => async (
  request,
  response,
  next
) => {
  try {
    await handler(request, response, next)
  } catch (error) {
    return next(error)
  }
}

export const fixOperators = (data: object) => {
  const normalise = (match: string) => `$${match.toLowerCase()}`
  const operators = /\b(gte|gt|lte|lt|eq|neq|in|nin)\b/gi
  const roughWork = JSON.stringify(data)
  const resultSet = roughWork.replace(operators, normalise)
  const values = JSON.parse(resultSet)
  return values
}

export const getFilters = (values: object, fields: string[]) => {
  const isInFields = (value: string, key: string) => fields.includes(key)
  const filtered = pickBy(isInFields, values) as object
  const resultSet = fixOperators(filtered)
  return resultSet
}

const getQueryValues = (fieldName: string, defaultValue: string) => (
  query: object = {}
) => {
  const string = pathOr(defaultValue, [fieldName], query)
  const values = string.split(/,/)
  const result = values.join(' ')
  return result
}

export const getProjection = getQueryValues('fields', '-__v')
export const getSortFields = getQueryValues('sort', '-createdAt')

export const getLimitCount = (
  query: object,
  defaultValue: number = Number.MAX_SAFE_INTEGER
) => {
  const limit = +pathOr(defaultValue, ['limit'], query)
  return limit
}

export const getPageCount = (query: object, defaultValue = 1) => {
  const data = pathOr(defaultValue, ['page'], query)
  const page = Math.max(data, 1)
  return page
}

export const getSkipCount = (query: object) => {
  const limit = getLimitCount(query)
  const page = getPageCount(query)
  const skip = (page - 1) * limit
  return skip
}

export const buildEmailOptions = (
  request: Request,
  resetToken: string
): EmailOptions => {
  const url = [
    `${request.protocol}://`,
    request.get('host'),
    '/api/v1/users/reset-password/',
    resetToken,
  ].join('')
  const from = 'admin@natours.com'
  const to = request.body.email
  const subject = 'Natours - Password Reset (Only valid for 10 mins)'
  const text = `
  Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${url}
  If you didn't request a password reset, please ignore this email
  `
  const emailOptions = { from, to, subject, text }
  return emailOptions
}

export interface EmailOptions {
  from: string
  to: string
  subject: string
  text: string
}

export const sendEmail = async (emailOptions: EmailOptions) => {
  const environment = new Environment(process.env)
  const variables = environment.getEmailVariables()
  const host = variables.EMAIL_HOST
  const port = variables.EMAIL_PORT
  const user = variables.EMAIL_USER
  const pass = variables.EMAIL_PASS
  const transporterOptions = { host, port, auth: { user, pass } }
  const transporter = nodemailer.createTransport(transporterOptions)
  const result = await transporter.sendMail(emailOptions)
  console.log('--> result is ', result)
}

export const buildAccessToken = (id: string) => {
  const environment = new Environment(process.env)
  const variables = environment.getJwtVariables()
  const { JWT_SECRET_KEY: secretKey, JWT_EXPIRES_IN: expiresIn } = variables
  const options = { expiresIn }
  const token = jsonwebtoken.sign({ id }, secretKey, options)
  return token
}

export const decodeAccessToken = (token: string, secretKey: string) => {
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

export const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex')
