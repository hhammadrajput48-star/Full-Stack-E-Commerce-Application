import React from 'react'
import { Link } from 'react-router-dom'
import { dressStyles } from '../data/products.js'
import Reveal from './Reveal.jsx'

export default function BrowseByStyle() {
  return (
    <section className="section browse-style">
      <Reveal as="div" className="browse-style__panel">
        <h2 className="section__heading">BROWSE BY DRESS STYLE</h2>
        <div className="browse-style__grid">
          {dressStyles.map((style, i) => (
            <Reveal key={style.id} delay={i * 100} className="browse-style__cell">
              <Link to={`/shop?style=${style.id}`} className="style-card">
                <img src={style.image} alt={style.label} loading="lazy" />
                <span className="style-card__label">{style.label}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
