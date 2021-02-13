import nodemailer from 'nodemailer'

import { EmailVariables, Environment } from '../environment/environment'

export interface EmailOptions {
  from: string
  to: string
  subject: string
  text: string
}

export class Emailer {
  private variables: EmailVariables
  constructor(environment: Environment) {
    this.variables = environment.getEmailVariables()
  }
  public sendEmail = async (emailOptions: EmailOptions) => {
    const host = this.variables.EMAIL_HOST
    const port = this.variables.EMAIL_PORT
    const user = this.variables.EMAIL_USER
    const pass = this.variables.EMAIL_PASS
    const transporterOptions = { host, port, auth: { user, pass } }
    const transporter = nodemailer.createTransport(transporterOptions)
    await transporter.sendMail(emailOptions)
  }
}
