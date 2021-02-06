import mongoose from 'mongoose'
import { MongoVariables } from '../environment/environment'

export class Database {
  private mongoUri: string
  private options: object
  constructor(private variables: MongoVariables) {
    this.mongoUri = this.getUri(variables)
    this.options = this.getOptions()
  }

  public connect = async () => {
    try {
      await mongoose.connect(this.mongoUri, this.options)
      console.info('[database] connected successfully!')
    } catch (error) {
      console.error('[database] could not connect: ', error)
    }
  }

  // public populate = async () => {
  // .then(async (connection) => import('fs/promises'))
  // .then((fs) => fs.readFile(`dev-data/data/tours-simple.json`, 'utf-8'))
  // .then((data) => JSON.parse(data))
  // .then((tours) => {
  //   Tour.deleteMany()
  //   Tour.create(tours)
  // })
  // .catch((error) => console.error(error))
  // }

  private getOptions = () => {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
    return options
  }

  private getUri = (variables: MongoVariables) => {
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
