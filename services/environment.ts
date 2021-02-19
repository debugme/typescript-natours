import dotenv from 'dotenv'
import { pick } from 'ramda'

export interface NodeVariables {
  PWD: string
  NODE_ENV: string
}

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

export interface JwtVariables {
  JWT_SECRET_KEY: string
  JWT_EXPIRES_IN: string
  COOKIE_EXPIRES_IN: string
}

export interface EmailVariables {
  EMAIL_HOST: string
  EMAIL_PORT: number
  EMAIL_USER: string
  EMAIL_PASS: string
}

export interface EnvironmentVariables
  extends NodeVariables,
    ExpressVariables,
    MongoVariables,
    JwtVariables,
    EmailVariables {}

export class Environment {
  private environment: EnvironmentVariables
  constructor(environment: NodeJS.ProcessEnv) {
    this.environment = environment
    const { PWD, NODE_ENV } = this.getNodeVariables()
    const path = `${PWD}/.${NODE_ENV}.env`
    dotenv.config({ path })
  }

  public getNodeVariables = (): NodeVariables => {
    const fields = ['NODE_ENV', 'PWD']
    return pick(fields, this.environment)
  }

  public getExpressVariables = (): ExpressVariables => {
    const fields = ['EXPRESS_PORT']
    return pick(fields, this.environment)
  }

  public getMongoVariables = (): MongoVariables => {
    const fields = [
      'MONGO_PROTOCOL',
      'MONGO_USERNAME',
      'MONGO_PASSWORD',
      'MONGO_HOSTNAME',
      'MONGO_DATABASE',
    ]
    return pick(fields, this.environment)
  }

  public getJwtVariables = (): JwtVariables => {
    const fields = ['JWT_SECRET_KEY', 'JWT_EXPIRES_IN', 'COOKIE_EXPIRES_IN']
    return pick(fields, this.environment)
  }

  public getEmailVariables = (): EmailVariables => {
    const fields = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS']
    return pick(fields, this.environment)
  }
}
