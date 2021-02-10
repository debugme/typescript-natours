import {
  getFilters,
  getLimitCount,
  getProjection,
  getSkipCount,
  getSortFields,
  StatusTexts,
  tryCatch,
} from '../utilities/utilities'
import { User, userFields } from '../models/user'
import { StatusCodes } from 'http-status-codes'

const createUser = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

const getUser = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

const getAllUsers = tryCatch(async (request, response) => {
  const { query } = request
  const filters = getFilters(query, userFields)
  const projection = getProjection(query)
  const sortFields = getSortFields(query)
  const skipCount = getSkipCount(query)
  const limitCount = getLimitCount(query)

  const documentCount = await User.countDocuments()
  if (skipCount >= documentCount) throw new Error('This page does not exist!')

  const users = await User.find(filters)
    .select(projection)
    .sort(sortFields)
    .skip(skipCount)
    .limit(limitCount)

  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { users } }
  response.status(StatusCodes.OK).json(cargo)
})

const updateUser = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

const deleteUser = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

export const usersController = {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
}
