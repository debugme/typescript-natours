import { StatusCodes } from 'http-status-codes'
import { Tour, tourFields } from '../models/tours'
import {
  getFilters,
  getLimitCount,
  getProjection,
  getSkipCount,
  getSortFields,
  StatusTexts,
  tryCatch,
} from '../utilities/utilities'

const createTour = tryCatch(async (request, response) => {
  const status = StatusTexts.SUCCESS
  const tour = await Tour.create(request.body)
  const cargo = { status, data: { tour } }
  response.status(StatusCodes.CREATED).json(cargo)
})

const getTour = tryCatch(async (request, response) => {
  const {
    params: { id },
  } = request
  const status = StatusTexts.SUCCESS
  const tour = await Tour.findById(id)
  const cargo = { status, data: { tour } }
  response.status(StatusCodes.OK).json(cargo)
})

const getAllTours = tryCatch(async (request, response) => {
  const { query } = request
  const filters = getFilters(query, tourFields)
  const projection = getProjection(query)
  const sortFields = getSortFields(query)
  const skipCount = getSkipCount(query)
  const limitCount = getLimitCount(query)

  const documentCount = await Tour.countDocuments()
  if (skipCount >= documentCount) throw new Error('This page does not exist!')

  const tours = await Tour.find(filters)
    .select(projection)
    .sort(sortFields)
    .skip(skipCount)
    .limit(limitCount)

  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { tours } }
  response.status(StatusCodes.OK).json(cargo)
})

const updateTour = tryCatch(async (request, response) => {
  const {
    body,
    params: { id },
  } = request
  const options = { new: true, runValidators: true }
  const status = StatusTexts.SUCCESS
  const tour = await Tour.findByIdAndUpdate(id, body, options)
  const cargo = { status, data: { tour } }
  response.status(StatusCodes.OK).json(cargo)
})

const deleteTour = tryCatch(async (request, response) => {
  const {
    params: { id },
  } = request
  const status = StatusTexts.SUCCESS
  await Tour.findByIdAndDelete(id)
  const cargo = { status, data: { id } }
  response.status(StatusCodes.OK).json(cargo)
})

export const toursController = {
  createTour,
  getTour,
  getAllTours,
  updateTour,
  deleteTour,
}
