import express, { Express, Router } from 'express'
import morgan from 'morgan'
import { ExpressVariables } from '../environment/environment'

export class Server {
  private server: Express = express()
  constructor(private variables: ExpressVariables) {
    const { PWD } = this.variables
    this.server.use(morgan('dev'))
    this.server.use(express.json())
    this.server.use(express.urlencoded({ extended: true }))
    this.server.use(express.static(`${PWD}/public`))
  }
  public addRoute = (path: string, router: Router) => {
    this.server.use(path, router)
  }
  public connect = () => {
    const { EXPRESS_PORT } = this.variables
    const text = `[server] port ${EXPRESS_PORT}`
    const listener = () => console.info(text)
    this.server.listen(EXPRESS_PORT, listener)
  }
}
