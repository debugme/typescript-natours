import { UserDocument } from '../../models/user'
import { EnvironmentVariables } from '../../environment/environment'

declare global {
  namespace Express {
    interface Request {
      // Extend Express.Request to reference the currently logged in user
      user: UserDocument
    }
  }
  namespace NodeJS {
    // Extend process.env to have all fields defined in EnvironmentVariables
    interface ProcessEnv extends EnvironmentVariables {}
  }
}
