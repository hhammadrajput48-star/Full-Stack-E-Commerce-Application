import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import StarRating from './StarRating.jsx'

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const wished = isInWishlist(product.id)

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(100 - (product.price / product.oldPrice) * 100)
      : null

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" />

        <button
          type="button"
          className={`product-card__wishlist ${wished ? 'is-active' : ''}`}
          onClick={handleWishlist}
          aria-pressed={wished}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon filled={wished} />
        </button>

        {discount && <span className="badge badge--discount">-{discount}%</span>}

        <button type="button" className="product-card__quick-add" onClick={handleQuickAdd}>
          {justAdded ? 'Added ✓' : 'Quick Add'}
        </button>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <StarRating rating={product.rating} />
        <div className="product-card__price">
          <span className="product-card__price-current">${product.price}</span>
          {product.oldPrice && (
            <span className="product-card__price-old">${product.oldPrice}</span>
          )}
          {discount && <span className="badge badge--discount badge--inline">-{discount}%</span>}
        </div>
      </div>
    </Link>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6.7-4.35-9.3-8.28C.8 9.86 1.6 6.2 4.7 5.02 7 4.15 9.2 5 10.5 6.9L12 8.9l1.5-2C14.8 5 17 4.15 19.3 5.02c3.1 1.18 3.9 4.84 2 7.7C18.7 16.65 12 21 12 21z" />
    </svg>
  )
}
