import express from 'express'
import morgan from 'morgan'

import { Database } from './database/database'
import { Environment } from './environment/environment'
import { toursRouter } from './routers/tours'
import { usersRouter } from './routers/users'

const environment = new Environment(process.env)
const mongoVariables = environment.getMongoVariables()
Database.connect(mongoVariables)

const server = express()
server.use(morgan('dev'))
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(express.static(`${process.cwd()}/public`))
server.use('/api/v1/tours', toursRouter)
server.use('/api/v1/users', usersRouter)
const expressVariables = environment.getExpressVariables()
const port = expressVariables.EXPRESS_PORT
const listener = () => console.info(`[server] port ${port}`)
server.listen(port, listener)
