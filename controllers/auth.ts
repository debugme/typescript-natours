import { StatusCodes } from 'http-status-codes'
import { omit, pick } from 'ramda'
import jwt from 'jsonwebtoken'

import {
  buildToken,
  StatusTexts,
  tryCatch,
  ServerError,
} from '../utilities/utilities'
import { User } from '../models/user'
import { Environment } from '../environment/environment'

const signUp = tryCatch(async (request, response) => {
  const fields = [
    'name',
    'email',
    'photo',
    'password',
    'passwordConfirm',
    'role',
  ]
  const data = await User.create(pick(fields, request.body))
  const user = omit(['password'], data.toJSON())
  const token = buildToken(user.id)
  const status = StatusTexts.SUCCESS
  const cargo = { status, token, data: { user } }
  response.status(StatusCodes.CREATED).json(cargo)
})

const signIn = tryCatch(async (request, response, next) => {
  const { email, password } = request.body
  if (!email)
    return next(
      new ServerError('Please provide an e-mail', StatusCodes.BAD_REQUEST)
    )
  if (!password)
    return next(
      new ServerError('Please provide a password', StatusCodes.BAD_REQUEST)
    )
  const user = await User.findOne({ email }).select('+password')
  if (!user)
    return next(
      new ServerError('Please provide known email', StatusCodes.BAD_REQUEST)
    )

  const isCorrectPassword = await user.isCorrectPassword(password)
  if (!isCorrectPassword)
    return next(
      new ServerError(
        'Please provide correct password',
        StatusCodes.BAD_REQUEST
      )
    )

  const token = buildToken(user.id)
  const status = StatusTexts.SUCCESS
  const cargo = { status, token }
  response.status(StatusCodes.OK).json(cargo)
})

const isAuthenticated = tryCatch(async (request, response, next) => {
  //Case 1: make sure authorization header is in the request
  const {
    headers: { authorization },
  } = request
  if (!authorization) throw new Error('missing authorization header')

  //Case 2: make sure type of authorization is correct
  if (!authorization.toLowerCase().startsWith('bearer'))
    throw new Error('incorrect authorization header')

  //Case 3: make sure token is present in header
  const [_, token] = authorization.split(' ')
  if (!token) throw new Error('user not logged in')

  //Case 4: make sure
  // (a) token has not been tampered with
  // (b) token has not expired yet
  const environment = new Environment(process.env)
  const jwtVariables = environment.getJwtVariables()
  const { JWT_SECRET_KEY: secretKey } = jwtVariables
  const decoded: object = await new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) reject(error)
      else if (decoded) resolve(decoded)
    })
  })

  //Case 5: does user still exist in database
  // @ts-ignore
  const user = await User.findById(decoded.id)
  if (!user) throw new Error('user does not exist')

  //Case 6: has password been updated since token was issued
  // @ts-ignore
  if (user.isPasswordUpdated(decoded.iat)) {
    throw new Error('please login again')
  }

  // @ts-ignore
  // Store the current user for use in isAuthorised()
  request.currentUser = user

  //Default: allow access to protected route
  next()
})

const isAuthorised = (...roles: string[]) => {
  return tryCatch(async (request, response, next) => {
    // @ts-ignore
    if (!roles.includes(request.currentUser.role))
      throw new Error('user not allowed to perform this operation')
    next()
  })
}
export const authController = {
  signUp,
  signIn,
  isAuthenticated,
  isAuthorised,
}
