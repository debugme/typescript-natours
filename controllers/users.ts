import { tryCatch } from '../utilities/utilities'

const deleteUser = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

const updateUser = tryCatch(async (request, response) => {
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

const createUser = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

const getAllUsers = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

export const usersController = {
  deleteUser,
  updateUser,
  getUser,
  createUser,
  getAllUsers,
}
