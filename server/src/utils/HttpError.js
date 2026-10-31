// An error with an HTTP status code. Anything thrown as HttpError is sent to the
// browser as { message } with that status.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}
