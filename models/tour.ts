import mongoose from 'mongoose'
import slugify from 'slugify'
// import validator from 'validator'

const definition = {
  name: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Error - A tour must have a name'],
    maxlength: [
      40,
      'Error - A tour name must be less than or equal to 40 characters',
    ],
    minlength: [
      10,
      'Error - A tour name must be greater than or equal to 10 characters',
    ],
    // validate: [
    //   validator.isAlpha,
    //   'Error - name of {VALUE}" must only have letters',
    // ],
    // Note: this is another way to define a validator
    // validate: {
    //   validator: validator.isAlpha,
    //   message: 'Error - name of {VALUE} must only have letters',
    // },
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
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Error - Difficulty must be easy | medium | difficult',
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Error - ratings average must be greater than 1'],
    max: [5, 'Error - ratings average must be less than 5'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'Error - A tour must have a price'],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (priceDiscount: number): boolean {
        // @ts-ignore
        // Note: this validation will only work when creating a new document,
        // not when updating an existing document
        return priceDiscount < this.price
      },
      message: 'Error - price discount of {VALUE} must be less than price',
    },
  },
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
  slug: { type: String, trim: true },
  isSecretTour: { type: Boolean, default: false },
}

// include virtuals fields in json and object representations of tour documents
const options = { toJSON: { virtuals: true }, toObject: { virtuals: true } }

export const tourSchema = new mongoose.Schema(definition, options)

// [VIRTUAL FIELD]
// Create a virtual field whose value is calculated from the value of other fields on the schema
// Note: as this field is not stored in the database, you can refer to this field in a query
// Note: the "this" keyword refers to the document itself
tourSchema.virtual('durationInWeeks').get(function () {
  // @ts-ignore
  return this.duration / 7
})

// [DOCUMENT MIDDLEWARE] - only runs on .save() and .create()
// Note: we use this to create a slug for each document
// Note: Inside the function callback, this refers to the document being created/saved
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
