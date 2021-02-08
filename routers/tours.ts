import { Router } from 'express'

import { toursController } from '../controllers/tours'

export const toursRouter = Router()

toursRouter.route('/stats').get(toursController.getTourStats)

toursRouter.route('/monthly-plan/:year').get(toursController.getMonthlyPlan)

toursRouter
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour)

toursRouter
  .route('/')
  .get(toursController.getAllTours)
  .post(toursController.createTour)
