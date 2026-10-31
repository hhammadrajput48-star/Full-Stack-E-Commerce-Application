import mongoose from 'mongoose'

// The product id is a readable string such as "skinny-fit-jeans" (same ids the
// React app already uses in its URLs), so we use it directly as the Mongo _id.
const productSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    image: { type: String, required: true },
    style: { type: String, required: true, index: true },
    gender: { type: String, default: 'men' },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    tag: { type: String, default: null, index: true },
    description: { type: String, default: '' },
    // Keeps the "Featured" order stable (the order products appear in the seed file).
    position: { type: Number, default: 0 },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, __v, position, ...rest } = ret
        return { id: _id, ...rest }
      },
    },
  },
)

export const Product = mongoose.model('Product', productSchema)
