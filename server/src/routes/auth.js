import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../utils/token.js'
import { loginSchema, profileSchema, signupSchema } from '../validation/schemas.js'

const router = Router()

// A throw-away hash so a login for an unknown email takes about as long as a
// real one (stops attackers discovering which emails are registered by timing).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10)

// POST /api/auth/signup  -> create account (the app then asks the user to log in)
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { name, email, phone, password } = signupSchema.parse(req.body)

    if (await User.exists({ email })) {
      throw new HttpError(409, 'An account with this email already exists.')
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, phone, password: hash })

    res.status(201).json({ message: 'Signup successful. Please login to continue.', user })
  }),
)

// POST /api/auth/login  -> { token, user }
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body)

    const user = await User.findOne({ email }).select('+password')
    const passwordOk = await bcrypt.compare(password, user ? user.password : DUMMY_HASH)
    if (!user || !passwordOk) throw new HttpError(401, 'Invalid email or password.')

    res.json({ token: signToken(user.id), user })
  }),
)

// GET /api/auth/me  -> the logged-in user (used to restore a session on page load)
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// PATCH /api/auth/me  -> update name / email / phone
router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, email, phone } = profileSchema.parse(req.body)

    if (await User.exists({ email, _id: { $ne: req.user._id } })) {
      throw new HttpError(409, 'An account with this email already exists.')
    }

    req.user.name = name
    req.user.email = email
    req.user.phone = phone
    await req.user.save()

    res.json({ user: req.user })
  }),
)

export default router
