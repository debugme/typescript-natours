import { Server } from './server/server'
import { Database } from './database/database'
import { Environment } from './environment/environment'
import { buildTourRouter } from './routers/tour'
import { buildUserRouter } from './routers/user'
import { defaultRouter } from './controllers/default'
import { errorHandler } from './controllers/error'
import { Emailer } from './emailer/emailer'

const environment = new Environment(process.env)

const emailer = new Emailer(environment)

const database = new Database(environment)
database.connect()

const server = new Server(environment)
server.handleRoute('/api/v1/tours', buildTourRouter(environment))
server.handleRoute('/api/v1/users', buildUserRouter(environment, emailer))
server.handleRoute('*', defaultRouter)
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
