import { Server } from './server/server'
import { Database } from './database/database'
import { Environment } from './environment/environment'
import { buildTourRouter } from './routers/tourRouter'
import { buildUserRouter } from './routers/userRouter'
import { defaultRouter } from './controllers/defaultController'
import { errorHandler } from './controllers/errorHandler'
import { Emailer } from './emailer/emailer'
import { buildReviewRouter } from './routers/reviewRouter'

const environment = new Environment(process.env)

const emailer = new Emailer(environment)

const database = new Database(environment)
database.connect()

const server = new Server(environment)
server.handleRequest('/api/v1/tours', buildTourRouter(environment))
server.handleRequest('/api/v1/users', buildUserRouter(environment, emailer))
server.handleRequest('/api/v1/reviews', buildReviewRouter(environment))
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
