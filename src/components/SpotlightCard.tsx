import { Link } from 'react-router-dom'
import type { Destination } from '../data/destinations'

export function SpotlightCard({ destination }: { destination: Destination }) {
  return (
    <Link to={`/destino/${destination.id}`} className="spot" aria-label={destination.name}>
      <img src={destination.image} alt="" />
      <div className="spot__veil" />
      <span className="spot__rate">★ {destination.rating.toFixed(1)}</span>
      <span className={`spot__tag spot__tag--${destination.category}`}>{destination.categoryLabel}</span>
      <div className="spot__copy">
        <h3>{destination.name.replace(': Arte y Transformación', '')}</h3>
        <p>{destination.tagline}</p>
        <small>📍 {destination.city}</small>
      </div>
    </Link>
  )
}
