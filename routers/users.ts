import { Router } from 'express'

import { usersController } from '../controllers/users'

export const usersRouter = Router()

usersRouter
  .route('/')
  .post(usersController.createUser)
  .get(usersController.getAllUsers)

usersRouter
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser)
