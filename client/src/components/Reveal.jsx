import React from 'react'
import useReveal from '../hooks/useReveal.js'

// Wraps any children in a fade/slide-up reveal animation triggered on scroll.
// `as` lets the caller pick the wrapping tag, `delay` staggers groups of items.
export default function Reveal({ children, as: Tag = 'div', delay = 0, className = '' }) {
  const [ref, visible] = useReveal()

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  )
}
