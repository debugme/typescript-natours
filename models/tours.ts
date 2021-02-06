import mongoose from 'mongoose'

export const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Error - A tour must have a name'],
    unique: true,
  },
  duration: {
    type: Number,
    required: [true, 'Error - A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Error - A tour must have a group size'],
  },
  difficulty: {
    type: String,
    trim: true,
    required: [true, 'Error - A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'Error - A tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'Error - A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    trim: true,
    required: [true, 'Error - A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // do NOT show this field when you make any mongodb queries against the tours collection
  },
  startDates: [Date],
})

export const tourFields = Object.keys(tourSchema.obj)

export const Tour = mongoose.model('Tour', tourSchema)
