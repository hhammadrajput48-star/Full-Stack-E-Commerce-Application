import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const shopLinks = [
  { label: 'Casual', style: 'casual' },
  { label: 'Formal', style: 'formal' },
  { label: 'Party', style: 'party' },
  { label: 'Gym', style: 'gym' },
]

export default function Navbar() {
  const [announcementClosed, setAnnouncementClosed] = useState(
    () => localStorage.getItem('shopco:announcement-closed') === 'true',
  )
  const [shopOpen, setShopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { cartCount } = useCart()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const closeAnnouncement = () => {
    setAnnouncementClosed(true)
    localStorage.setItem('shopco:announcement-closed', 'true')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : '/shop')
    setMobileOpen(false)
  }

  return (
    <header className="site-header">
      {!announcementClosed && (
        <div className="announcement-bar">
          <p>
            Sign up and get 20% off your first order. <Link to="/shop">Shop Now</Link>
          </p>
          <button
            type="button"
            aria-label="Dismiss announcement"
            className="announcement-bar__close"
            onClick={closeAnnouncement}
          >
            ✕
          </button>
        </div>
      )}

      <nav className="navbar">
        <button
          type="button"
          className={`navbar__burger ${mobileOpen ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
          SHOP.CO
        </Link>

        <ul className="navbar__links">
          <li
            className="navbar__dropdown"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button type="button" className="navbar__dropdown-trigger">
              Shop <Chevron open={shopOpen} />
            </button>
            <div className={`navbar__dropdown-menu ${shopOpen ? 'is-open' : ''}`}>
              {shopLinks.map((link) => (
                <Link key={link.style} to={`/shop?style=${link.style}`} onClick={() => setShopOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </li>
          <li>
            <NavLink to="/shop?sale=true" className="navbar__link">
              On Sale
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop" end className="navbar__link">
              New Arrivals
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop" className="navbar__link">
              Brands
            </NavLink>
          </li>
        </ul>

        <form className="navbar__search" onSubmit={handleSearch}>
          <SearchIcon />
          <input
            type="search"
            placeholder="Search for products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="navbar__actions">
          <Link to="/cart" className="navbar__icon-btn navbar__cart" aria-label="Cart">
            <CartIcon />
            {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
          </Link>
          <Link to={currentUser ? '/dashboard' : '/auth'} className="navbar__icon-btn" aria-label="Account">
            {currentUser ? <span className="navbar__avatar">{currentUser.name[0].toUpperCase()}</span> : <UserIcon />}
          </Link>
        </div>

        <div className={`navbar__mobile-panel ${mobileOpen ? 'is-open' : ''}`}>
          <form className="navbar__search navbar__search--mobile" onSubmit={handleSearch}>
            <SearchIcon />
            <input
              type="search"
              placeholder="Search for products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <Link to="/shop" onClick={() => setMobileOpen(false)}>
            New Arrivals
          </Link>
          {shopLinks.map((link) => (
            <Link key={link.style} to={`/shop?style=${link.style}`} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link to="/cart" onClick={() => setMobileOpen(false)}>
            Cart ({cartCount})
          </Link>
          <Link to={currentUser ? '/dashboard' : '/auth'} onClick={() => setMobileOpen(false)}>
            {currentUser ? 'My Dashboard' : 'Login / Sign Up'}
          </Link>
        </div>
      </nav>
    </header>
  )
}

function Chevron({ open }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className={`chevron ${open ? 'is-open' : ''}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.6-4 5-6 8-6s6.4 2 8 6" />
    </svg>
  )
}
