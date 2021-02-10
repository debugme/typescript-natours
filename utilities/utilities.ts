import { StatusCodes } from 'http-status-codes'
import { RequestHandler } from 'express'
import { pathOr, pickBy } from 'ramda'
import jwt from 'jsonwebtoken'

import { Environment } from '../environment/environment'

export class ServerError extends Error {
  public status: string = ''
  constructor(message: string, private statusCode: number) {
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

export const tryCatch = (
  handler: RequestHandler,
  statusCode = StatusCodes.BAD_REQUEST
): RequestHandler => async (request, response, next) => {
  try {
    await handler(request, response, next)
  } catch (error) {
    const message = error.toString()
    const serverError = new ServerError(message, statusCode)
    return next(serverError)
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

export const buildToken = (id: string) => {
  const environment = new Environment(process.env)
  const jwtVariables = environment.getJwtVariables()
  const { JWT_SECRET_KEY: secretKey, JWT_EXPIRES_IN: expiresIn } = jwtVariables
  const options = { expiresIn }
  const token = jwt.sign({ id }, secretKey, options)
  return token
}
