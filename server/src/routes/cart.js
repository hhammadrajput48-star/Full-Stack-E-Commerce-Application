import { Router } from 'express'
import { getOrCreateCart, serializeCartItems } from '../models/Cart.js'
import { Product } from '../models/Product.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { addCartItemSchema, updateCartItemSchema } from '../validation/schemas.js'

const router = Router()
const MAX_QTY = 99

router.use(requireAuth)

const respond = (res, cart) => res.json({ items: serializeCartItems(cart.items) })

// GET /api/cart
router.get(
  '/',
  asyncHandler(async (req, res) => {
    respond(res, await getOrCreateCart(req.user._id))
  }),
)

// POST /api/cart/items   { productId, size?, color?, qty? }
// The price/name/image always come from the database - never from the browser.
router.post(
  '/items',
  asyncHandler(async (req, res) => {
    const { productId, qty, size: requestedSize, color: requestedColor } = addCartItemSchema.parse(req.body)

    const product = await Product.findById(productId)
    if (!product) throw new HttpError(404, 'Product not found.')

    // Same defaults the React app used: first size / first colour.
    const size = requestedSize ?? product.sizes[0] ?? null
    const color = requestedColor ?? product.colors[0] ?? null
    if (size !== null && !product.sizes.includes(size)) throw new HttpError(400, `Size "${size}" is not available for this product.`)
    if (color !== null && !product.colors.includes(color)) throw new HttpError(400, 'That colour is not available for this product.')

    const lineId = `${product.id}__${size}__${color}`
    const cart = await getOrCreateCart(req.user._id)
    const existing = cart.items.find((item) => item.lineId === lineId)

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, MAX_QTY)
    } else {
      cart.items.push({ lineId, productId: product.id, name: product.name, price: product.price, image: product.image, size, color, qty })
    }

    await cart.save()
    respond(res, cart)
  }),
)

// PATCH /api/cart/items/:lineId   { qty }   (qty <= 0 removes the line)
router.patch(
  '/items/:lineId',
  asyncHandler(async (req, res) => {
    const { qty } = updateCartItemSchema.parse(req.body)
    const cart = await getOrCreateCart(req.user._id)
    const item = cart.items.find((i) => i.lineId === req.params.lineId)
    if (!item) throw new HttpError(404, 'That item is not in your cart.')

    if (qty <= 0) cart.items = cart.items.filter((i) => i.lineId !== req.params.lineId)
    else item.qty = qty

    await cart.save()
    respond(res, cart)
  }),
)

// DELETE /api/cart/items/:lineId
router.delete(
  '/items/:lineId',
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id)
    cart.items = cart.items.filter((i) => i.lineId !== req.params.lineId)
    await cart.save()
    respond(res, cart)
  }),
)

// DELETE /api/cart   (empty the cart)
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const cart = await getOrCreateCart(req.user._id)
    cart.items = []
    await cart.save()
    respond(res, cart)
  }),
)

export default router
