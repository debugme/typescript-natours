import mongoose, { Aggregate, Document, Query } from 'mongoose'
import slugify from 'slugify'
import { UserModel } from './userModel'

export interface TourDocument extends Document {
  name: string
  duration: number
  maxGroupSize: number
  difficulty: string
  ratingsAverage?: number
  ratingsQuantity?: number
  price: number
  priceDiscount?: number
  summary: string
  description?: string
  imageCover: string
  images: string[]
  createdAt?: Date
  startDates: Date[]
  slug?: string
  isSecretTour?: boolean
}

export const TourSchema = new mongoose.Schema<TourDocument>(
  {
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
        validator: function (
          this: TourDocument,
          priceDiscount: number
        ): boolean {
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
      default: Date.now,
      select: false, // setting this to false means do NOT return this field when you make any mongodb queries against the tours collection
    },
    startDates: [Date],
    slug: { type: String, trim: true },
    isSecretTour: { type: Boolean, default: false },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: {
          values: ['Point'],
          message: 'type can only be "Point" ',
        },
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // An example of how to refer to embed documents into this document
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: {
            values: ['Point'],
            message: 'type can only be "Point" ',
          },
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // An example of how to refer to documents in other collections
    guides: [
      {
        type: mongoose.Types.ObjectId,
        ref: UserModel.modelName,
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

// Create a list of tour documents indexed by price to allow for faster look-ups
TourSchema.index({ price: 1, ratingsAverage: -1 })
TourSchema.index({ slug: 1 })

// [VIRTUAL FIELD]
// Create a virtual field whose value is calculated from the value of other fields on the schema
// Note: as this field is not stored in the database, you can't refer to this field in a query
// Note: the "this" keyword refers to the document itself
TourSchema.virtual('durationInWeeks').get(function (this: TourDocument) {
  return this.duration / 7
})

// [VIRTUAL POPULATE]
TourSchema.virtual('reviews', {
  ref: 'Review', // Review.modelName,
  foreignField: 'tour',
  localField: '_id',
})

// [DOCUMENT MIDDLEWARE] - only runs on .save() and .create()
// Note: we use this to create a slug for each document
// Note: Inside the function callback, this refers to the document being created/saved
TourSchema.pre<TourDocument>('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next(null)
})

// SHOWS HOW TO EMBED USERS INTO A TOUR
// TourSchema.pre<TourDocument>('save', async function (next) {
//   const guidesList = this.guides.map(async (userId: object) => {
//     const user = await User.findById(userId)
//     if (!user) throw Error(`Could not find user with id ${userId}`)
//     return user
//   })
//   this.guides = await Promise.all(guidesList)
//   next(null)
// })

// [QUERY MIDDLEWARE] - filter out all tours which are secret ones
// Note: Inside the function callback, this refers to a query
TourSchema.pre<Query<TourDocument, TourDocument>>(/^find/, function (next) {
  this.find({ isSecretTour: { $ne: true } })
  next(null)
})

// [QUERY MIDDLEWARE] - filter out __v field from all users under guides field
TourSchema.pre<Query<TourDocument, TourDocument>>(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  })
  next(null)
})

// [AGGREGATE MIDDLEWARE] - filter out all tours which are secret ones
// Note: Inside the function callback, this refers to the aggregate object
TourSchema.pre('aggregate', function (this: Aggregate<TourDocument>, next) {
  this.pipeline().unshift({ $match: { isSecretTour: { $ne: true } } })
  next(null)
})

export const TourModel = mongoose.model('Tour', TourSchema)
