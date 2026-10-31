import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import BrandsMarquee from '../components/BrandsMarquee.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import BrowseByStyle from '../components/BrowseByStyle.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Newsletter from '../components/Newsletter.jsx'
import Reveal from '../components/Reveal.jsx'
import { useProducts } from '../context/ProductsContext.jsx'

export default function Home() {
  const { newArrivals, topSelling } = useProducts()
  const [visibleNewArrivals, setVisibleNewArrivals] = useState(4)

  const visibleProducts = newArrivals.slice(0, visibleNewArrivals)
  const hasMoreNewArrivals = visibleNewArrivals < newArrivals.length

  return (
    <>
      <Hero />
      <BrandsMarquee />

      <section className="section">
        <Reveal as="h2" className="section__heading">
          NEW ARRIVALS
        </Reveal>
        <ProductGrid products={visibleProducts} />
        <div className="section__cta">
          {hasMoreNewArrivals ? (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setVisibleNewArrivals((count) => Math.min(count + 4, newArrivals.length))}
            >
              View All
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setVisibleNewArrivals(4)}
            >
              Show Less
            </button>
          )}
        </div>
      </section>

      <hr className="divider" />

      <section className="section">
        <Reveal as="h2" className="section__heading">
          TOP SELLING
        </Reveal>
        <ProductGrid products={topSelling} />
        <div className="section__cta">
          <Link to="/shop" className="btn btn--outline">
            View All
          </Link>
        </div>
      </section>

      <BrowseByStyle />
      <Testimonials />
      <Newsletter />
    </>
  )
}
