import { StatusCodes } from 'http-status-codes'
import { User } from '../models/user'
import { StatusTexts, tryCatch } from '../utilities/utilities'

const signUp = tryCatch(async (request, response) => {
  const user = await User.create(request.body)
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { user } }
  response.status(StatusCodes.CREATED).json(cargo)
})

export const authController = {
  signUp,
}
