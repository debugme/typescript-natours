import { StatusCodes } from 'http-status-codes'
import { omit, pick } from 'ramda'
import {
  buildAccessToken,
  StatusTexts,
  tryCatch,
  ServerError,
  sendEmail,
  buildEmailOptions,
  hashToken,
  decodeAccessToken,
} from '../utilities/utilities'
import { User } from '../models/user'
import { Environment } from '../environment/environment'

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

const signUp = tryCatch(async (request, response) => {
  const { user } = request.body
  const token = buildAccessToken(user.id)
  const status = StatusTexts.SUCCESS
  const cargo = { status, token, data: { user } }
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

const signIn = tryCatch(async (request, response) => {
  const userId = request.body.user.id
  const token = buildAccessToken(userId)
  const status = StatusTexts.SUCCESS
  const cargo = { status, token }
  response.status(StatusCodes.OK).json(cargo)
})

const validateIsAuthenticated = tryCatch(async (request, response, next) => {
  const { authorization } = request.headers
  if (!authorization)
    throw new ServerError('Please provide authorization header')

  if (!authorization.toLowerCase().startsWith('bearer'))
    throw new ServerError('Please provide correct authorization header')

  const [_, token] = authorization.split(' ')
  if (!token) throw new ServerError('Please make sure you are logged in')

  const environment = new Environment(process.env)
  const jwtVariables = environment.getJwtVariables()
  const { JWT_SECRET_KEY: secretKey } = jwtVariables
  const decoded = decodeAccessToken(token, secretKey)
  if (!decoded) throw new ServerError('Token has expired or been tampered with')

  const user = await User.findById(decoded.id)
  if (!user) throw new ServerError('User does not exist')
  if (user.isPasswordUpdated(decoded.iat)) {
    throw new Error('Password updated since login. Please login again.')
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

const forgotPassword = tryCatch(async (request, response) => {
  const { user, email } = request.body
  try {
    const resetToken = user.setPasswordResetFields()
    await user.save({ validateBeforeSave: false })
    const emailOptions = buildEmailOptions(request, resetToken)
    await sendEmail(emailOptions)
    const status = StatusTexts.SUCCESS
    const message = `password reset link sent to ${email} (Only valid for the next 10 mins)`
    const cargo = { status, token: resetToken, message }
    response.status(StatusCodes.OK).json(cargo)
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    throw new ServerError('Unable to send password reset email')
  }
})

const validateResetPassword = tryCatch(async (request, response, next) => {
  const { token } = request.params
  const passwordResetToken = hashToken(token)
  const passwordResetExpires = { $gt: new Date() }
  const filters = { passwordResetToken, passwordResetExpires }
  const user = await User.findOne(filters)
  if (!user)
    throw new ServerError('Password reset token is either invalid or expired')
  request.body.user = user
  next()
})

const resetPassword = tryCatch(async (request, response) => {
  const { password, passwordConfirm, user } = request.body
  user.resetPassword(password, passwordConfirm)
  await user.save()
  const token = buildAccessToken(user.id)
  const status = StatusTexts.SUCCESS
  const cargo = { status, token }
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
}
