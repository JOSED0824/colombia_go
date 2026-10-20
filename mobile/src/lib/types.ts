// Formas de las respuestas de la API (ColombiaGo.Backend, /api/v1). Ver docs/api-contract.md del backend.

export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type LugarResumenDto = {
  id: string // slug, ej. "comuna-13"
  name: string
  region: string
  city: string
  rating: number
  reviewsCount: number
  reviewsLabel: string // "2k reseñas"
  category: string // slug de categoría: culture | nature | food | nightlife
  categoryLabel: string // "Cultura"
  image: string | null
  tagline: string | null
  latitude: number
  longitude: number
}

export type LugarDetalleDto = LugarResumenDto & {
  description: string
  hours: string | null
  price: string
  transport: string | null
  address: string
  gallery: string[]
  features: string[]
  isFavorite: boolean
  isInRoute: boolean
}

export type GuiaDto = {
  id: number
  name: string
  specialty: string
  tag: string
  tagTone: string
  place: string
  rating: number
  reviews: number
  price: string // "$70.000 por hora"
  languages: string[]
  image: string | null
  featured: boolean
  badge: string | null
}

export type RutaDto = {
  id: number
  generated: boolean
  fechaGeneracion: string | null
  tiempoEstimadoMin: number | null
  paradas: LugarResumenDto[]
}

export type GenerarRutaIaRequest = {
  lugarSlugs: string[]
  presupuesto: number
}

export type RutaIaDto = {
  paradas: LugarResumenDto[]
  costoEstimado: number
  explicacion: string
}

export type PerfilDto = {
  id: string
  name: string
  firstName: string
  level: string
  photo: string | null
  places: number
  guides: number
  reviews: number
}

export type LogroDto = {
  id: number
  title: string
  text: string
  tone: string
  icon: string // emoji
  unlocked: boolean
  unlockedAt: string | null
}

// Forma que usan las pantallas de la app (la misma que tenía mockData, más region/reviewsLabel).
export type Destination = {
  id: string
  name: string
  city: string
  region: string
  category: string // etiqueta en español, ej. "Cultura"
  categoryLabel: string
  rating: number
  reviewsLabel: string
  image: any
  tagline: string
  description: string
  price: string
  hours: string
  transport: string
  address: string
  latitude?: number
  longitude?: number
}
