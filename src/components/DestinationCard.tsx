import { Link } from 'react-router-dom'
import type { Destination } from '../data/destinations'
import { useFavorites } from '../context/FavoritesContext'
import { useSavedRoutes } from '../context/SavedRoutesContext'

export function DestinationCard({ destination }: { destination: Destination }) {
  const { has, toggle } = useFavorites()
  const liked = has(destination.id)
  const { has: isInRoute, toggle: toggleRoute } = useSavedRoutes()
  const saved = isInRoute(destination.id)

  return (
    <article className="card">
      <Link to={`/destino/${destination.id}`} className="card__media" aria-label={destination.name}>
        <img src={destination.image} alt={destination.name} />
      </Link>
      <button
        type="button"
        className={`card__heart ${liked ? 'is-active' : ''}`}
        aria-label={liked ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        onClick={() => toggle(destination.id)}
      >
        <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7-4.6-9.5-8.2C.4 9.8 2.1 6 5.6 6c2 0 3.3 1.1 4.4 2.6C11.1 7.1 12.4 6 14.4 6c3.5 0 5.2 3.8 3.1 6.8C19 16.4 12 21 12 21z" />
        </svg>
      </button>
      <button
        type="button"
        className={`card__route ${saved ? 'is-active' : ''}`}
        aria-label={saved ? 'Quitar de rutas guardadas' : 'Guardar en rutas'}
        onClick={() => toggleRoute(destination.id)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 5h14v14H5z" />
          <path d="m8 9 3 3 5-5M8 16h8" />
        </svg>
      </button>
      <div className="card__body">
        <h3>{destination.name.replace(': Arte y Transformación', '')}</h3>
        <p className="card__meta">
          <span className="card__pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
          </span>
          {destination.city}
          <span className="card__rating">★ {destination.rating.toFixed(1)}</span>
        </p>
      </div>
    </article>
  )
}
