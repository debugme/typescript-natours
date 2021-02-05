import express from 'express'
import chalk from 'chalk'
import dotenv from 'dotenv'
import morgan from 'morgan'
import mongoose from 'mongoose'

import { toursRouter } from './routers/tours'
import { usersRouter } from './routers/users'

dotenv.config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development',
})

const {
  env: {
    MONGO_PROTOCOL = '',
    MONGO_USERNAME = '',
    MONGO_PASSWORD = '',
    MONGO_HOSTNAME = '',
    MONGO_DATABASE = '',
  },
} = process

const MONGO_CREDENTIALS =
  MONGO_USERNAME && MONGO_PASSWORD ? `${MONGO_USERNAME}:${MONGO_PASSWORD}@` : ''

const mongoUri = `${MONGO_PROTOCOL}${MONGO_CREDENTIALS}${MONGO_HOSTNAME}/${MONGO_DATABASE}?retryWrites=true&w=majority`

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}

mongoose
  .connect(mongoUri, options)
  .then((connection) => {
    const { name, host, port, user, pass } = connection.connections[0]
    console.info(
      `connection: \nname:${name}\nhost:${host}\nport:${port}\nuser:${user}\npass:${pass}`
    )
  })
  .catch((error) => console.error(error))

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
