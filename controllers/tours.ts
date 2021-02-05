import { tryCatch } from '../utilities/utilities'

const deleteTour = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

const updateTour = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

const getTour = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

const createTour = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

const getAllTours = tryCatch(async (request, response) => {
  const status = 'error'
  const message = 'error - endpoint not implemented'
  const cargo = { status, message }
  response.status(500).json(cargo)
})

export const toursController = {
  deleteTour,
  updateTour,
  getTour,
  createTour,
  getAllTours,
}
