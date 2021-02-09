import express, {
  ErrorRequestHandler,
  Express,
  RequestHandler,
  Router,
} from 'express'
import http from 'http'
import morgan from 'morgan'
import { ExpressVariables } from '../environment/environment'

export class Server {
  private httpServer: http.Server | undefined
  private server: Express = express()
  constructor(private variables: ExpressVariables) {
    const { PWD } = this.variables
    this.server.use(morgan('dev'))
    this.server.use(express.json())
    this.server.use(express.urlencoded({ extended: true }))
    this.server.use(express.static(`${PWD}/public`))
  }
  public handleRoute = (path: string, router: Router) => {
    this.server.use(path, router)
  }
  public handleError = (handler: ErrorRequestHandler) => {
    this.server.use(handler)
  }
  public connect = () => {
    const { EXPRESS_PORT } = this.variables
    const text = `[server] connected...`
    const listener = () => console.info(text)
    this.httpServer = this.server.listen(EXPRESS_PORT, listener)
  }
  public disconnect = () => {
    const promise = new Promise((resolve, reject) => {
      if (this.httpServer)
        this.httpServer.close(() => {
          console.log('[server] disconnected...')
          resolve(null)
        })
    })
    return promise
  }
}
