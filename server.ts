import express from 'express'
import chalk from 'chalk'
import morgan from 'morgan'

import { toursRouter } from './routers/tours'
import { usersRouter } from './routers/users'

const server = express()
server.use(morgan('dev'))
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(express.static(`${process.cwd()}/public`))
server.use('/api/v1/tours', toursRouter)
server.use('/api/v1/users', usersRouter)

const port = process.env.EXPRESS_PORT
const listener = () => console.log(chalk.blue(`[server] port ${port}`))
server.listen(port, listener)
