export type Category = 'all' | 'food' | 'culture' | 'nature' | 'nightlife'

export type Destination = {
  id: string
  name: string
  region: string
  city: string
  rating: number
  reviews: string
  category: Exclude<Category, 'all'>
  categoryLabel: string
  image: string
  tagline: string
  description: string
  hours: string
  price: string
  transport: string
  address: string
}

export const HOME_CATEGORIES: { id: Exclude<Category, 'all'>; label: string; tone: string }[] = [
  { id: 'food', label: 'Gastronomía', tone: 'yellow' },
  { id: 'culture', label: 'Cultura', tone: 'blue' },
  { id: 'nature', label: 'Naturaleza', tone: 'green' },
  { id: 'nightlife', label: 'Vida nocturna', tone: 'red' },
]

export const USER = {
  name: 'Camilo Restrepo',
  firstName: 'Camilo',
  level: 'Viajero Nivel 5',
  photo: '/images/camilo.jpg',
  places: 15,
  guides: 8,
  reviews: 12,
}
