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

export interface JwtVariables {
  JWT_SECRET_KEY: string
  JWT_EXPIRES_IN: string
}

export interface EmailVariables {
  EMAIL_HOST: string
  EMAIL_PORT: number
  EMAIL_USER: string
  EMAIL_PASS: string
}

export class Environment {
  constructor(private environment: NodeJS.ProcessEnv) {
    const { PWD, NODE_ENV } = environment
    const path = `${PWD}/environment/.${NODE_ENV}.env`
    dotenv.config({ path })
  }

  public getExpressVariables = (): ExpressVariables => {
    const properties = ['EXPRESS_PORT', 'PWD']
    const environment = (this.environment as unknown) as ExpressVariables
    const variables = pick(properties, environment)
    return variables
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

  public getJwtVariables = (): JwtVariables => {
    const properties = ['JWT_SECRET_KEY', 'JWT_EXPIRES_IN']
    const environment = (this.environment as unknown) as JwtVariables
    const variables = pick(properties, environment)
    return variables
  }

  public getEmailVariables = (): EmailVariables => {
    const properties = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS']
    const environment = (this.environment as unknown) as EmailVariables
    const variables = pick(properties, environment)
    return variables
  }

  // TODO: replace all your custom getXXXVariables with a generic one
  // public getVariables = <T, V>(): T => {
  //   const properties = ['EMAIL_USERNAME', 'EMAIL_PASSWORD']
  //   const environment = (this.environment as unknown) as T
  //   const variables = pick(properties, environment) as T
  //   return variables
  // }
}
