import 'dotenv/config'

const required = ['MONGODB_URI', 'JWT_SECRET']
const missing = required.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error(
    `\n[config] Missing required environment variable(s): ${missing.join(', ')}\n` +
      '         Copy server/.env.example to server/.env and fill in the values.\n',
  )
  process.exit(1)
}

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction && process.env.JWT_SECRET.length < 32) {
  console.error('\n[config] JWT_SECRET must be at least 32 characters long in production.\n')
  process.exit(1)
}

const stripTrailingSlash = (url) => url.trim().replace(/\/+$/, '')

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigins: (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map(stripTrailingSlash)
    .filter(Boolean),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 50,
}
