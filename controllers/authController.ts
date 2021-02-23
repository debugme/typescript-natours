import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { pick } from 'ramda'
import { StatusTexts, tryCatch, ServerError } from './utilities'
import {
  buildAccessToken,
  hashResetToken,
  decodeAccessToken,
  buildCookieOptions,
} from '../utilities/tokenUtils'
import { UserModel } from '../models/userModel'
import { Services } from '../services/services'

const validateSignUp = (services: Services) =>
  tryCatch(async (request, response, next) => {
    try {
      const { context } = services

      //------------------------------------------------------------------------------
      // FIXME: add AJV/JOI validation instead
      //------------------------------------------------------------------------------
      // if invalid value for request.body.name provided then throw an exception
      // if invalid value for request.body.email provided then throw an exception
      // if invalid value for request.body.password provided then throw an exception
      // if invalid value for request.body.passwordConfirm provided then throw an exception
      //------------------------------------------------------------------------------

      const fields = 'name,email,password,passwordConfirm,role,photo'.split(',')
      const values = pick(fields, request.body)
      const newUser = await UserModel.create(values)
      const user = await UserModel.findById(newUser.id)
      if (!user) throw new Error(`Unable to find newly created user`)
      const accessToken = buildAccessToken(services, user.id)
      const cookieOptions = buildCookieOptions(services)
      context.setUserDocument(user)
      context.setAccessToken(accessToken)
      context.setCookieOptions(cookieOptions)
      next()
    } catch (error) {
      throw new ServerError(error.message)
    }
  })

const signUp = (services: Services) =>
  tryCatch(async (request, response) => {
    const { context } = services
    const user = context.getUserDocument()
    const accessToken = context.getAccessToken()
    const cookieOptions = context.getCookieOptions()
    const status = StatusTexts.SUCCESS
    const cargo = { status, data: { user } }
    response.cookie('accessToken', accessToken, cookieOptions)
    response.status(StatusCodes.CREATED).json(cargo)
  })

const validateSignIn = (services: Services) =>
  tryCatch(async (request, response, next) => {
    const { context } = services

    // FIXME: replace with JAV/JOI validation instead
    //------------------------------------------------------------------------------
    const { email, password } = request.body
    if (!email) throw new ServerError('Please provide an e-mail')
    if (!password) throw new ServerError('Please provide a password')
    //------------------------------------------------------------------------------

    const foundUser = await UserModel.findOne({ email }).select('+password')
    if (!foundUser) throw new ServerError('Please provide known email')
    const isCorrectPassword = await foundUser.isCorrectPassword(password)
    if (!isCorrectPassword)
      throw new ServerError('Please provide correct password')
    const user = await UserModel.findById(foundUser.id)
    if (!user) throw new Error(`Unable to find user`)
    const accessToken = buildAccessToken(services, user.id)
    const cookieOptions = buildCookieOptions(services)
    context.setUserDocument(user)
    context.setAccessToken(accessToken)
    context.setCookieOptions(cookieOptions)
    next()
  })

const signIn = (services: Services) =>
  tryCatch(async (request, response) => {
    const { context } = services
    const user = context.getUserDocument()
    const accessToken = context.getAccessToken()
    const cookieOptions = context.getCookieOptions()
    const status = StatusTexts.SUCCESS
    const cargo = { status, data: { user } }
    response.cookie('accessToken', accessToken, cookieOptions)
    response.status(StatusCodes.OK).json(cargo)
  })

const validateIsAuthenticated = (services: Services) =>
  tryCatch(async (request, response, next) => {
    const { environment, context } = services

    // FIXME: replace with JAV/JOI validation instead
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

    const user = await UserModel.findById(decoded.id).select('+password')
    if (!user) throw new ServerError('User does not exist')
    if (user.isStaleAccessToken(decoded.iat)) {
      throw new Error(
        'Password updated since access token was generated. Please login again.'
      )
    }
    context.setUserDocument(user)
    next()
  })

const validateIsAuthorised = (services: Services, ...roles: string[]) =>
  tryCatch(async (request, response, next) => {
    const { context } = services
    const role = context.getUserDocument().role.toString()
    if (!roles.includes(role))
      throw new ServerError(
        'User not allowed to perform this operation',
        StatusCodes.UNAUTHORIZED
      )
    next()
  })

const validateForgotPassword = (services: Services) =>
  tryCatch(async (request, response, next) => {
    const { context } = services

    //------------------------------------------------------------------------------
    // FIXME: replace with JAV/JOI validation instead
    //------------------------------------------------------------------------------
    const { email } = request.body
    if (!email) throw new ServerError('Please provide an email address')
    //------------------------------------------------------------------------------

    const user = await UserModel.findOne({ email })
    if (!user) throw new ServerError('No user found with that email address')
    context.setUserDocument(user)
    next()
  })

const forgotPassword = (services: Services) => {
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
    const { context, emailer } = services
    const user = context.getUserDocument()
    try {
      const { email } = request.body
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

const validateResetPassword = (services: Services) =>
  tryCatch(async (request, response, next) => {
    const { context } = services
    const { resetToken } = request.params
    const passwordResetToken = hashResetToken(resetToken)
    const passwordResetExpires = { $gt: new Date() }
    const filters = { passwordResetToken, passwordResetExpires }
    const user = await UserModel.findOne(filters)
    if (!user)
      throw new ServerError('Password reset token is either invalid or expired')
    const accessToken = buildAccessToken(services, user.id)
    const cookieOptions = buildCookieOptions(services)
    context.setUserDocument(user)
    context.setAccessToken(accessToken)
    context.setCookieOptions(cookieOptions)
    next()
  })

const resetPassword = (services: Services) =>
  tryCatch(async (request, response) => {
    const { context } = services
    const user = context.getUserDocument()
    const { password, passwordConfirm } = request.body
    user.resetPassword(password, passwordConfirm)
    await user.save()
    const accessToken = context.getAccessToken()
    const cookieOptions = context.getCookieOptions()
    const status = StatusTexts.SUCCESS
    const cargo = { status, accessToken }
    response.cookie('accessToken', accessToken, cookieOptions)
    response.status(StatusCodes.OK).json(cargo)
  })

const validateUpdatePassword = (services: Services) =>
  tryCatch(async (request, response, next) => {
    const { context } = services
    const { oldPassword, newPassword, newPasswordConfirm } = request.body

    //------------------------------------------------------------------------------
    // FIXME: replace with JAV/JOI validation instead
    //------------------------------------------------------------------------------
    if (!oldPassword) throw new ServerError('Current password is missing')
    if (!newPassword) throw new ServerError('Proposed password is missing')
    if (!newPasswordConfirm)
      throw new ServerError('Proposed password confirm is missing')
    if (newPassword !== newPasswordConfirm)
      throw new ServerError(
        'Please make sure newPassword and newPasswordConfirm match'
      )
    //------------------------------------------------------------------------------

    const user = context.getUserDocument()
    const isCorrectPassword = await user.isCorrectPassword(oldPassword)
    if (!isCorrectPassword)
      throw new ServerError('Existing password is not correct')

    const accessToken = buildAccessToken(services, user.id)
    const cookieOptions = buildCookieOptions(services)
    context.setAccessToken(accessToken)
    context.setCookieOptions(cookieOptions)
    next()
  })

const updatePassword = (services: Services) =>
  tryCatch(async (request, response) => {
    const { context } = services
    const user = context.getUserDocument()
    const { newPassword, newPasswordConfirm } = request.body
    user.password = newPassword
    user.passwordConfirm = newPasswordConfirm
    user.save()
    const accessToken = context.getAccessToken()
    const cookieOptions = context.getCookieOptions()
    const status = StatusTexts.SUCCESS
    const cargo = { status, accessToken }
    response.cookie('accessToken', accessToken, cookieOptions)
    response.status(StatusCodes.OK).json(cargo)
  })

const validateUpdateUser = (services: Services) =>
  tryCatch(async (request, response, next) => {
    const { password, passwordConfirm } = request.body

    //------------------------------------------------------------------------------
    // FIXME: replace with JAV/JOI validation instead
    //------------------------------------------------------------------------------
    if (password)
      throw new ServerError(
        'Please use PATCH api/v1/users/update-password to update password'
      )
    if (passwordConfirm)
      throw new ServerError(
        'Please use PATCH api/v1/users/update-password to update passwordConfirm'
      )
    //------------------------------------------------------------------------------

    next()
  })

const updateUser = (services: Services) =>
  tryCatch(async (request, response) => {
    const { context } = services
    const { body } = request
    const fields = pick(['name', 'email'], body)
    const userId = context.getUserDocument().id
    const options = { new: true, runValidators: true }
    const user = await UserModel.findByIdAndUpdate(userId, fields, options)
    const status = StatusTexts.SUCCESS
    const cargo = { status, data: { user } }
    response.status(StatusCodes.OK).json(cargo)
  })

const deleteUser = (services: Services) =>
  tryCatch(async (request, response) => {
    const { context } = services
    const userId = context.getUserDocument().id
    const filters = { isActive: false }
    const user = await UserModel.findByIdAndUpdate(userId, filters)
    const status = StatusTexts.SUCCESS
    const cargo = { status, data: { user } }
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
  validateUpdateUser,
  updateUser,
  deleteUser,
}
