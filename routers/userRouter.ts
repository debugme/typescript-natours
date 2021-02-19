import { Router } from 'express'

import { userController } from '../controllers/userController'
import { Services } from '../services'

export const buildUserRouter = (services: Services) => {
  const userRouter = Router()

  userRouter
    .route('/')
    .post(userController.createUser)
    .get(userController.getAllUsers)

  userRouter
    .route('/:userId')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

  return userRouter
}
