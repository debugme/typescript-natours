import http from 'http'
import morgan from 'morgan'
import express, { ErrorRequestHandler, Express, Router } from 'express'

import {
  Environment,
  ExpressVariables,
  NodeVariables,
} from '../environment/environment'

export class Server {
  private httpServer?: http.Server
  private server: Express = express()
  private variables: ExpressVariables & NodeVariables
  constructor(environment: Environment) {
    this.variables = {
      ...environment.getNodeVariables(),
      ...environment.getExpressVariables(),
    }
    this.server.use(morgan('dev'))
    this.server.use(express.json())
    this.server.use(express.urlencoded({ extended: true }))
    this.server.use(express.static(`${this.variables.PWD}/public`))
  }

  public handleRoute = (path: string, router: Router) => {
    this.server.use(path, router)
  }

  public handleError = (handler: ErrorRequestHandler) => {
    this.server.use(handler)
  }

  public connect = () => {
    const { EXPRESS_PORT } = this.variables
    const listener = () => console.log('[server] connected...')
    this.httpServer = this.server.listen(EXPRESS_PORT, listener)
  }

  public disconnect = () => {
    const promise = new Promise((resolve, reject) => {
      if (this.httpServer) {
        this.httpServer.close(() => {
          console.log('[server] disconnected...')
          resolve(null)
        })
      } else {
        reject('error - already disconnected')
      }
    })
    return promise
  }
}
