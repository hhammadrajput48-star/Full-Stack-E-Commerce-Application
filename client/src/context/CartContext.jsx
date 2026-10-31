import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api/http.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

const MAX_QTY = 99

// The cart and wishlist now live in the database, per user (not in localStorage).
//
// Every change is applied to the screen immediately ("optimistic update") so the UI feels
// instant, then sent to the server. Requests are sent one at a time, in order, and the
// server's answer is treated as the source of truth once the queue is empty.
export function CartProvider({ children }) {
  const { currentUser } = useAuth()
  const userId = currentUser?.id ?? null

  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [toast, setToast] = useState(null)

  const userRef = useRef(userId)
  userRef.current = userId
  const queue = useRef(Promise.resolve())
  const pending = useRef(0)

  const reload = useCallback(async () => {
    try {
      const [cartData, wishlistData] = await Promise.all([api('/cart'), api('/wishlist')])
      setCart(cartData.items)
      setWishlist(wishlistData.wishlist)
    } catch (error) {
      setToast(error.message)
    }
  }, [])

  // Load this user's cart + wishlist after login / page refresh; clear them on logout.
  useEffect(() => {
    if (!userId) {
      setCart([])
      setWishlist([])
      return undefined
    }
    let cancelled = false
    Promise.all([api('/cart'), api('/wishlist')])
      .then(([cartData, wishlistData]) => {
        if (cancelled) return
        setCart(cartData.items)
        setWishlist(wishlistData.wishlist)
      })
      .catch((error) => {
        if (!cancelled) setToast(error.message)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  // Auto-dismiss toast notifications.
  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  // Send a change to the server (in order). `apply` copies the server's answer into state,
  // but only when no newer change is still waiting - otherwise it would overwrite it.
  const sync = (request, apply) => {
    const owner = userRef.current
    pending.current += 1
    queue.current = queue.current
      .then(request)
      .then((data) => {
        if (pending.current === 1 && userRef.current === owner) apply(data)
      })
      .catch(async (error) => {
        // Roll back: show what went wrong and re-sync with what the server really has.
        setToast(error.message)
        if (userRef.current === owner) await reload()
      })
      .finally(() => {
        pending.current -= 1
      })
  }

  const addToCart = (product, options = {}) => {
    const { size = product.sizes?.[0] ?? null, color = product.colors?.[0] ?? null, qty = 1 } = options
    const lineId = `${product.id}__${size}__${color}`

    setCart((prev) => {
      const existing = prev.find((item) => item.lineId === lineId)
      if (existing) {
        return prev.map((item) => (item.lineId === lineId ? { ...item, qty: Math.min(item.qty + qty, MAX_QTY) } : item))
      }
      return [
        ...prev,
        {
          lineId,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size,
          color,
          qty,
        },
      ]
    })
    setToast(`${product.name} added to cart`)

    sync(
      () => api('/cart/items', { method: 'POST', body: { productId: product.id, size, color, qty } }),
      (data) => setCart(data.items),
    )
  }

  const removeFromCart = (lineId) => {
    setCart((prev) => prev.filter((i) => i.lineId !== lineId))
    sync(
      () => api(`/cart/items/${encodeURIComponent(lineId)}`, { method: 'DELETE' }),
      (data) => setCart(data.items),
    )
  }

  const updateQty = (lineId, qty) => {
    if (qty <= 0) {
      removeFromCart(lineId)
      return
    }
    const nextQty = Math.min(qty, MAX_QTY)
    setCart((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, qty: nextQty } : i)))
    sync(
      () => api(`/cart/items/${encodeURIComponent(lineId)}`, { method: 'PATCH', body: { qty: nextQty } }),
      (data) => setCart(data.items),
    )
  }

  const clearCart = () => {
    setCart([])
    sync(
      () => api('/cart', { method: 'DELETE' }),
      (data) => setCart(data.items),
    )
  }

  const toggleWishlist = (productId) => {
    const wished = wishlist.includes(productId)
    setWishlist((prev) => (wished ? prev.filter((id) => id !== productId) : [...prev, productId]))
    sync(
      () => api(`/wishlist/${encodeURIComponent(productId)}`, { method: wished ? 'DELETE' : 'PUT' }),
      (data) => setWishlist(data.wishlist),
    )
  }

  const isInWishlist = (productId) => wishlist.includes(productId)

  // Place the order. The server recalculates prices/discount/shipping itself, then empties the cart.
  // Throws if it fails (e.g. invalid promo code) so the Cart page can show the message.
  const checkout = async (promoCode = '') => {
    await queue.current // let any in-flight cart edits reach the server first
    const data = await api('/orders', { method: 'POST', body: { promoCode } })
    setCart([])
    return data.order
  }

  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.qty * i.price, 0), [cart])

  const value = {
    cart,
    wishlist,
    toast,
    showToast: setToast,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    toggleWishlist,
    isInWishlist,
    checkout,
    cartCount,
    cartTotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
