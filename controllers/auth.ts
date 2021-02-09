import { StatusCodes } from 'http-status-codes'
import { pick } from 'ramda'

import { buildToken, StatusTexts, tryCatch } from '../utilities/utilities'
import { User } from '../models/user'

const signUp = tryCatch(async (request, response) => {
  const fields = ['name', 'email', 'photo', 'password', 'passwordConfirm']
  const user = await User.create(pick(fields, request.body))
  const token = buildToken(user.id)
  const status = StatusTexts.SUCCESS
  const cargo = { status, token, data: { user } }
  response.status(StatusCodes.CREATED).json(cargo)
})

export const authController = {
  signUp,
}
