// @ts-expect-error
import xssClean from 'xss-clean'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import hpp from 'hpp'
import mongoSanitize from 'express-mongo-sanitize'
import morgan from 'morgan'
import http from 'http'
import express, {
  ErrorRequestHandler,
  Express,
  RequestHandler,
  Router,
} from 'express'

import { Services } from '../services/services'

type BuildRouter = (services: Services) => Router

export class Server {
  private httpServer?: http.Server
  private server: Express = express()
  private services: Services
  constructor(services: Services) {
    this.services = services
    this.setUpMiddleware()
  }

  private setUpMiddleware = () => {
    const { environment } = this.services
    const nodeVariables = environment.getNodeVariables()
    const max = 100 // the number of requests allowed to be made within a window of time
    const windowMs = 60 * 60 * 1000 // a 1 hour window of time
    const message = 'Too many requests. Try again in an hour.'
    const rateLimiter = rateLimit({ max, windowMs, message })
    const limit = '10kb' // only allow JSON request bodies <= 10kb
    const jsonOptions = { limit }
    const urlOptions = { extended: true, limit }
    const pathToStaticFiles = `${nodeVariables.PWD}/public`
    const whitelist = [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ]
    const hppWhitelist = { whitelist }

    this.handleMiddleware(helmet())
    this.handleMiddleware(rateLimiter, '/api')
    this.handleMiddleware(morgan('dev'))
    this.handleMiddleware(express.json(jsonOptions))
    this.handleMiddleware(express.urlencoded(urlOptions))
    this.handleMiddleware(mongoSanitize())
    this.handleMiddleware(xssClean())
    this.handleMiddleware(hpp(hppWhitelist))
    this.handleMiddleware(express.static(pathToStaticFiles))
  }

  public handleMiddleware = (handler: RequestHandler, path: string = '') => {
    if (path) this.server.use(path, handler)
    else this.server.use(handler)
  }

  public handleRequest = (path: string, buildRouter: BuildRouter) => {
    this.server.use(path, buildRouter(this.services))
  }

  public handleError = (handler: ErrorRequestHandler) => {
    this.server.use(handler)
  }

  public connect = () => {
    const { environment } = this.services
    const expressVariables = environment.getExpressVariables()
    const { EXPRESS_PORT } = expressVariables
    const listener = () => console.log('[server] connected...')
    this.httpServer = this.server.listen(EXPRESS_PORT, listener)
  }

  public disconnect = () => {
    const promise = new Promise((resolve, reject) => {
      if (!this.httpServer) return reject('error - already disconnected')
      this.httpServer.close(() => {
        console.log('[server] disconnected...')
        resolve(null)
      })
    })
    return promise
  }
}
