import { UserDocument } from '../models/userModel'

export class Context {
  private user: UserDocument | null = null
  private accessToken: string | null = null
  private cookieOptions: object | null = null
  setUserDocument = (user: UserDocument) => (this.user = user)
  getUserDocument = (): UserDocument => {
    if (!this.user) throw new Error('user was not set in context')
    return this.user
  }
  setAccessToken = (accessToken: string) => (this.accessToken = accessToken)
  getAccessToken = (): string => {
    if (!this.accessToken)
      throw new Error('access token was not set in context')
    return this.accessToken
  }
  setCookieOptions = (cookieOptions: object) =>
    (this.cookieOptions = cookieOptions)
  getCookieOptions = (): object => {
    if (!this.cookieOptions)
      throw new Error('cookie options were not set in context')
    return this.cookieOptions
  }
}
