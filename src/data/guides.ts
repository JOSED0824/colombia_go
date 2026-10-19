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
