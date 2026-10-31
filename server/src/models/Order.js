import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    size: { type: String, default: null },
    color: { type: String, default: null },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    shipping: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    promoCode: { type: String, default: '' },
    status: { type: String, enum: ['placed', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => ({
        id: ret._id.toString(),
        items: ret.items,
        subtotal: ret.subtotal,
        discount: ret.discount,
        shipping: ret.shipping,
        total: ret.total,
        promoCode: ret.promoCode,
        status: ret.status,
        createdAt: ret.createdAt,
      }),
    },
  },
)

export const Order = mongoose.model('Order', orderSchema)
