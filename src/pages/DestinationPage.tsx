import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { useSavedRoutes } from '../context/SavedRoutesContext'
import { DESTINATIONS } from '../data/destinations'

export function DestinationPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const dest = DESTINATIONS.find((d) => d.id === id)
  const { has, toggle } = useFavorites()
  const { has: isInRoute, toggle: toggleRoute } = useSavedRoutes()
  const [more, setMore] = useState(false)

  if (!dest) {
    return (
      <section className="section">
        <p className="empty">Lugar no encontrado.</p>
        <Link className="btn btn--primary" to="/explorar">
          Volver a explorar
        </Link>
      </section>
    )
  }

  const liked = has(dest.id)
  const saved = isInRoute(dest.id)

  return (
    <div className="detail">
      <div className="detail__hero">
        <img src={dest.image} alt={dest.name} />
        <button type="button" className="float-btn" onClick={() => nav(-1)} aria-label="Volver">
          ←
        </button>
        <button
          type="button"
          className={`float-btn float-btn--right ${liked ? 'is-liked' : ''}`}
          onClick={() => toggle(dest.id)}
          aria-label={liked ? 'Quitar de favoritos' : 'Guardar'}
        >
          ♥
        </button>
        <button
          type="button"
          className={`float-btn float-btn--route ${saved ? 'is-saved' : ''}`}
          onClick={() => toggleRoute(dest.id)}
          aria-label={saved ? 'Quitar de rutas guardadas' : 'Guardar en rutas'}
        >
          ✦
        </button>
      </div>
      <section className="sheet">
        <div className="sheet__handle" />
        <div className="sheet__title">
          <h1>{dest.name}</h1>
          <div className="mini-logo" aria-hidden="true">
            <span />
            <small>COLOMBIAGO</small>
          </div>
        </div>
        <p className="sheet__rate">
          ★ {dest.rating.toFixed(1)} <span>({dest.reviews})</span>
        </p>
        <p className="sheet__desc">
          {more ? dest.description : `${dest.description.slice(0, 110)}… `}
          <button type="button" className="text-link" onClick={() => setMore((v) => !v)}>
            {more ? 'Ver menos' : 'Ver más'}
          </button>
        </p>
        <div className="map-box">
          <div className="map-box__pins">
            <span>🚇 Metrocable</span>
            <span>🚶 Escaleras eléctricas</span>
          </div>
          <p>📍 {dest.address}</p>
        </div>
        <div className="info-bar">
          <div>
            <span className="info-dot info-dot--blue">⏱</span>
            <strong>Horarios</strong>
            <small>{dest.hours}</small>
          </div>
          <div>
            <span className="info-dot info-dot--green">🏷</span>
            <strong>Precio</strong>
            <small>{dest.price}</small>
          </div>
          <div>
            <span className="info-dot info-dot--purple">🚆</span>
            <strong>Cómo llegar</strong>
            <small>{dest.transport}</small>
          </div>
        </div>
        <a
          className="btn btn--primary btn--block"
          href={`https://maps.google.com/?q=${encodeURIComponent(dest.address)}`}
          target="_blank"
          rel="noreferrer"
        >
          Ir a este lugar <span>→</span>
        </a>
      </section>
    </div>
  )
}
