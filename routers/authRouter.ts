import { Router } from 'express'

import { authController } from '../controllers/authController'
import { Services } from '../services/services'

export const buildAuthRouter = (services: Services) => {
  const authRouter = Router()

  authRouter
    .post(
      '/signup',
      authController.validateSignUp(services),
      authController.signUp(services)
    )
    .post(
      '/signin',
      authController.validateSignIn(services),
      authController.signIn(services)
    )
    .post(
      '/forgot-password',
      authController.validateForgotPassword(services),
      authController.forgotPassword(services)
    )
    .patch(
      '/reset-password/:resetToken',
      authController.validateResetPassword(services),
      authController.resetPassword(services)
    )
    .patch(
      '/update-password',
      authController.validateIsAuthenticated(services),
      authController.validateUpdatePassword(services),
      authController.updatePassword(services)
    )
    .patch(
      '/update-user',
      authController.validateIsAuthenticated(services),
      authController.validateUpdateUser(services),
      authController.updateUser(services)
    )
    .delete(
      '/delete-user',
      authController.validateIsAuthenticated(services),
      authController.deleteUser(services)
    )

  return authRouter
}
