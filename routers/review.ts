import { Router } from 'express'
import { authController } from '../controllers/auth'

import { reviewController } from '../controllers/review'
import { Environment } from '../environment/environment'

export const buildReviewRouter = (environment: Environment) => {
  const router = Router()
  router
    .route('/')
    .post(
      authController.validateIsAuthenticated(environment),
      authController.validateIsAuthorised('user'),
      reviewController.validateCreateReview,
      reviewController.createReview
    )
    .get(reviewController.getAllReviews)
  return router
}
