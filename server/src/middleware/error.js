import { ZodError } from 'zod'
import { env } from '../config/env.js'
import { HttpError } from '../utils/HttpError.js'

export const notFound = (req, _res, next) => next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`))

// Central place that turns any thrown error into a clean JSON response.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  // Bad input (zod)
  if (err instanceof ZodError) {
    const issue = err.issues[0]
    const field = issue.path.join('.')
    const message =
      issue.code === 'invalid_type' && issue.received === 'undefined'
        ? `${field || 'Field'} is required.`
        : issue.message
    return res.status(400).json({ message, details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })) })
  }

  // Our own errors
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, ...(err.details ? { details: err.details } : {}) })
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body is not valid JSON.' })

  // MongoDB unique index violation (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0]
    return res.status(409).json({
      message: field === 'email' ? 'An account with this email already exists.' : 'That value is already in use.',
    })
  }

  if (err.name === 'CastError' || err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Invalid data was sent.' })
  }

  console.error('[error]', err)
  res.status(500).json({ message: env.isProduction ? 'Something went wrong on the server.' : err.message })
}
