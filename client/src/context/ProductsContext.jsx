import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/http.js'
import { products as bundledProducts } from '../data/products.js'

const ProductsContext = createContext(null)

// Loads the catalogue from the backend (GET /api/products).
// The bundled list in data/products.js is used for the very first paint, so pages never
// flash empty (important when a free-tier server is still waking up). As soon as the API
// answers, the database version replaces it.
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(bundledProducts)

  useEffect(() => {
    let cancelled = false
    api('/products')
      .then((data) => {
        if (!cancelled && Array.isArray(data.products) && data.products.length > 0) setProducts(data.products)
      })
      .catch((error) => console.warn('[products] could not load from the API, using bundled data:', error.message))
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      products,
      newArrivals: products.filter((p) => p.tag === 'new'),
      topSelling: products.filter((p) => p.tag === 'top'),
    }),
    [products],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider')
  return ctx
}
