import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { CategoryChips } from '../components/CategoryChips'
import { DestinationCard } from '../components/DestinationCard'
import { DESTINATIONS, type Category } from '../data/destinations'

const VALID: Category[] = ['all', 'food', 'culture', 'nature', 'nightlife']

export function ExplorePage() {
  const [params] = useSearchParams()
  const fromUrl = params.get('cat')
  const city = params.get('ciudad')
  const cityLabel = city === 'medellin' ? 'Medellín' : null
  const initial: Category = VALID.includes(fromUrl as Category) ? (fromUrl as Category) : 'all'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>(initial)

  useEffect(() => {
    setCategory(initial)
  }, [initial])

  const results = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      const matchesCat = category === 'all' || d.category === category
      const matchesCity = !cityLabel || d.city.toLowerCase() === cityLabel.toLowerCase()
      const q = query.trim().toLowerCase()
      return matchesCat && matchesCity && (!q || `${d.name} ${d.city} ${d.region} ${d.description}`.toLowerCase().includes(q))
    })
  }, [query, category, cityLabel])

  return (
    <div className="page">
      <header className="page-head">
        <h1>{cityLabel ? `Explorar ${cityLabel}` : 'Explorar'}</h1>
        <p>{cityLabel ? `Descubre los lugares que hacen única a ${cityLabel}` : 'Encuentra tu próxima historia'}</p>
      </header>
      <section className="section">
        <SearchBar value={query} onChange={setQuery} placeholder="¿Qué quieres descubrir hoy?" />
        <CategoryChips active={category} onChange={setCategory} />
        <div className="card-grid">
          {results.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
        </div>
        {results.length === 0 && <p className="empty">No hay resultados para esa búsqueda.</p>}
      </section>
    </div>
  )
}
