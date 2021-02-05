import dotenv from 'dotenv'

export interface ExpressVariables {
  EXPRESS_PORT: string
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
    dotenv.config({
      path:
        environment.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    })
  }
  getMongoVariables = (): MongoVariables => {
    const {
      MONGO_PROTOCOL = '',
      MONGO_USERNAME = '',
      MONGO_PASSWORD = '',
      MONGO_HOSTNAME = '',
      MONGO_DATABASE = '',
    } = this.environment

    const mongoVariables: MongoVariables = {
      MONGO_PROTOCOL,
      MONGO_USERNAME,
      MONGO_PASSWORD,
      MONGO_HOSTNAME,
      MONGO_DATABASE,
    }
    return mongoVariables
  }
  getExpressVariables = (): ExpressVariables => {
    const { EXPRESS_PORT = '' } = this.environment
    const expressVariables = { EXPRESS_PORT }
    return expressVariables
  }
}
