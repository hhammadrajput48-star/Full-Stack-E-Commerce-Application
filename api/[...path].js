
import { createApp } from '../server/src/app.js'
import { connectDb } from '../server/src/db.js'

const app = createApp()

export default async function handler(req, res) {
  try {
    await connectDb()
    return app(req, res)
  } catch (error) {
    console.error('API Error:', error)

    if (!res.headersSent) {
      return res.status(500).json({
        message: 'Server error. Please try again later.'
      })
    }
  }
}
