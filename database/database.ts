import mongoose from 'mongoose'
import { Environment, MongoVariables } from '../environment/environment'

export class Database {
  private mongoUri: string
  private options: object
  private variables: MongoVariables

  constructor(environment: Environment) {
    this.variables = environment.getMongoVariables()
    this.mongoUri = this.getUri()
    this.options = this.getOptions()
  }

  public connect = async () => {
    await mongoose.connect(this.mongoUri, this.options)
    console.log('[database] connected...')
  }

  public disconnect = async () => {
    await mongoose.disconnect()
    console.log('[database] disconnected...')
  }

  private getOptions = () => {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
    return options
  }

  private getUri = () => {
    const {
      MONGO_PROTOCOL,
      MONGO_USERNAME,
      MONGO_PASSWORD,
      MONGO_HOSTNAME,
      MONGO_DATABASE,
    } = this.variables
    const MONGO_CREDENTIALS =
      MONGO_USERNAME && MONGO_PASSWORD
        ? `${MONGO_USERNAME}:${MONGO_PASSWORD}@`
        : ''

    const mongoUri = `${MONGO_PROTOCOL}${MONGO_CREDENTIALS}${MONGO_HOSTNAME}/${MONGO_DATABASE}?retryWrites=true&w=majority`
    return mongoUri
  }
}
