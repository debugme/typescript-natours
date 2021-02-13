import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { omit, pick } from 'ramda'
import {
  StatusTexts,
  tryCatch,
  ServerError,
} from '../utilities/controllerUtils'
import {
  buildAccessToken,
  hashResetToken,
  decodeAccessToken,
} from '../utilities/tokenUtils'
import { User, UserDocument } from '../models/user'
import { Environment } from '../environment/environment'
import { Emailer } from '../emailer/emailer'

const validateSignUp = tryCatch(async (request, response, next) => {
  try {
    const fields = [
      'name',
      'email',
      'password',
      'passwordConfirm',
      'role',
      'photo',
    ]
    const data = await User.create(pick(fields, request.body))
    const user = omit(['password'], data.toJSON())
    request.body.user = user
  } catch (error) {
    throw new ServerError(error.message)
  }
  next()
})

const signUp = (environment: Environment) =>
  tryCatch(async (request, response) => {
    const { user } = request.body
    const accessToken = buildAccessToken(environment, user.id)
    const status = StatusTexts.SUCCESS
    const cargo = { status, accessToken, data: { user } }
    response.status(StatusCodes.CREATED).json(cargo)
  })

const validateSignIn = tryCatch(async (request, response, next) => {
  const { email, password } = request.body
  if (!email) throw new ServerError('Please provide an e-mail')
  if (!password) throw new ServerError('Please provide a password')
  const user = await User.findOne({ email }).select('+password')
  if (!user) throw new ServerError('Please provide known email')
  const isCorrectPassword = await user.isCorrectPassword(password)
  if (!isCorrectPassword)
    throw new ServerError('Please provide correct password')
  request.body.user = user
  next()
})

const signIn = (environment: Environment) =>
  tryCatch(async (request, response) => {
    const userId = request.body.user.id
    const accessToken = buildAccessToken(environment, userId)
    const status = StatusTexts.SUCCESS
    const cargo = { status, accessToken }
    response.status(StatusCodes.OK).json(cargo)
  })

const validateIsAuthenticated = (environment: Environment) =>
  tryCatch(async (request, response, next) => {
    const { authorization } = request.headers
    if (!authorization)
      throw new ServerError('Please provide authorization header')

    if (!authorization.toLowerCase().startsWith('bearer'))
      throw new ServerError('Please provide correct authorization header')

    const [_, accessToken] = authorization.split(' ')
    if (!accessToken)
      throw new ServerError('Please make sure you are logged in')

    const jwtVariables = environment.getJwtVariables()
    const { JWT_SECRET_KEY: secretKey } = jwtVariables
    const decoded = decodeAccessToken(accessToken, secretKey)
    if (!decoded)
      throw new ServerError('Access token has expired or been tampered with')

    const user = await User.findById(decoded.id)
    if (!user) throw new ServerError('User does not exist')
    if (user.isStaleAccessToken(decoded.iat)) {
      throw new Error(
        'Password updated since access token was generated. Please login again.'
      )
    }

    request.body.user = user
    next()
  })

const validateIsAuthorised = (...roles: string[]) => {
  return tryCatch(async (request, response, next) => {
    if (!roles.includes(request.body.user.role))
      throw new ServerError(
        'User not allowed to perform this operation',
        StatusCodes.UNAUTHORIZED
      )
    next()
  })
}

const validateForgotPassword = tryCatch(async (request, response, next) => {
  const { email } = request.body
  if (!email) throw new ServerError('Please provide an email address')
  const user = await User.findOne({ email })
  if (!user) throw new ServerError('No user found with that email address')
  request.body.user = user
  next()
})

const forgotPassword = (environment: Environment, emailer: Emailer) => {
  const buildOptions = (request: Request, resetToken: string) => {
    const url = [
      `${request.protocol}://`,
      request.get('host'),
      '/api/v1/users/reset-password/',
      resetToken,
    ].join('')
    const from = 'admin@natours.com'
    const to = request.body.email
    const subject = 'Natours - Password Reset (Only valid for 10 mins)'
    const text = `
    Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${url}
    If you didn't request a password reset, please ignore this email
    `
    const emailOptions = { from, to, subject, text }
    return emailOptions
  }

  return tryCatch(async (request, response) => {
    const { user, email } = request.body
    try {
      const resetToken = user.setPasswordResetFields()
      await user.save({ validateBeforeSave: false })
      const emailOptions = buildOptions(request, resetToken)
      await emailer.sendEmail(emailOptions)
      const status = StatusTexts.SUCCESS
      const message = `password reset link sent to ${email} (Only valid for the next 10 mins)`
      const cargo = { status, resetToken, message }
      response.status(StatusCodes.OK).json(cargo)
    } catch (error) {
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false })
      throw new ServerError('Unable to send password reset email')
    }
  })
}

const validateResetPassword = tryCatch(async (request, response, next) => {
  const { resetToken } = request.params
  const passwordResetToken = hashResetToken(resetToken)
  const passwordResetExpires = { $gt: new Date() }
  const filters = { passwordResetToken, passwordResetExpires }
  const user = await User.findOne(filters)
  if (!user)
    throw new ServerError('Password reset token is either invalid or expired')
  request.body.user = user
  next()
})

const resetPassword = (environment: Environment) =>
  tryCatch(async (request, response) => {
    const { password, passwordConfirm, user } = request.body
    user.resetPassword(password, passwordConfirm)
    await user.save()
    const accessToken = buildAccessToken(environment, user.id)
    const status = StatusTexts.SUCCESS
    const cargo = { status, accessToken }
    response.status(StatusCodes.OK).json(cargo)
  })

const validateUpdatePassword = tryCatch(async (request, response, next) => {
  const { id } = request.body.user
  const { oldPassword, newPassword, newPasswordConfirm } = request.body
  const user = await User.findById(id).select('+password')
  if (!user) throw new ServerError('User does not exist')

  const isCorrectPassword = await user.isCorrectPassword(oldPassword)
  if (!isCorrectPassword)
    throw new ServerError('Existing password is not correct')

  if (!newPassword) throw new ServerError('Proposed password is missing')

  if (!newPasswordConfirm)
    throw new ServerError('Proposed password confirm is missing')

  if (newPassword !== newPasswordConfirm)
    throw new ServerError(
      'Please make sure newPassword and newPasswordConfirm match'
    )
  next()
})

const updatePassword = (environment: Environment) =>
  tryCatch(async (request, response) => {
    const { id } = request.body.user
    const { newPassword, newPasswordConfirm } = request.body

    const user = (await User.findById(id).select('+password')) as UserDocument
    user.password = newPassword
    user.passwordConfirm = newPasswordConfirm
    user.save()

    const accessToken = buildAccessToken(environment, id)
    const status = StatusTexts.SUCCESS
    const cargo = { status, accessToken }
    response.status(StatusCodes.OK).json(cargo)
  })

export const authController = {
  validateSignUp,
  signUp,
  validateSignIn,
  signIn,
  validateIsAuthenticated,
  validateIsAuthorised,
  validateForgotPassword,
  forgotPassword,
  validateResetPassword,
  resetPassword,
  validateUpdatePassword,
  updatePassword,
}
