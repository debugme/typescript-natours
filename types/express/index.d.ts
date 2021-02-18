import { UserDocument } from '../../models/userModel'
import { EnvironmentVariables } from '../../environment/environment'

declare global {
  namespace Express {
    interface Request {
      // Extend Express.Request to allow arbitrary values to be stored
      // FIXME: remove this once you have replaced this with services.context
      context: any
    }
  }
  namespace NodeJS {
    // Extend process.env to have all fields defined in EnvironmentVariables
    interface ProcessEnv extends EnvironmentVariables {}
  }
}
