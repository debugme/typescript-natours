import { Router } from 'express'
import { authController } from '../controllers/authController'

import { reviewController } from '../controllers/reviewController'
import { Services } from '../services'

export const buildReviewRouter = (services: Services) => {
  const { environment } = services
  const options = {
    mergeParams: true, // if true, then add params from tour router into review router
  }
  const router = Router(options)

  router.route('/:reviewId').get(reviewController.getReview)

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
