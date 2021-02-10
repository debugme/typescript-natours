import mongoose, { Document } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

export interface UserDocument extends Document {
  name: string
  email: string
  photo: string | undefined
  password: string
  passwordConfirm: string | undefined
  isCorrectPassword: (password: string) => Promise<boolean>
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

// Create a new instance method for for documents in the users collection
UserSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

export const userFields = Object.keys(UserSchema.obj)

export const User = mongoose.model<UserDocument>('User', UserSchema)
