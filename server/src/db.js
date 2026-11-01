import mongoose from 'mongoose'
import { env } from './config/env.js'

mongoose.set('strictQuery', true)

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return // already connected (warm serverless instance)
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 })
  console.log(`[db] connected to MongoDB (${mongoose.connection.name})`)
}
