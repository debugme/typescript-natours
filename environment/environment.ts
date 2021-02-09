import dotenv from 'dotenv'
import { pick } from 'ramda'

export interface ExpressVariables {
  EXPRESS_PORT: string
  PWD: string
}

export interface MongoVariables {
  MONGO_PROTOCOL: string
  MONGO_USERNAME: string
  MONGO_PASSWORD: string
  MONGO_HOSTNAME: string
  MONGO_DATABASE: string
}

export class Environment {
  constructor(private environment: NodeJS.ProcessEnv) {
    const { PWD, NODE_ENV } = environment
    const path = `${PWD}/environment/.${NODE_ENV}.env`
    dotenv.config({ path })
  }

  public getMongoVariables = (): MongoVariables => {
    const properties = [
      'MONGO_PROTOCOL',
      'MONGO_USERNAME',
      'MONGO_PASSWORD',
      'MONGO_HOSTNAME',
      'MONGO_DATABASE',
    ]
    const environment = (this.environment as unknown) as MongoVariables
    const variables = pick(properties, environment)
    return variables
  }
  public getExpressVariables = (): ExpressVariables => {
    const properties = ['EXPRESS_PORT', 'PWD']
    const environment = (this.environment as unknown) as ExpressVariables
    const variables = pick(properties, environment)
    return variables
  }
  // public handleError = (handler: (error: Error) => {}) => {
  //   process.on('uncaughtException', handler)
  //   process.on('unhandledRejection', handler)
  // }
}
