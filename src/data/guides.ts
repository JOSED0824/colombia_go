export type Guide = {
  id: string
  name: string
  specialty: string
  tag: string
  tagTone: 'purple' | 'green' | 'red' | 'yellow'
  place: string
  rating: number
  reviews: number
  price: string
  languages: string[]
  image: string
  featured?: boolean
  badge?: string
}

export const GUIDES: Guide[] = [
  {
    id: 'mateo',
    name: 'Mateo',
    specialty: 'Experto en Café',
    tag: 'Café',
    tagTone: 'yellow',
    place: 'Salento, Quindío',
    rating: 5,
    reviews: 128,
    price: '$70.000 por hora',
    languages: ['ES', 'EN'],
    image: '/images/guia-mateo.jpg',
    featured: true,
    badge: 'Experto en Café',
  },
  {
    id: 'camila',
    name: 'Sofía',
    specialty: 'Arte Urbana',
    tag: 'Arte Urbano',
    tagTone: 'purple',
    place: 'Medellín',
    rating: 4.9,
    reviews: 96,
    price: '$65.000 por hora',
    languages: ['ES', 'EN'],
    image: '/images/guia-camila.jpg',
  },
  {
    id: 'andres',
    name: 'Andrés',
    specialty: 'Senderismo',
    tag: 'Senderismo',
    tagTone: 'green',
    place: 'Cocora, Quindío',
    rating: 4.8,
    reviews: 74,
    price: '$55.000 por hora',
    languages: ['ES'],
    image: '/images/guide-andres.jpg',
  },
  {
    id: 'lucia',
    name: 'Lucía',
    specialty: 'Cultura e Historia',
    tag: 'Cultura & Historia',
    tagTone: 'red',
    place: 'Cartagena',
    rating: 4.9,
    reviews: 112,
    price: '$80.000 por hora',
    languages: ['ES', 'EN'],
    image: '/images/guide-lucia.jpg',
  },
]
