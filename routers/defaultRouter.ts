import { Router } from 'express'
import { Services } from '../services/services'
import { defaultController } from '../controllers/defaultController'

export const buildDefaultRouter = (services: Services) => {
  const defaultRouter = Router()
  defaultRouter.all('', defaultController.unknownRoute)
  return defaultRouter
}
