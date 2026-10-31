import { fotoGuia } from './images'
import type { GuiaDto } from './types'

export type Guia = {
  id: string
  name: string
  specialty: string
  place: string
  rating: string
  reviews: string
  price: string
  image: any
  tags: string[]
  featured: boolean
  verified: boolean
  bio: string | null
  experienceYears: number
  toursCount: number
}

export function toGuia(dto: GuiaDto): Guia {
  return {
    id: String(dto.id),
    name: dto.name,
    specialty: dto.specialty,
    place: dto.place,
    rating: Number(dto.rating).toFixed(1),
    reviews: String(dto.reviews),
    price: dto.price.match(/\$[\d.,]+/)?.[0] ?? dto.price, // la pantalla muestra "por hora" (traducido) aparte
    image: fotoGuia(dto.name, dto.image),
    tags: dto.languages,
    featured: dto.featured,
    verified: dto.verified ?? false,
    bio: dto.bio ?? null,
    experienceYears: dto.experienceYears ?? 0,
    toursCount: dto.toursCount ?? 0,
  }
}
