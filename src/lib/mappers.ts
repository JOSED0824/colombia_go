import type { Category, Destination } from '../data/destinations'
import type { Guide } from '../data/guides'
import type { GuiaDto, LugarDetalleDto, LugarResumenDto } from './types'

export function toDestination(dto: LugarResumenDto): Destination {
  return {
    id: dto.id,
    name: dto.name,
    region: dto.region,
    city: dto.city,
    rating: dto.rating,
    reviews: dto.reviewsLabel,
    category: dto.category as Exclude<Category, 'all'>,
    categoryLabel: dto.categoryLabel,
    image: dto.image ?? '',
    tagline: dto.tagline ?? '',
    description: '',
    hours: '',
    price: '',
    transport: '',
    address: '',
  }
}

export function toDestinationDetail(dto: LugarDetalleDto): Destination {
  return {
    ...toDestination(dto),
    description: dto.description,
    hours: dto.hours ?? '',
    price: dto.price,
    transport: dto.transport ?? '',
    address: dto.address,
  }
}

export function toGuide(dto: GuiaDto): Guide {
  return {
    id: String(dto.id),
    name: dto.name,
    specialty: dto.specialty,
    tag: dto.tag,
    tagTone: dto.tagTone as Guide['tagTone'],
    place: dto.place,
    rating: dto.rating,
    reviews: dto.reviews,
    price: dto.price,
    languages: dto.languages,
    image: dto.image ?? '',
    featured: dto.featured,
    badge: dto.badge ?? undefined,
  }
}
