import { Router } from 'express'

import { Services } from '../services/services'
import { tourController } from '../controllers/tourController'
import { authController } from '../controllers/authController'
import { buildReviewRouter } from '../routers/reviewRouter'

export const buildTourRouter = (services: Services) => {
  const tourRouter = Router()

  // delegate to review router to handler request
  const reviewRouter = buildReviewRouter(services)
  tourRouter.use('/:tourId/reviews', reviewRouter)

  tourRouter.route('/stats').get(tourController.getTourStats)
  tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

  tourRouter
    .route('/:tourId')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
      authController.validateIsAuthenticated(services),
      authController.validateIsAuthorised(services, 'lead-guide', 'admin'),
      tourController.deleteTour
    )

  tourRouter
    .route('/')
    .get(
      authController.validateIsAuthenticated(services),
      tourController.getAllTours
    )
    .post(tourController.createTour)
  return tourRouter
}
