import mongoose, { Document, Query } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { hashResetToken } from '../utilities/tokenUtils'

export interface UserDocument extends Document {
  name: string
  email: string
  photo?: string
  password: string
  passwordConfirm?: string
  passwordChangedAt?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  role: String
  isActive?: Boolean
  isCorrectPassword: (password: string) => Promise<boolean>
  isStaleAccessToken: (tokenCreated: number) => boolean
  changedPassword: (timestamp: number) => boolean
  setPasswordResetFields: () => string
  resetPassword: (password: string, passwordConfirm: string) => void
}

export const UserSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please tell us your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      trim: true,
      minlength: 8,
      select: false, // set to false to ensure it is not sent back to client when this user document is requested
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      trim: true,
      validate: {
        validator: function (this: UserDocument, password: string): boolean {
          // Note: this validation will only work when creating a new document,
          // not when updating an existing document
          return password === this.password
        },
        message: 'Passwords are not the same',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
      select: false, // this is an internal field we do not want to expose in queries that indicates whether a user is deleted or not
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

// [DOCUMENT MIDDLEWARE] - only runs on .save() and .create()
// Note: we use this to create a slug for each document
// Note: Inside the function callback, this refers to the document being created/saved
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
  }
  next()
})

// [DOCUMENT MIDDLEWARE] - only runs on .save() and .create()
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()
  if (this.isNew) return next()
  // this.passwordChangedAt = new Date(Date.now() - 1000) // hack incase token generated before document saved
  this.passwordChangedAt = new Date(Date.now())
  next()
})

// [QUERY MIDDLEWARE] - before running any findXXX method, amend the filter to only include active users
UserSchema.pre<Query<UserDocument, UserDocument>>(/^find/, function () {
  this.find({ isActive: { $ne: false } }).select('-__v')
})

// Create a new instance method for documents in the users collection
UserSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

// if the password has been changed since the access token was created, then the access token is stale and needs to be regenerated
UserSchema.methods.isStaleAccessToken = function (tokenCreated: number) {
  if (!this.passwordChangedAt) return false
  const passwordChanged = this.passwordChangedAt.getTime() / 1000
  return passwordChanged > tokenCreated
}

// password is about to be reset to update appropriate fields
UserSchema.methods.setPasswordResetFields = function () {
  const expiryDate = new Date(Date.now() + 10 * 60 * 1000)
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetExpires = expiryDate
  this.passwordResetToken = hashResetToken(resetToken)
  return resetToken
}

// password has been reset so update appropriate fields
UserSchema.methods.resetPassword = function (
  password: string,
  passwordConfirm: string
) {
  this.password = password
  this.passwordConfirm = passwordConfirm
  this.passwordChangedAt = new Date()
  this.passwordResetToken = undefined
  this.passwordResetExpires = undefined
}

export const userFields = Object.keys(UserSchema.obj)

export const UserModel = mongoose.model<UserDocument>('User', UserSchema)
