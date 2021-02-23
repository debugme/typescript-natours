import { Server } from './server/server'
import { Database } from './database/database'
import { buildTourRouter } from './routers/tourRouter'
import { buildUserRouter } from './routers/userRouter'
import { buildAuthRouter } from './routers/authRouter'
import { buildDefaultRouter } from './routers/defaultRouter'
import { errorHandler } from './controllers/errorHandler'
import { Services } from './services/services'
import { Runtime } from './services/runtime'

const services = new Services(process)

const database = new Database(services)
database.connect()

const server = new Server(services)
server.handleRequest('/api/v1/tours', buildTourRouter)
server.handleRequest('/api/v1/users', buildUserRouter)
server.handleRequest('/api/v1/auth', buildAuthRouter)
server.handleRequest('*', buildDefaultRouter)
server.handleError(errorHandler)
server.connect()

const runtime = new Runtime(services)
runtime.onError(database.disconnect)
runtime.onError(server.disconnect)
runtime.connect()
