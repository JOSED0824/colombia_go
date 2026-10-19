import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { CategoryChips } from '../components/CategoryChips'
import { DestinationCard } from '../components/DestinationCard'
import { type Category, type Destination } from '../data/destinations'
import { apiGet } from '../lib/api'
import { toDestination } from '../lib/mappers'
import type { CategoriaDto, LugarResumenDto, PagedResult } from '../lib/types'

const VALID: Category[] = ['all', 'food', 'culture', 'nature', 'nightlife']

export function ExplorePage() {
  const [params] = useSearchParams()
  const fromUrl = params.get('cat')
  const city = params.get('ciudad')
  const cityLabel = city === 'medellin' ? 'Medellín' : null
  const initial: Category = VALID.includes(fromUrl as Category) ? (fromUrl as Category) : 'all'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>(initial)
  const [categories, setCategories] = useState<{ id: Category; label: string }[]>([{ id: 'all', label: 'Todos' }])
  const [results, setResults] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setCategory(initial)
  }, [initial])

  useEffect(() => {
    apiGet<CategoriaDto[]>('/api/v1/categorias')
      .then((dtos) => {
        setCategories([{ id: 'all', label: 'Todos' }, ...dtos.map((c) => ({ id: c.id as Category, label: c.label }))])
      })
      .catch(() => {
        // keep just "Todos" if categories fail to load — the search itself still works
      })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)

    const searchParams = new URLSearchParams()
    if (query.trim()) searchParams.set('q', query.trim())
    if (category !== 'all') searchParams.set('categoria', category)
    if (cityLabel) searchParams.set('ciudad', cityLabel)

    apiGet<PagedResult<LugarResumenDto>>(`/api/v1/lugares?${searchParams.toString()}`, controller.signal)
      .then((page) => setResults(page.items.map(toDestination)))
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [query, category, cityLabel])

  return (
    <div className="page">
      <header className="page-head">
        <h1>{cityLabel ? `Explorar ${cityLabel}` : 'Explorar'}</h1>
        <p>{cityLabel ? `Descubre los lugares que hacen única a ${cityLabel}` : 'Encuentra tu próxima historia'}</p>
      </header>
      <section className="section">
        <SearchBar value={query} onChange={setQuery} placeholder="¿Qué quieres descubrir hoy?" />
        <CategoryChips active={category} onChange={setCategory} categories={categories} />
        {loading && <p className="empty">Cargando...</p>}
        {error && <p className="empty">No pudimos cargar los lugares. Intenta de nuevo.</p>}
        {!loading && !error && (
          <div className="card-grid">
            {results.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        )}
        {!loading && !error && results.length === 0 && <p className="empty">No hay resultados para esa búsqueda.</p>}
      </section>
    </div>
  )
}
