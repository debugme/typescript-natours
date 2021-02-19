import { StatusCodes } from 'http-status-codes'
import { ServerError, tryCatch } from '../utilities/controllerUtils'

const unknownRoute = tryCatch((request, response) => {
  const message = `Error - cannot find ${request.originalUrl} on server`
  const statusCode = StatusCodes.NOT_FOUND
  throw new ServerError(message, statusCode)
})

export const defaultController = {
  unknownRoute,
}
