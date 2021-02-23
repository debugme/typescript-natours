import { ErrorRequestHandler, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { StatusTexts } from './utilities'

type ErrorType = Error & { statusCode?: number; status?: string }

export const errorHandler: ErrorRequestHandler = (
  error: ErrorType,
  request: Request,
  response: Response
) => {
  error.statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  error.status = error.status || StatusTexts.ERROR
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  })
}
