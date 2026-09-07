import { DestinationCard } from '../components/DestinationCard'
import { Button } from '../components/Button'
import { useSavedRoutes } from '../context/SavedRoutesContext'
import { DESTINATIONS } from '../data/destinations'

export function SavedRoutesPage() {
  const { ids } = useSavedRoutes()
  const saved = DESTINATIONS.filter((destination) => ids.includes(destination.id))

  return (
    <div className="page">
      <header className="page-head">
        <h1>Rutas guardadas</h1>
        <p>Solo las paradas que elegiste para tu recorrido</p>
      </header>
      <section className="section">
        <div className="route-intro">
          <span className="route-intro__icon" aria-hidden="true">✦</span>
          <div>
            <strong>{saved.length} {saved.length === 1 ? 'parada guardada' : 'paradas guardadas'}</strong>
            <p>Guarda lugares desde Explorar y crea tu ruta a tu ritmo.</p>
          </div>
        </div>
        {saved.length === 0 ? (
          <div className="empty-state">
            <p>Tu ruta todavía está vacía.</p>
            <Button to="/explorar">Explorar destinos</Button>
          </div>
        ) : (
          <div className="card-grid">
            {saved.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
