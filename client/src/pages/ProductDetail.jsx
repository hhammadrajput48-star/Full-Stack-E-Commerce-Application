import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import StarRating from '../components/StarRating.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import Reveal from '../components/Reveal.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products } = useProducts()
  const product = products.find((p) => p.id === id)
  const { addToCart, toggleWishlist, isInWishlist } = useCart()

  const [size, setSize] = useState(product?.sizes?.[0] ?? null)
  const [color, setColor] = useState(product?.colors?.[0] ?? null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  // Reset local selection whenever navigating to a different product.
  useEffect(() => {
    setSize(product?.sizes?.[0] ?? null)
    setColor(product?.colors?.[0] ?? null)
    setQty(1)
    setAdded(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id, product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) {
    return (
      <section className="section not-found">
        <h1>Product not found</h1>
        <button className="btn btn--primary" onClick={() => navigate('/shop')}>
          Back to shop
        </button>
      </section>
    )
  }

  const related = products.filter((p) => p.style === product.style && p.id !== product.id).slice(0, 4)
  const gallery = [1, 2, 3, 4].map((n) => `${product.image}?angle=${n}`)

  const handleAdd = () => {
    addToCart(product, { size, color, qty })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <section className="section product-detail">
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{' '}
        <span>{product.name}</span>
      </nav>

      <div className="product-detail__layout">
        <div className="product-detail__gallery">
          <div className="product-detail__thumbs">
            {gallery.map((src, i) => (
              <img key={i} src={src} alt={`${product.name} view ${i + 1}`} />
            ))}
          </div>
          <div className="product-detail__main-image">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        <div className="product-detail__info">
          <h1>{product.name}</h1>
          <StarRating rating={product.rating} reviews={product.reviews} size={16} />

          <div className="product-detail__price">
            <span>${product.price}</span>
            {product.oldPrice && <span className="product-detail__price-old">${product.oldPrice}</span>}
            {product.oldPrice && (
              <span className="badge badge--discount badge--inline">
                -{Math.round(100 - (product.price / product.oldPrice) * 100)}%
              </span>
            )}
          </div>

          <p className="product-detail__description">{product.description}</p>
          <hr />

          {product.colors?.length > 0 && (
            <div className="product-detail__option">
              <h4>Select Colors</h4>
              <div className="swatches">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`swatch ${color === c ? 'is-active' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="product-detail__option">
              <h4>Choose Size</h4>
              <div className="size-options">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`size-pill ${size === s ? 'is-active' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr />

          <div className="product-detail__actions">
            <div className="qty-stepper">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                +
              </button>
            </div>
            <button type="button" className="btn btn--primary product-detail__add" onClick={handleAdd}>
              {added ? 'Added to Cart ✓' : 'Add to Cart'}
            </button>
            <button
              type="button"
              className={`btn btn--outline product-detail__wishlist ${isInWishlist(product.id) ? 'is-active' : ''}`}
              onClick={() => toggleWishlist(product.id)}
            >
              {isInWishlist(product.id) ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="section related-products">
          <Reveal as="h2" className="section__heading">
            YOU MIGHT ALSO LIKE
          </Reveal>
          <ProductGrid products={related} />
        </div>
      )}
    </section>
  )
}
