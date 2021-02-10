import { StatusCodes } from 'http-status-codes'
import { omit, pick } from 'ramda'

import {
  buildToken,
  StatusTexts,
  tryCatch,
  ServerError,
} from '../utilities/utilities'
import { User } from '../models/user'

const signUp = tryCatch(async (request, response) => {
  const fields = ['name', 'email', 'photo', 'password', 'passwordConfirm']
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

export const authController = {
  signUp,
  signIn,
}
