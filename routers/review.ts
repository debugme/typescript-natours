import { Router } from 'express'

import { reviewController } from '../controllers/review'
import { Environment } from '../environment/environment'

export const buildReviewRouter = (environment: Environment) => {
  const router = Router()
  router.route('/').get(reviewController.getAllReviews)
  return router
}
