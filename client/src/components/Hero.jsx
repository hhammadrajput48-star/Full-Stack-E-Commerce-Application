import React from 'react'
import { Link } from 'react-router-dom'

const stats = [
  { value: '200+', label: 'International Brands' },
  { value: '2,000+', label: 'High-Quality Products' },
  { value: '30,000+', label: 'Happy Customers' },
]

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__text">
        <h1 className="hero__title">
          FIND CLOTHES
          <br />
          THAT MATCHES
          <br />
          YOUR STYLE
        </h1>
        <p className="hero__subtitle">
          Browse through our diverse range of meticulously crafted garments, designed to bring out
          your individuality and cater to your sense of style.
        </p>
        <Link to="/shop" className="btn btn--primary hero__cta">
          Shop Now
        </Link>

        <dl className="hero__stats">
          {stats.map((s) => (
            <div key={s.label} className="hero__stat">
              <dt>{s.value}</dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="hero__media">
        <img
          src="/Images/Hero-Photo.jpg"
          alt="Two models wearing denim jackets"
        />
        <span className="hero__sparkle hero__sparkle--large" aria-hidden="true">
          <SparkleIcon />
        </span>
        <span className="hero__sparkle hero__sparkle--small" aria-hidden="true">
          <SparkleIcon />
        </span>
      </div>
    </section>
  )
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor">
      <path d="M20 0c1.5 9 9 16.5 20 20-11 3.5-18.5 11-20 20-1.5-9-9-16.5-20-20 11-3.5 18.5-11 20-20z" />
    </svg>
  )
}
