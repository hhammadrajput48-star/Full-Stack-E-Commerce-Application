import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const { cartCount, wishlist } = useCart()
  const firstName = currentUser.name.split(' ')[0]

  return (
    <section className="account-page section">
      <div className="account-header">
        <div>
          <p className="account-eyebrow">MY ACCOUNT</p>
          <h1>Welcome, {firstName}</h1>
        </div>
        <Link to="/profile" className="btn btn--outline">View Profile</Link>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card dashboard-card--dark">
          <span>Account status</span>
          <strong>Active member</strong>
          <p>Signed in as {currentUser.email}</p>
        </article>
        <article className="dashboard-card">
          <span>Shopping cart</span>
          <strong>{cartCount} {cartCount === 1 ? 'item' : 'items'}</strong>
          <Link to="/cart">View cart →</Link>
        </article>
        <article className="dashboard-card">
          <span>Wishlist</span>
          <strong>{wishlist.length} saved</strong>
          <Link to="/shop">Explore products →</Link>
        </article>
      </div>

      <div className="dashboard-actions">
        <div>
          <p className="account-eyebrow">QUICK ACTIONS</p>
          <h2>What would you like to do?</h2>
        </div>
        <div className="dashboard-actions__buttons">
          <Link to="/shop" className="btn btn--primary">Start Shopping</Link>
          <Link to="/profile" className="btn btn--outline">Manage Profile</Link>
        </div>
      </div>
    </section>
  )
}
