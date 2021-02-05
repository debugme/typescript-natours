import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

export enum StatusTexts {
  SUCCESS = 'success',
  FAILURE = 'failure',
  ERROR = 'error',
}

export const tryCatch = (
  handler: RequestHandler,
  code = StatusCodes.BAD_REQUEST
): RequestHandler => async (request, response, next) => {
  try {
    await handler(request, response, next)
  } catch (error) {
    const status = StatusTexts.FAILURE
    const message = error.toString()
    const payload = { status, message }
    response.status(code).json(payload)
  }
}
