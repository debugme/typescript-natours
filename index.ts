import { Server } from './server/server'
import { Database } from './database/database'
import { buildTourRouter } from './routers/tourRouter'
import { buildUserRouter } from './routers/userRouter'
import { defaultRouter } from './controllers/defaultController'
import { errorHandler } from './controllers/errorHandler'
import { Services } from './services'

const services = new Services(process)

const database = new Database(services)
database.connect()

const server = new Server(services)
server.handleRequest('/api/v1/tours', buildTourRouter(services))
server.handleRequest('/api/v1/users', buildUserRouter(services))
server.handleRequest('*', defaultRouter)
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

// const runtime = new Runtime(process, database, server)
// runtime.connect()

// interface Disconnectable {
//   disconnect: () => {}
// }

// class Runtime {
//   constructor(
//     private process: NodeJS.Process,
//     ...disconnectables: Disconnectable[]
//   ) {
//     this.disconnectables = disconnectables
//   }
//   connect = () => {
//     this.process.on('uncaughtException', this.cleanUp)
//     this.process.on('unhandledRejection', this.cleanUp)
//   }
//   cleanUp = async (error: Error) => {
//     await database.disconnect()
//     await server.disconnect()
//     await new Promise((resolve) => {
//       console.log('[process] terminating...', error)
//       resolve(this.process.exit(1))
//     })
//   }
// }
