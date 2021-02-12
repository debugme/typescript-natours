import { Router } from 'express'
import { Environment } from '../environment/environment'
import { tourController } from '../controllers/tour'
import { authController } from '../controllers/auth'

export const buildTourRouter = (environment: Environment) => {
  const router = Router()

  router.route('/stats').get(tourController.getTourStats)

  router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

  router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
      authController.validateIsAuthenticated(environment),
      authController.validateIsAuthorised('lead-guide', 'admin'),
      tourController.deleteTour
    )

  router
    .route('/')
    .get(
      authController.validateIsAuthenticated(environment),
      tourController.getAllTours
    )
    .post(tourController.createTour)
  return router
}
