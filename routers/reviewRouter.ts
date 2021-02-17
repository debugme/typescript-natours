import { Router } from 'express'
import { authController } from '../controllers/authController'

import { reviewController } from '../controllers/reviewController'
import { Services } from '../services'

export const buildReviewRouter = (services: Services) => {
  const { environment } = services
  const options = { mergeParams: true } // Add params from calling router (e.g. tourRouter) into review router
  const reviewRouter = Router(options)

  reviewRouter.route('/:reviewId').get(reviewController.getReview)

  reviewRouter
    .route('/')
    .post(
      authController.validateIsAuthenticated(environment),
      authController.validateIsAuthorised('user'),
      reviewController.validateCreateReview,
      reviewController.createReview
    )
    .get(reviewController.getAllReviews)

  return reviewRouter
}
