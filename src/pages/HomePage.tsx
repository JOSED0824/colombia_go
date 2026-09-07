import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HomeHeader } from '../components/HomeHeader'
import { SpotlightCard } from '../components/SpotlightCard'
import { DESTINATIONS, FEATURED, HOME_CATEGORIES, type Category } from '../data/destinations'

export function HomePage() {
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  const featured = FEATURED[slide]

  const spots = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DESTINATIONS.filter(
      (d) =>
        d.city.toLowerCase() === 'medellín' && (!q ||
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q)),
    )
  }, [query])

  return (
    <div className="page">
      <HomeHeader value={query} onChange={setQuery} />

      <article className="feature">
        <img src={featured.image} alt="" />
        <div className="feature__panel">
          <p className="feature__city">
            {featured.city.toUpperCase()} 📍
          </p>
          <h2>{featured.title}</h2>
          <p>{featured.text}</p>
          <Link className="btn btn--primary btn--compact" to={`/explorar?ciudad=${featured.id}`}>
            {featured.cta} ›
          </Link>
        </div>
        <div className="feature__dots">
          {FEATURED.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={i === slide ? 'is-on' : ''}
              aria-label={`Destacado ${item.city}`}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </article>

      <section className="cat-row" aria-label="Categorías">
        {HOME_CATEGORIES.map((cat) => (
          <Link key={cat.id} className="cat" to={`/explorar?cat=${cat.id}`}>
            <span className={`cat__bubble cat__bubble--${cat.tone}`}>
              <CatIcon id={cat.id} />
            </span>
            <span>{cat.label}</span>
          </Link>
        ))}
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Imperdibles de Medellín</h2>
          <Link className="more" to="/explorar?ciudad=medellin">
            Ver todos ›
          </Link>
        </div>
        <div className="spot-row">
          {spots.slice(0, 4).map((d) => (
            <SpotlightCard key={d.id} destination={d} />
          ))}
        </div>
        {spots.length === 0 && <p className="empty">No encontramos lugares con esa búsqueda.</p>}
      </section>
    </div>
  )
}

function CatIcon({ id }: { id: Exclude<Category, 'all'> }) {
  if (id === 'food') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 14c0 5 16 5 16 0" />
        <path d="M6 14c1-6 11-6 12 0" />
        <path d="M8 5v3M12 4v4M16 5v3" />
      </svg>
    )
  }
  if (id === 'culture') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 11 12 5l8 6" />
        <path d="M6 11v8h12v-8" />
        <path d="M10 19v-5h4v5" />
      </svg>
    )
  }
  if (id === 'nature') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 18 10 8l4 6 2-3 4 7" />
        <path d="M14 8c2-4 6-4 6 0" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
    </svg>
  )
}
