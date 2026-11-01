import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/error.js'
import authRoutes from './routes/auth.js'
import cartRoutes from './routes/cart.js'
import newsletterRoutes from './routes/newsletter.js'
import orderRoutes from './routes/orders.js'
import productRoutes from './routes/products.js'
import wishlistRoutes from './routes/wishlist.js'
import { HttpError } from './utils/HttpError.js'

export function createApp() {
  const app = express()

  // Hosting platforms (Render, Railway...) sit behind a proxy; this lets
  // rate-limiting see the real visitor IP.
  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors((req, callback) => {
      const origin = req.header('Origin')
      const sameOrigin = origin && origin === `${req.protocol}://${req.get('host')}`
      // No Origin header = curl / server-to-server. Same origin = site and API share one domain (Vercel).
      if (!origin || sameOrigin || env.clientOrigins.includes(origin)) return callback(null, { origin: true })
      callback(new HttpError(403, `Origin ${origin} is not allowed by CORS. Add it to CLIENT_URL on the server.`))
    }),
  )
  app.use(express.json({ limit: '10kb' }))
  if (env.nodeEnv !== 'test') app.use(morgan(env.isProduction ? 'combined' : 'dev'))

  // General limit for the whole API; stricter limit on login/signup (brute-force protection).
  app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }))
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.authRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again in a few minutes.' },
  })

  app.get('/', (_req, res) => res.json({ name: 'SHOP.CO API', status: 'ok', docs: 'See README.md for the endpoint list.' }))
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

  app.use('/api/auth/login', authLimiter)
  app.use('/api/auth/signup', authLimiter)
  app.use('/api/auth', authRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/cart', cartRoutes)
  app.use('/api/wishlist', wishlistRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/newsletter', newsletterRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
