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
  verified: boolean
  bio: string | null // presentación en el idioma de la petición
  experienceYears: number
  toursCount: number
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
  role: Role
}

/** Tipo de cuenta. "admin" solo se asigna a mano en la base. */
export type Role = 'turista' | 'guia' | 'negocio' | 'admin'

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
  category: string // etiqueta que manda la API (español), ej. "Cultura"
  categorySlug: string // culture | nature | food | nightlife — se traduce con t(`categories.${slug}`)
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

// --- Configuración, onboarding, guía de viaje con IA ---------------------------------------------

export type ConfiguracionDto = {
  notifications: boolean
  location: boolean
  reduceMotion: boolean
  language: string // es | en | pt | zh | fr
  onboardingCompleted: boolean
}

export type PreferenciasDto = { categorias: string[] } // slugs: food | culture | nature | nightlife

export type CiudadDto = { nombre: string; totalLugares: number }

export type GenerarGuiaViajeRequest = {
  ciudad: string
  dias: number
  presupuesto: number
  intereses: string[]
}

export type GuiaViajeParadaDto = {
  lugar: LugarResumenDto
  hora: string
  duracionMin: number
  costoAprox: number
  consejo: string
}

export type GuiaViajeDiaDto = { dia: number; tema: string; paradas: GuiaViajeParadaDto[] }

export type GuiaViajeDto = {
  id: number
  ciudad: string
  dias: number
  presupuesto: number
  intereses: string[]
  idioma: string
  titulo: string
  resumen: string
  planDiario: GuiaViajeDiaDto[]
  costoTotalEstimado: number
  presupuestoRestante: number
  excedePresupuesto: boolean
  consejosGenerales: string[]
  queLlevar: string[]
  fechaCreacion: string
}

export type GuiaViajeResumenDto = {
  id: number
  titulo: string
  ciudad: string
  dias: number
  presupuesto: number
  fechaCreacion: string
}

// --- Paneles por rol ------------------------------------------------------------------------------

export type MiLugarDto = {
  id: number
  slug: string
  name: string
  category: string // food | culture | nature | nightlife
  city: string
  region: string
  address: string
  description: string
  tagline: string | null
  hours: string | null
  howToGet: string | null
  priceRange: string // gratis | economico | moderado | costoso | lujo
  entryCost: number | null
  image: string | null
  latitude: number
  longitude: number
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'archivado'
  rejectReason: string | null
  rating: number
  reviewsCount: number
  updatedAt: string
}

export type LugarPendienteDto = {
  id: number
  nombre: string
  slug: string
  categoria: string
  ciudad: string
  registradoPorNombre: string | null
  registradoPorEmail: string | null
  fechaRegistro: string
  descripcion: string
  direccion: string
  imagenUrl: string | null
  latitud: number
  longitud: number
}

export type CalificacionPendienteDto = {
  id: number
  lugarId: number
  lugarNombre: string
  usuarioNombre: string
  usuarioFoto: string | null
  puntuacion: number
  comentario: string | null
  fecha: string
}
