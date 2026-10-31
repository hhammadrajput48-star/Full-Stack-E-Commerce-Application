import React from 'react'
import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Company',
    links: ['About', 'Features', 'Works', 'Career'],
  },
  {
    title: 'Help',
    links: ['Customer Support', 'Delivery Details', 'Terms & Conditions', 'Privacy Policy'],
  },
  {
    title: 'FAQ',
    links: ['Account', 'Manage Deliveries', 'Orders', 'Payments'],
  },
  {
    title: 'Resources',
    links: ['Free eBooks', 'Development Tutorial', 'How to - Blog', 'Youtube Playlist'],
  },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <Link to="/" className="navbar__logo">
            SHOP.CO
          </Link>
          <p>
            We have clothes that suit your style and which you're proud to wear. From women to men.
          </p>
          <div className="site-footer__social">
            {['Twitter', 'Facebook', 'Instagram', 'Github'].map((label) => (
              <a key={label} href="#" aria-label={label} className="site-footer__social-icon">
                {label[0]}
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="site-footer__col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="site-footer__bottom">
        <p>Shop.co © {new Date().getFullYear()}, All Rights Reserved</p>
        <div className="site-footer__payments">
          {['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'GPay'].map((p) => (
            <span key={p} className="payment-chip">
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
