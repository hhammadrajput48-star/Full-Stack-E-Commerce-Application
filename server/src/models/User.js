import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '', maxlength: 30 },
    // select:false -> the hash is never returned unless explicitly requested.
    password: { type: String, required: true, select: false },
    // Product ids the user has hearted.
    wishlist: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      // Same shape the React app already used for `currentUser`.
      transform: (_doc, ret) => ({
        id: ret._id.toString(),
        name: ret.name,
        email: ret.email,
        phone: ret.phone,
        joinedAt: ret.createdAt,
      }),
    },
  },
)

export const User = mongoose.model('User', userSchema)
