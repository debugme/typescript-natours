import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { ServerError } from '../utilities/utilities'

export const defaultRouter = express.Router()
defaultRouter.all('', (request, response, next) => {
  const message = `Error - cannot find ${request.originalUrl} on server`
  const statusCode = StatusCodes.NOT_FOUND
  next(new ServerError(message, statusCode))
})
