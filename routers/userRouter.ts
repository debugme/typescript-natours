import { Router } from 'express'

import { authController } from '../controllers/authController'
import { userController } from '../controllers/userController'
import { Services } from '../services'

export const buildUserRouter = (services: Services) => {
  const router = Router()
  const { environment, emailer } = services

  router
    .post(
      '/signup',
      authController.validateSignUp,
      authController.signUp(environment)
    )
    .post(
      '/signin',
      authController.validateSignIn,
      authController.signIn(environment)
    )
    .post(
      '/forgot-password',
      authController.validateForgotPassword,
      authController.forgotPassword(environment, emailer)
    )
    .patch(
      '/reset-password/:resetToken',
      authController.validateResetPassword,
      authController.resetPassword(environment)
    )
    .patch(
      '/update-password',
      authController.validateIsAuthenticated(environment),
      authController.validateUpdatePassword,
      authController.updatePassword(environment)
    )
    .patch(
      '/update-user',
      authController.validateIsAuthenticated(environment),
      authController.validateUpdateUser,
      authController.updateUser
    )
    .delete(
      '/delete-user',
      authController.validateIsAuthenticated(environment),
      authController.deleteUser
    )

  router
    .route('/')
    .post(userController.createUser)
    .get(userController.getAllUsers)

  router
    .route('/:userId')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)
  return router
}
