import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema(
  {
    // "<productId>__<size>__<color>" - one cart line per product/size/color combo.
    lineId: { type: String, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    size: { type: String, default: null },
    color: { type: String, default: null },
    qty: { type: Number, required: true, min: 1, max: 99, default: 1 },
  },
  { _id: false },
)

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [itemSchema], default: [] },
  },
  { timestamps: true },
)

export const Cart = mongoose.model('Cart', cartSchema)

// Get the user's cart, creating an empty one on first use.
export const getOrCreateCart = (userId) =>
  Cart.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: userId, items: [] } }, { upsert: true, new: true })

// Convert DB lines to the exact shape the React CartContext expects.
export const serializeCartItems = (items) =>
  items.map((i) => ({
    lineId: i.lineId,
    id: i.productId,
    name: i.name,
    price: i.price,
    image: i.image,
    size: i.size,
    color: i.color,
    qty: i.qty,
  }))
