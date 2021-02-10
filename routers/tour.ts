import { Router } from 'express'

import { tourController } from '../controllers/tour'
import { authController } from '../controllers/auth'

export const tourRouter = Router()

tourRouter.route('/stats').get(tourController.getTourStats)

tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour)

tourRouter
  .route('/')
  .get(authController.isAuthorised, tourController.getAllTours)
  .post(tourController.createTour)
