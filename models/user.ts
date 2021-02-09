import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

const definition = {
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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    trim: true,
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    trim: true,
    validate: {
      validator: function (passwordConfirm: string): boolean {
        // @ts-ignore
        // Note: this validation will only work when creating a new document,
        // not when updating an existing document
        return passwordConfirm === this.password
      },
      message: 'Passwords are not the same',
    },
  },
}

const options = { toJSON: { virtuals: true }, toObject: { virtuals: true } }

export const userSchema = new mongoose.Schema(definition, options)

// [DOCUMENT MIDDLEWARE] - only runs on .save() and .create()
// Note: we use this to create a slug for each document
// Note: Inside the function callback, this refers to the document being created/saved
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    // @ts-ignore
    this.password = await bcrypt.hash(this.password, 12)
    // @ts-ignore
    this.passwordConfirm = undefined
  }
  next()
})

export const userFields = Object.keys(userSchema.obj)

export const User = mongoose.model('User', userSchema)
