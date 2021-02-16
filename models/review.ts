import mongoose, { Document, Query } from 'mongoose'
import { User } from './user'

export interface ReviewDocument extends Document {
  review: string
  rating: number
  createdAt: Date
  tour: mongoose.Schema.Types.ObjectId
  user: mongoose.Schema.Types.ObjectId
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour', //FIXME: for some reason Tour.modelName is undefined!
      required: [true, 'Error - A review must have a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User.modelName,
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

export const Review = mongoose.model('Review', ReviewSchema)
