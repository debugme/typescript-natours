import { Router } from 'express'
import { tourController } from '../controllers/tourController'
import { authController } from '../controllers/authController'
import { reviewController } from '../controllers/reviewController'
import { Services } from '../services'

export const buildTourRouter = (services: Services) => {
  const router = Router()
  const { environment } = services

  router
    .route('/:tourId/reviews')
    .post(
      authController.validateIsAuthenticated(environment),
      authController.validateIsAuthorised('user'),
      reviewController.validateCreateReview,
      reviewController.createReview
    )
    .get(reviewController.getAllReviews)

  router.route(':tourId/reviews/:reviewId').get(reviewController.getReview)

  router.route('/stats').get(tourController.getTourStats)

  router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

  router
    .route('/:tourId')
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