// Vercel serverless entry point: every /api/* request is handled by the Express app.
// (Locally you don't use this file - `npm run dev` runs server/src/index.js instead.)
import { createApp } from '../server/src/app.js'
import { connectDb } from '../server/src/db.js'
import { seedProductsIfEmpty } from '../server/src/seed/seedProducts.js'

const app = createApp()

// Connect (and seed an empty database) once per warm instance, not on every request.
let ready
const init = () => {
  ready ??= (async () => {
    await connectDb()
    await seedProductsIfEmpty()
  })().catch((error) => {
    ready = undefined // try again on the next request
    throw error
  })
  return ready
}

export default async function handler(req, res) {
  try {
    await init()
  } catch (error) {
    console.error('[api] database connection failed:', error.message)
    return res.status(500).json({ message: 'Could not connect to the database.' })
  }
  return app(req, res)
}
