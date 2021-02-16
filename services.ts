import { Environment } from './environment/environment'
import { Emailer } from './emailer/emailer'

export class Services {
  public environment: Environment
  public emailer: Emailer
  constructor(process: NodeJS.Process) {
    this.environment = new Environment(process.env)
    this.emailer = new Emailer(this.environment)
  }
}
