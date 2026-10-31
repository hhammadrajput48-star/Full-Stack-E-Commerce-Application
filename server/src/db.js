import mongoose from 'mongoose'
import { env } from './config/env.js'

mongoose.set('strictQuery', true)

export async function connectDb() {
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 })
  console.log(`[db] connected to MongoDB (${mongoose.connection.name})`)
}
