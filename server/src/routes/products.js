import { Router } from 'express'
import { Product } from '../models/Product.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const SORTS = {
  'price-asc': { price: 1, position: 1 },
  'price-desc': { price: -1, position: 1 },
  rating: { rating: -1, position: 1 },
  featured: { position: 1 },
}

// GET /api/products
// Optional filters: ?style=casual &gender=men &tag=new|top &search=jeans
//                   &sale=true &minPrice=50 &maxPrice=300 &sort=featured|price-asc|price-desc|rating
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { style, gender, tag, search, sale, minPrice, maxPrice, sort } = req.query
    const filter = {}

    if (typeof style === 'string' && style !== 'all') filter.style = style
    if (typeof gender === 'string') filter.gender = gender
    if (typeof tag === 'string') filter.tag = tag
    if (typeof search === 'string' && search.trim()) filter.name = { $regex: escapeRegex(search.trim()), $options: 'i' }
    if (sale === 'true') filter.oldPrice = { $ne: null }

    const price = {}
    if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) price.$gte = Number(minPrice)
    if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) price.$lte = Number(maxPrice)
    if (Object.keys(price).length) filter.price = price

    const products = await Product.find(filter).sort(SORTS[sort] || SORTS.featured)
    res.json({ products })
  }),
)

// GET /api/products/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    if (!product) throw new HttpError(404, 'Product not found.')
    res.json({ product })
  }),
)

export default router
