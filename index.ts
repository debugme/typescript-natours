import { Server } from './server/server'
import { Database } from './database/database'
import { buildTourRouter } from './routers/tourRouter'
import { buildUserRouter } from './routers/userRouter'
import { defaultRouter } from './controllers/defaultController'
import { errorHandler } from './controllers/errorHandler'
import { buildReviewRouter } from './routers/reviewRouter'
import { Services } from './services'

const services = new Services(process)

const database = new Database(services)
database.connect()

const server = new Server(services)
server.handleRequest('/api/v1/tours', buildTourRouter(services))
server.handleRequest('/api/v1/users', buildUserRouter(services))
server.handleRequest('/api/v1/reviews', buildReviewRouter(services))
server.handleRequest('*', defaultRouter)
server.handleError(errorHandler)
server.connect()

process.on('uncaughtException', async (error: Error) => {
  await database.disconnect()
  await server.disconnect()
  await new Promise((resolve) => {
    console.log('[process] terminating...', error)
    resolve(process.exit(1))
  })
})

process.on('unhandledRejection', async (error: Error) => {
  await database.disconnect()
  await server.disconnect()
  await new Promise((resolve) => {
    console.log('[process] terminating...', error)
    resolve(process.exit(1))
  })
})
