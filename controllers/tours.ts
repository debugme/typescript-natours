import { RequestHandler } from 'express'
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
  const tour = await Tour.create(request.body)
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { tour } }
  response.status(StatusCodes.CREATED).json(cargo)
})

const getTour = tryCatch(async (request, response) => {
  const {
    params: { id },
  } = request
  const tour = await Tour.findById(id)
  const status = StatusTexts.SUCCESS
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
  const tour = await Tour.findByIdAndUpdate(id, body, options)
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { tour } }
  response.status(StatusCodes.OK).json(cargo)
})

const deleteTour = tryCatch(async (request, response) => {
  const {
    params: { id },
  } = request
  await Tour.findByIdAndDelete(id)
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { id } }
  response.status(StatusCodes.OK).json(cargo)
})

const getTourStats = tryCatch(async (request, response) => {
  const pipeline: any[] = [
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]
  const stats = await Tour.aggregate(pipeline)
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { stats } }
  response.status(StatusCodes.OK).json(cargo)
})

const getMonthlyPlan = tryCatch(async (request, response) => {
  const {
    params: { year },
  } = request

  const pipeline: any[] = [
    // (1) for each start date in each tour, make a new document
    { $unwind: '$startDates' },
    // (2) match all documents with a start date in the request year
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    // (3) generate aggregate result and group by _id
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    // (4) add a month field with the same value as the _id field
    {
      $addFields: { month: '$_id' },
    },
    // (5) remove the _id field from the results
    {
      $project: {
        _id: 0,
      },
    },
    // (6) sort results by ascending month
    {
      $sort: { numTourStarts: -1 },
    },
    // (7) limit the number of results to desired value
    {
      $limit: 12,
    },
  ]
  const plan = await Tour.aggregate(pipeline)
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { plan } }
  response.status(StatusCodes.OK).json(cargo)
})

export const toursController = {
  createTour,
  getTour,
  getAllTours,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
}
