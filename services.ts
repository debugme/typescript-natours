import { Environment } from './environment/environment'
import { Emailer } from './emailer/emailer'
import { Context } from './context/context'

export class Services {
  public environment: Environment
  public emailer: Emailer
  public context: Context
  constructor(process: NodeJS.Process) {
    this.environment = new Environment(process.env)
    this.emailer = new Emailer(this.environment)
    this.context = new Context()
  }
}
