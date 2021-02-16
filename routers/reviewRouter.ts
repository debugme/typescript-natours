import { Router } from 'express'

import { reviewController } from '../controllers/reviewController'
import { Services } from '../services'

export const buildReviewRouter = (services: Services) => {
  const router = Router()
  router.route('/').get(reviewController.getAllReviews)
  return router
}
