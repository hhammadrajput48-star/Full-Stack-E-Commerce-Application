import { Router } from 'express'
import mongoose from 'mongoose'
import { PROMO_CODES, SHIPPING_FLAT, round2 } from '../config/pricing.js'
import { getOrCreateCart } from '../models/Cart.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { checkoutSchema } from '../validation/schemas.js'

const router = Router()

router.use(requireAuth)

// POST /api/orders   { promoCode? }
// Turns the user's cart into an order. Totals are recalculated here from the
// current database prices, then the cart is emptied.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { promoCode } = checkoutSchema.parse(req.body ?? {})

    const cart = await getOrCreateCart(req.user._id)
    if (cart.items.length === 0) throw new HttpError(400, 'Your cart is empty.')

    const products = await Product.find({ _id: { $in: cart.items.map((i) => i.productId) } })
    const byId = new Map(products.map((p) => [p.id, p]))

    const items = cart.items.map((line) => {
      const product = byId.get(line.productId)
      if (!product) throw new HttpError(409, `"${line.name}" is no longer available. Please remove it from your cart.`)
      return { productId: product.id, name: product.name, price: product.price, image: product.image, size: line.size, color: line.color, qty: line.qty }
    })

    const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.qty, 0))

    let discount = 0
    let appliedCode = ''
    if (promoCode) {
      const rate = PROMO_CODES[promoCode.toLowerCase()]
      if (!rate) throw new HttpError(400, 'Invalid promo code.')
      discount = round2(subtotal * rate)
      appliedCode = promoCode.toUpperCase()
    }

    const shipping = SHIPPING_FLAT
    const total = round2(subtotal - discount + shipping)

    const order = await Order.create({ user: req.user._id, items, subtotal, discount, shipping, total, promoCode: appliedCode })

    cart.items = []
    await cart.save()

    res.status(201).json({ order })
  }),
)

// GET /api/orders  -> the user's order history, newest first
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json({ orders })
  }),
)

// GET /api/orders/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Order not found.')
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) throw new HttpError(404, 'Order not found.')
    res.json({ order })
  }),
)

export default router
