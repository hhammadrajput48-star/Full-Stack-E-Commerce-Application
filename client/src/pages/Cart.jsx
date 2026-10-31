import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function Cart() {
  const { cart, updateQty, removeFromCart, checkout, showToast, cartTotal } = useCart()
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [checkedOut, setCheckedOut] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

  const shipping = cart.length > 0 ? 15 : 0
  const discount = promoApplied ? cartTotal * 0.1 : 0
  const total = cartTotal - discount + shipping

  const applyPromo = (e) => {
    e.preventDefault()
    if (promo.trim().toLowerCase() === 'shopco10') setPromoApplied(true)
  }

  const handleCheckout = async () => {
    setPlacingOrder(true)
    try {
      // The server recalculates the totals itself and empties the cart.
      await checkout(promoApplied ? promo.trim() : '')
      setCheckedOut(true)
    } catch (error) {
      showToast(error.message)
    } finally {
      setPlacingOrder(false)
    }
  }

  if (checkedOut) {
    return (
      <section className="section cart-page cart-page--empty">
        <h1>Order placed 🎉</h1>
        <p>Thanks for shopping with us — a confirmation would normally land in your inbox.</p>
        <Link to="/shop" className="btn btn--primary">
          Continue Shopping
        </Link>
      </section>
    )
  }

  if (cart.length === 0) {
    return (
      <section className="section cart-page cart-page--empty">
        <h1>Your cart is empty</h1>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn btn--primary">
          Start Shopping
        </Link>
      </section>
    )
  }

  return (
    <section className="section cart-page">
      <h1 className="section__heading">YOUR CART</h1>

      <div className="cart-page__layout">
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.lineId} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="cart-item__info">
                <h3>{item.name}</h3>
                <p className="cart-item__meta">
                  {item.size && <>Size: {item.size} </>}
                  {item.color && (
                    <span className="cart-item__color" style={{ backgroundColor: item.color }} />
                  )}
                </p>
                <button type="button" className="cart-item__remove" onClick={() => removeFromCart(item.lineId)}>
                  Remove
                </button>
              </div>
              <div className="qty-stepper qty-stepper--sm">
                <button type="button" onClick={() => updateQty(item.lineId, item.qty - 1)}>
                  −
                </button>
                <span>{item.qty}</span>
                <button type="button" onClick={() => updateQty(item.lineId, item.qty + 1)}>
                  +
                </button>
              </div>
              <div className="cart-item__price">${item.price * item.qty}</div>
            </li>
          ))}
        </ul>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          {promoApplied && (
            <div className="cart-summary__row cart-summary__row--discount">
              <span>Discount (10%)</span>
              <span>−${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="cart-summary__row">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <form className="cart-summary__promo" onSubmit={applyPromo}>
            <input
              type="text"
              placeholder="Add promo code (try SHOPCO10)"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
            />
            <button type="submit">Apply</button>
          </form>
          {promoApplied && <p className="newsletter__feedback newsletter__feedback--ok">Promo applied!</p>}

          <button type="button" className="btn btn--primary cart-summary__checkout" onClick={handleCheckout} disabled={placingOrder}>
            Go to Checkout →
          </button>
        </div>
      </div>
    </section>
  )
}
