import { Server } from './server/server'
import { Database } from './database/database'
import { buildTourRouter } from './routers/tourRouter'
import { buildUserRouter } from './routers/userRouter'
import { buildAuthRouter } from './routers/authRouter'
import { buildDefaultRouter } from './routers/defaultRouter'
import { errorHandler } from './controllers/errorHandler'
import { Services } from './services/services'

const services = new Services(process)

const database = new Database(services)
database.connect()

const server = new Server(services)
server.handleRequest('/api/v1/tours', buildTourRouter(services))
server.handleRequest('/api/v1/users', buildUserRouter(services))
server.handleRequest('/api/v1/auth', buildAuthRouter(services))
server.handleRequest('*', buildDefaultRouter(services))
server.handleError(errorHandler)
server.connect()

const cleanUp = async (error: Error) => {
  await database.disconnect()
  await server.disconnect()
  await new Promise((resolve) => {
    console.log('[process] terminating...', error)
    resolve(process.exit(1))
  })
}
process.on('uncaughtException', cleanUp)
process.on('unhandledRejection', cleanUp)
