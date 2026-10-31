// Usage:  npm run seed      (resets the products collection from data/products.json)
import mongoose from 'mongoose'
import { connectDb } from '../db.js'
import { resetProducts } from './seedProducts.js'

try {
  await connectDb()
  const count = await resetProducts()
  console.log(`[seed] ${count} products loaded`)
} catch (error) {
  console.error('[seed] failed:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
