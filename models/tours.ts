import mongoose from 'mongoose'
import slugify from 'slugify'

const definition = {
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
    select: false, // setting this to false means do NOT return this field when you make any mongodb queries against the tours collection
  },
  startDates: [Date],
  slug: String,
  isSecretTour: { type: Boolean, default: false },
}

const options = { toJSON: { virtuals: true }, toObject: { virtuals: true } }

export const tourSchema = new mongoose.Schema(definition, options)

// [VIRTUAL FIELD]
// Create a virtual field whose value is calculated from the value of other fields on the schema
// Note: as this field is not stored in the database, you can refer to this field in a query
tourSchema.virtual('durationInWeeks').get(function () {
  // @ts-ignore
  return this.duration / 7
})

// [DOCUMENT MIDDLEWARE] - only runs on .save() and .create()
// Note: we use this to create a slug for each document
// Note: Inside the function callback, this refers to a document
tourSchema.pre('save', function (next) {
  // @ts-ignore
  // console.log(this)
  this.slug = slugify(this.name, { lower: true })
  next()
})
tourSchema.post('save', function (document, next) {
  console.info(document)
  next()
})

// [QUERY MIDDLEWARE] - filter out all tours which are secret ones
// Note: Inside the function callback, this refers to a query
tourSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.find({ isSecretTour: { $ne: true } })
  next(null)
})

// [AGGREGATE MIDDLEWARE] - filter out all tours which are secret ones
// Note: Inside the function callback, this refers to the aggregate object
tourSchema.pre('aggregate', function (next) {
  // @ts-ignore
  this.pipeline().unshift({ $match: { isSecretTour: { $ne: true } } })
  // @ts-ignore
  next()
})

export const tourFields = Object.keys(tourSchema.obj)

export const Tour = mongoose.model('Tour', tourSchema)
