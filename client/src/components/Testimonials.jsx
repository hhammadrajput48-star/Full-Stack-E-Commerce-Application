import React, { useState } from 'react'
import { testimonials } from '../data/products.js'
import Reveal from './Reveal.jsx'

const PER_PAGE = 3

export default function Testimonials() {
  const pageCount = Math.ceil(testimonials.length / PER_PAGE)
  const [page, setPage] = useState(0)

  const next = () => setPage((p) => (p + 1) % pageCount)
  const prev = () => setPage((p) => (p - 1 + pageCount) % pageCount)

  return (
    <section className="section testimonials">
      <div className="testimonials__header">
        <h2 className="section__heading">OUR HAPPY CUSTOMERS</h2>
        <div className="testimonials__nav">
          <button type="button" onClick={prev} aria-label="Previous testimonials">
            ←
          </button>
          <button type="button" onClick={next} aria-label="Next testimonials">
            →
          </button>
        </div>
      </div>

      <div className="testimonials__viewport">
        <div className="testimonials__track" style={{ transform: `translateX(-${page * 100}%)` }}>
          {Array.from({ length: pageCount }).map((_, pageIndex) => (
            <div className="testimonials__page" key={pageIndex}>
              {testimonials.slice(pageIndex * PER_PAGE, pageIndex * PER_PAGE + PER_PAGE).map((t) => (
                <Reveal key={t.id} as="article" className="testimonial-card">
                  <div className="testimonial-card__stars">{'★'.repeat(t.rating)}</div>
                  <h3>
                    {t.name} <VerifiedIcon />
                  </h3>
                  <p>"{t.text}"</p>
                </Reveal>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VerifiedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#01ab31">
      <path d="M12 2l2.4 1.9 3-.5 1.1 2.9 2.9 1.1-.5 3L23 12l-1.9 2.4.5 3-2.9 1.1-1.1 2.9-3-.5L12 23l-2.4-1.9-3 .5-1.1-2.9-2.9-1.1.5-3L1 12l1.9-2.4-.5-3 2.9-1.1L6.4 2.6l3 .5L12 2z" />
      <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
