import mongoose, { Document, Query } from 'mongoose'
import { UserModel } from './userModel'

export interface ReviewDocument extends Document {
  review: string
  rating: number
  createdAt: Date
  tour: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
}

export const ReviewSchema = new mongoose.Schema<ReviewDocument>(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Error - A review must have a review'],
    },
    rating: {
      type: Number,
      min: [1, 'Error - ratings average must be greater than 1'],
      max: [5, 'Error - ratings average must be less than 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Types.ObjectId,
      ref: 'Tour', //FIXME: for some reason Tour.modelName is undefined!
      required: [true, 'Error - A review must have a tour'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: UserModel.modelName,
      required: [true, 'Error - A review must have a user'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

// [QUERY MIDDLEWARE]
ReviewSchema.pre<Query<ReviewDocument, ReviewDocument>>(
  /^find/,
  function (next) {
    this.populate({
      path: 'user',
      select: 'name photo',
    })
    next(null)
  }
)

export const ReviewModel = mongoose.model('Review', ReviewSchema)
