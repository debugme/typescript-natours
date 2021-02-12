import { Router } from 'express'

import { authController } from '../controllers/auth'
import { userController } from '../controllers/user'

export const userRouter = Router()

userRouter
  .post('/signup', authController.validateSignUp, authController.signUp)
  .post('/signin', authController.validateSignIn, authController.signIn)
  .post(
    '/forgot-password',
    authController.validateForgotPassword,
    authController.forgotPassword
  )
  .patch(
    '/reset-password/:token',
    authController.validateResetPassword,
    authController.resetPassword
  )

userRouter
  .route('/')
  .post(userController.createUser)
  .get(userController.getAllUsers)

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)
