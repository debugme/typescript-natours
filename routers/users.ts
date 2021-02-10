import { Router } from 'express'

import { authController } from '../controllers/auth'
import { usersController } from '../controllers/users'

export const usersRouter = Router()

usersRouter
  .post('/signup', authController.signUp)
  .post('/signin', authController.signIn)

usersRouter
  .route('/')
  .post(usersController.createUser)
  .get(usersController.getAllUsers)

usersRouter
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser)
