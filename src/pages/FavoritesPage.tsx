import { DestinationCard } from '../components/DestinationCard'
import { Button } from '../components/Button'
import { useFavorites } from '../context/FavoritesContext'
import { DESTINATIONS } from '../data/destinations'

export function FavoritesPage() {
  const { ids } = useFavorites()
  const saved = DESTINATIONS.filter((d) => ids.includes(d.id))

  return (
    <div className="page">
      <header className="page-head">
        <h1>Favoritos</h1>
        <p>Solo los lugares que marcaste con el corazón❤️</p>
      </header>
      <section className="section">
        {saved.length === 0 ? (
          <div className="empty-state">
            <p>Aún no has guardado destinos.</p>
            <Button to="/explorar">Explorar Colombia</Button>
          </div>
        ) : (
          <div className="card-grid">
            {saved.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
