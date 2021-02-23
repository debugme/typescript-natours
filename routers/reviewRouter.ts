import { Router } from 'express'

import { authController } from '../controllers/authController'
import { reviewController } from '../controllers/reviewController'
import { Services } from '../services/services'

export const buildReviewRouter = (services: Services) => {
  const options = { mergeParams: true } // Add params from calling router (e.g. tourRouter) into review router
  const reviewRouter = Router(options)

  reviewRouter.route('/:reviewId').get(reviewController.getReview)

  reviewRouter
    .route('/')
    .post(
      authController.validateIsAuthenticated(services),
      authController.validateIsAuthorised(services, 'user'),
      reviewController.validateCreateReview,
      reviewController.createReview
    )
    .get(reviewController.getAllReviews)

  return reviewRouter
}
