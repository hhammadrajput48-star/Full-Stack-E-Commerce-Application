import mongoose from 'mongoose'
import { createApp } from './app.js'
import { env } from './config/env.js'
import { connectDb } from './db.js'
import { seedProductsIfEmpty } from './seed/seedProducts.js'

try {
  await connectDb()

  const seeded = await seedProductsIfEmpty()
  if (seeded) console.log(`[seed] products collection was empty - loaded ${seeded} products`)

  const server = createApp().listen(env.port, () => {
    console.log(`[server] SHOP.CO API listening on port ${env.port} (${env.nodeEnv})`)
    console.log(`[server] allowed frontend origin(s): ${env.clientOrigins.join(', ')}`)
  })

  // Close cleanly when the host stops the process (deploys, Ctrl+C).
  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down`)
    server.close(async () => {
      await mongoose.disconnect()
      process.exit(0)
    })
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
} catch (error) {
  console.error('[server] failed to start:', error.message)
  process.exit(1)
}
