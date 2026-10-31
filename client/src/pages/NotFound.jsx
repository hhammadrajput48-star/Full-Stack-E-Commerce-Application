import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section not-found">
      <h1>404</h1>
      <p>We couldn't find the page you were looking for.</p>
      <Link to="/" className="btn btn--primary">
        Back to Home
      </Link>
    </section>
  )
}
