import { ErrorRequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { StatusTexts } from '../utilities/controllerUtils'

export const errorHandler: ErrorRequestHandler = (
  error: any,
  request: any,
  response: any,
  next: any
) => {
  error.statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  error.status = error.status || StatusTexts.ERROR
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  })
}
