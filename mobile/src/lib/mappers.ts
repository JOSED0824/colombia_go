import { fotoLugar } from './images'
import type { Destination, LugarDetalleDto, LugarResumenDto } from './types'

// Las pantallas filtran por la etiqueta en español; la API filtra por el slug de la categoría.
export const CATEGORIA_SLUG: Record<string, string> = {
  Cultura: 'culture',
  Naturaleza: 'nature',
  'Gastronomía': 'food',
  'Vida Nocturna': 'nightlife',
}

export function toDestination(dto: LugarResumenDto): Destination {
  return {
    id: dto.id,
    name: dto.name,
    city: dto.city,
    region: dto.region,
    category: dto.categoryLabel,
    categoryLabel: dto.categoryLabel,
    rating: Number(dto.rating),
    reviewsLabel: dto.reviewsLabel,
    image: fotoLugar(dto.id, dto.image),
    tagline: dto.tagline ?? '',
    description: '',
    price: '',
    hours: '',
    transport: '',
    address: '',
  }
}

export function toDestinationDetail(dto: LugarDetalleDto): Destination {
  return {
    ...toDestination(dto),
    description: dto.description,
    price: dto.price,
    hours: dto.hours ?? '',
    transport: dto.transport ?? '',
    address: dto.address,
    latitude: Number(dto.latitude),
    longitude: Number(dto.longitude),
  }
}
