import { Link } from 'react-router-dom'
import { GUIDES } from '../data/guides'

export function GuidesPage() {
  const featured = GUIDES.find((g) => g.featured) ?? GUIDES[0]
  const others = GUIDES.filter((g) => g.id !== featured.id)

  return (
    <div className="page">
      <header className="guides-head">
        <div>
          <h1 className="serif">Guías Locales</h1>
          <div className="flag-line" />
        </div>
        <button type="button" className="icon-btn icon-btn--plain" aria-label="Buscar guías">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </button>
      </header>

      <article className="guide-hero">
        <img src={featured.image} alt="" />
        <div className="guide-hero__copy">
          <span className="pill">{featured.badge}</span>
          <h2 className="serif">
            {featured.name}, {featured.specialty}
          </h2>
          <p>📍 {featured.place}</p>
          <p>★ {featured.rating.toFixed(1)} ({featured.reviews} reseñas)</p>
        </div>
        <Link className="btn btn--primary btn--block" to="/perfil">
          📅 Reservar experiencia
        </Link>
      </article>

      <section className="section">
        <div className="section__head">
          <h2>
            Otros guías auténticos <span aria-hidden="true">👒</span>
          </h2>
          <span className="more">Ver todos ›</span>
        </div>
        <div className="guide-list">
          {others.map((g) => (
            <article key={g.id} className="guide-row">
              <img src={g.image} alt="" />
              <div>
                <h3>
                  {g.name}, {g.specialty}
                </h3>
                <div className="guide-row__tags">
                  <span className={`mini-tag mini-tag--${g.tagTone}`}>{g.tag}</span>
                  {g.languages.map((l) => (
                    <span key={l} className="lang">
                      {l}
                    </span>
                  ))}
                  <span className="star">★ {g.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="guide-row__price">
                <strong>{g.price}</strong>
                <span>›</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
