import { StatusCodes } from 'http-status-codes'
import { pick } from 'ramda'
import { Review, ReviewSchema } from '../models/review'
import {
  ServerError,
  StatusTexts,
  tryCatch,
} from '../utilities/controllerUtils'

const getAllReviews = tryCatch(async (request, response) => {
  const reviews = await Review.find()
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { reviews } }
  response.status(StatusCodes.OK).json(cargo)
})

const validateCreateReview = tryCatch(async (request, response, next) => {
  const { body } = request
  const fields = Object.keys(ReviewSchema.obj)
  const { review, rating, tour, user } = pick(fields, body)
  if (!review) throw new ServerError('Please provide a review')
  if (!rating) throw new ServerError('Please provide a rating between 1 and 5')
  if (!tour) throw new ServerError('Please provide a tour id')
  if (!user) throw new ServerError('Please provide a user id')
  next()
})

const createReview = tryCatch(async (request, response) => {
  const review = await Review.create(request.body)
  const status = StatusTexts.SUCCESS
  const cargo = { status, data: { review } }
  response.status(StatusCodes.CREATED).json(cargo)
})

export const reviewController = {
  getAllReviews,
  validateCreateReview,
  createReview,
}
