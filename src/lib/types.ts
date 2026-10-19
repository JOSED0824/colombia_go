export type PagedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type LugarResumenDto = {
  id: string
  name: string
  region: string
  city: string
  rating: number
  reviewsCount: number
  reviewsLabel: string
  category: string
  categoryLabel: string
  image: string | null
  tagline: string | null
}

export type LugarDetalleDto = LugarResumenDto & {
  description: string
  hours: string | null
  price: string
  transport: string | null
  address: string
  latitude: number
  longitude: number
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
  price: string
  languages: string[]
  image: string | null
  featured: boolean
  badge: string | null
}

export type CategoriaDto = {
  id: string
  label: string
  icon: string | null
  tone: string | null
}
