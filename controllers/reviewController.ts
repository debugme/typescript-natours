import { StatusCodes } from 'http-status-codes'
import { pick } from 'ramda'
import { ReviewModel, ReviewSchema } from '../models/reviewModel'
import { TourModel } from '../models/tourModel'
import {
  ServerError,
  StatusTexts,
  tryCatch,
} from '../utilities/controllerUtils'

const getAllReviews = tryCatch(async (request, response) => {
  const { tourId } = request.params
  const filters = tourId ? { tour: tourId } : {}
  const reviews = await ReviewModel.find(filters)
  const status = StatusTexts.SUCCESS
  const results = reviews.length
  const cargo = { status, meta: { results }, data: { reviews } }
  response.status(StatusCodes.OK).json(cargo)
})

const validateCreateReview = tryCatch(async (request, response, next) => {
  const { body, params } = request
  const { tourId } = params
  const tour = await TourModel.findById(tourId)
  const fields = Object.keys(ReviewSchema.obj)
  const { review, rating } = pick(fields, body)
  if (!review) throw new ServerError('Please provide a review')
  if (!rating) throw new ServerError('Please provide a rating between 1 and 5')
  if (!tour) throw new ServerError('Please provide a tour id')
  next()
})

const createReview = tryCatch(async (request, response) => {
  const payload = {
    user: request.context.user.id,
    tour: request.params.tourId,
    review: request.body.review,
    rating: request.body.rating,
  }
  const review = await ReviewModel.create(payload)
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { review } }
  response.status(StatusCodes.CREATED).json(cargo)
})

const validateGetReview = tryCatch(async (request, response, next) => {
  const { tourId, reviewId } = request.params
  const tour = await TourModel.findById(tourId)
  if (!tour) throw new ServerError('Please provide a valid tourId')
  const review = ReviewModel.findById(reviewId)
  if (!review) throw new ServerError('Please provide a valid reviewId')
  next()
})

const getReview = tryCatch(async (request, response) => {
  const { reviewId } = request.params
  const review = ReviewModel.findById(reviewId)
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { review } }
  response.status(StatusCodes.CREATED).json(cargo)
})

export const reviewController = {
  validateGetReview,
  getReview,
  getAllReviews,
  validateCreateReview,
  createReview,
}
