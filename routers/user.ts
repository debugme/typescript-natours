import { Router } from 'express'

import { authController } from '../controllers/auth'
import { userController } from '../controllers/user'
import { Environment } from '../environment/environment'
import { Emailer } from '../emailer/emailer'

export const buildUserRouter = (environment: Environment, emailer: Emailer) => {
  const router = Router()
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
      '/reset-password/:token',
      authController.validateResetPassword,
      authController.resetPassword(environment)
    )

  router
    .route('/')
    .post(userController.createUser)
    .get(userController.getAllUsers)

  router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)
  return router
}
