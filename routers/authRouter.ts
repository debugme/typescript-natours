import { Router } from 'express'

import { authController } from '../controllers/authController'
import { Services } from '../services'

export const buildAuthRouter = (services: Services) => {
  const authRouter = Router()
  const { environment, emailer } = services

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

  return authRouter
}
