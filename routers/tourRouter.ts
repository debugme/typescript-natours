import { Router } from 'express'

import { Services } from '../services'
import { tourController } from '../controllers/tourController'
import { authController } from '../controllers/authController'
import { buildReviewRouter } from '../routers/reviewRouter'

export const buildTourRouter = (services: Services) => {
  const tourRouter = Router()
  const { environment } = services
  const reviewRouter = buildReviewRouter(services)

  tourRouter.use('/:tourId/reviews', reviewRouter)

  tourRouter.route('/stats').get(tourController.getTourStats)
  tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

  tourRouter
    .route('/:tourId')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
      authController.validateIsAuthenticated(environment),
      authController.validateIsAuthorised('lead-guide', 'admin'),
      tourController.deleteTour
    )

  tourRouter
    .route('/')
    .get(
      authController.validateIsAuthenticated(environment),
      tourController.getAllTours
    )
    .post(tourController.createTour)
  return tourRouter
}
