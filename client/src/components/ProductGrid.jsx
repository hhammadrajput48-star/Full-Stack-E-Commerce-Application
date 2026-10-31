import React from 'react'
import ProductCard from './ProductCard.jsx'
import Reveal from './Reveal.jsx'

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <p className="empty-state">No products match this filter yet.</p>
  }

  return (
    <div className="product-grid">
      {products.map((product, i) => (
        <Reveal key={product.id} delay={(i % 4) * 80}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  )
}
