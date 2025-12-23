import mongoose, { Schema, Document, Model } from 'mongoose'

export interface User {
  firebaseUid: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: Date
  updatedAt: Date
  favoriteTeams?: string[]
}

export interface UserDocument extends User, Document {}

const userSchema: Schema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    photoURL: { type: String },
    favoriteTeams: [{ type: String }],
  },
  {
    timestamps: true,
    collection: 'users',
  }
)

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', userSchema)
