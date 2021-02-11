import { Router } from 'express'

import { authController } from '../controllers/auth'
import { userController } from '../controllers/user'

export const userRouter = Router()

userRouter
  .post('/signup', authController.signUp)
  .post('/signin', authController.signIn)
  .post('/forgot-password', authController.forgotPassword)
  .patch('/reset-password/:token', authController.resetPassword)

userRouter
  .route('/')
  .post(userController.createUser)
  .get(userController.getAllUsers)

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)
