import { UserDocument } from '../../models/user'
import { EnvironmentVariables } from '../../environment/environment'

declare global {
  namespace Express {
    interface Request {
      // Extend Express.Request to have a field called user of type UserDocument
      user: UserDocument
    }
  }
  namespace NodeJS {
    // Extend process.env to have all fields defined in EnvironmentVariables
    interface ProcessEnv extends EnvironmentVariables {}
  }
}
