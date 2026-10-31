import { Router } from 'express'
import { Subscriber } from '../models/Subscriber.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { newsletterSchema } from '../validation/schemas.js'

const router = Router()

// POST /api/newsletter   { email }   (public)
// Subscribing the same email twice is not an error - and the response is
// identical, so nobody can use this to check who is subscribed.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { email } = newsletterSchema.parse(req.body)
    await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true })
    res.status(201).json({ message: "You're subscribed." })
  }),
)

export default router
