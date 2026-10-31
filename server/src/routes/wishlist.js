import { Router } from 'express'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(requireAuth)

// GET /api/wishlist  -> { wishlist: ["product-id", ...] }
router.get('/', (req, res) => {
  res.json({ wishlist: req.user.wishlist })
})

// PUT /api/wishlist/:productId  -> add (safe to call twice)
router.put(
  '/:productId',
  asyncHandler(async (req, res) => {
    if (!(await Product.exists({ _id: req.params.productId }))) throw new HttpError(404, 'Product not found.')
    const user = await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: req.params.productId } }, { new: true })
    res.json({ wishlist: user.wishlist })
  }),
)

// DELETE /api/wishlist/:productId  -> remove (safe to call twice)
router.delete(
  '/:productId',
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.productId } }, { new: true })
    res.json({ wishlist: user.wishlist })
  }),
)

export default router
