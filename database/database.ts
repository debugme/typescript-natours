import mongoose from 'mongoose'
import { MongoVariables } from '../environment/environment'

export class Database {
  public static connect = async (variables: MongoVariables) => {
    try {
      const mongoUri = Database.getUri(variables)
      const options = Database.getOptions()
      await mongoose.connect(mongoUri, options)
      console.info('[database] connected successfully!')
    } catch (error) {
      console.error('[database] could not connect: ', error)
    }
  }
  private static getOptions = () => {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
    return options
  }
  private static getUri = (variables: MongoVariables) => {
    const {
      MONGO_PROTOCOL,
      MONGO_USERNAME,
      MONGO_PASSWORD,
      MONGO_HOSTNAME,
      MONGO_DATABASE,
    } = variables
    const MONGO_CREDENTIALS =
      MONGO_USERNAME && MONGO_PASSWORD
        ? `${MONGO_USERNAME}:${MONGO_PASSWORD}@`
        : ''

    const mongoUri = `${MONGO_PROTOCOL}${MONGO_CREDENTIALS}${MONGO_HOSTNAME}/${MONGO_DATABASE}?retryWrites=true&w=majority`
    return mongoUri
  }
}
