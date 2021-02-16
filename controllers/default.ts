import express from 'express'
import { StatusCodes } from 'http-status-codes'

import { ServerError, tryCatch } from '../utilities/controllerUtils'

export const defaultRouter = express.Router()
defaultRouter.all(
  '',
  tryCatch((request, response) => {
    const message = `Error - cannot find ${request.originalUrl} on server`
    const statusCode = StatusCodes.NOT_FOUND
    throw new ServerError(message, statusCode)
  })
)
