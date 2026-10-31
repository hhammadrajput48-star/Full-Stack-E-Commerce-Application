import React from 'react'

export default function StarRating({ rating = 0, reviews, size = 14 }) {
  const stars = [0, 1, 2, 3, 4]

  return (
    <div className="star-rating" aria-label={`Rated ${rating} out of 5`}>
      <span className="star-rating__stars">
        {stars.map((i) => {
          const fillPercent = Math.max(0, Math.min(1, rating - i)) * 100
          return (
            <span className="star-rating__star" key={i} style={{ width: size, height: size }}>
              <span className="star-rating__star star-rating__star--base">★</span>
              <span className="star-rating__star star-rating__star--fill" style={{ width: `${fillPercent}%` }}>
                ★
              </span>
            </span>
          )
        })}
      </span>
      <span className="star-rating__value">{rating.toFixed(1)}/5</span>
      {reviews != null && <span className="star-rating__reviews">({reviews})</span>}
    </div>
  )
}
