import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { HttpError } from '../utils/HttpError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Protects a route: expects the header  Authorization: Bearer <token>
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Authentication required.')

  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret)
  } catch {
    throw new HttpError(401, 'Your session has expired. Please log in again.')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw new HttpError(401, 'This account no longer exists.')

  req.user = user
  next()
})
