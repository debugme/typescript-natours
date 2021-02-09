import { Server } from './server/server'
import { Database } from './database/database'
import { Environment } from './environment/environment'
import { toursRouter } from './routers/tours'
import { usersRouter } from './routers/users'
import { defaultRouter } from './controllers/default'
import { errorHandler } from './controllers/error'

const environment = new Environment(process.env)
const mongoVariables = environment.getMongoVariables()
const expressVariables = environment.getExpressVariables()

const database = new Database(mongoVariables)
database.connect()

const server = new Server(expressVariables)
server.handleRoute('/api/v1/tours', toursRouter)
server.handleRoute('/api/v1/users', usersRouter)
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

// throw new Error('bad boyz')
