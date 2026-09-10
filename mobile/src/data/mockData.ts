export type Category = 'Todos' | 'Cultura' | 'Naturaleza' | 'Gastronomía' | 'Vida Nocturna'
export type Destination = {
  id: string;
  name: string;
  city: string;
  category: Exclude<Category, 'Todos'>;
  categoryLabel: string;
  rating: number;
  image: any;
  tagline: string;
  description: string;
  price: string;
  hours: string;
  transport: string;
  address: string
}

export const destinations: Destination[] = [
  { id: 'comuna-13', name: 'Comuna 13', city: 'Medellín', category: 'Cultura', categoryLabel: 'Cultura', rating: 4.9, image: require('../../assets/normalized/comuna13.jpg'), tagline: 'Arte, historia y transformación', description: 'Descubre la historia de resiliencia y el arte urbano más vibrante de Medellín. Graffiti, escaleras eléctricas y una comunidad que reescribió su destino.', price: 'Gratis', hours: '8am - 6pm', transport: 'Metro + Metrocable', address: 'Comuna 13, San Javier, Medellín' },
  { id: 'guatape', name: 'Guatapé', city: 'A 2h de Medellín', category: 'Naturaleza', categoryLabel: 'Naturaleza', rating: 4.9, image: require('../../assets/normalized/Arvi.jpg'), tagline: 'Colores, paisajes y magia', description: 'El pueblo más colorido de Colombia y la majestuosa Piedra del Peñol con la mejor vista.', price: 'Desde $15.000', hours: '8am - 6pm', transport: 'Bus', address: 'Guatapé, Antioquia' },
  { id: 'cartagena', name: 'Cartagena', city: 'Cartagena', category: 'Cultura', categoryLabel: 'Cultura', rating: 4.8, image: require('../../assets/normalized/Cartagena.jpg'), tagline: 'Murallas, color y brisa caribeña', description: 'Ciudad amurallada, callejones coloniales, balcones floridos y atardeceres sobre el Caribe.', price: 'Gratis', hours: 'Todo el día', transport: 'A pie o bicitaxi', address: 'Centro Histórico, Cartagena' },
  { id: 'salento', name: 'Salento', city: 'Quindío', category: 'Gastronomía', categoryLabel: 'Gastronomía', rating: 4.9, image: require('../../assets/normalized/salento.jpg'), tagline: 'El corazón del Eje Cafetero', description: 'Palmas de cera, fincas cafeteras y el Valle de Cocora.', price: 'Tours desde $80.000', hours: '7am - 5pm', transport: 'Jeep Willys', address: 'Salento, Quindío' },
]

export const guides = [
  { id: '1', name: 'Mateo', specialty: 'Experto en Café', place: 'Salento, Quindío', rating: '5.0', reviews: '128', price: '$70.000', image: require('../../assets/normalized/guia-mateo.jpg'), tags: ['ES', 'EN'] },
  { id: '2', name: 'Camila', specialty: 'Arte Urbana', place: 'Medellín', rating: '4.9', reviews: '96', price: '$70.000', image: require('../../assets/normalized/guia-Luis.jpg'), tags: ['ES', 'EN'] },
  { id: '3', name: 'Andrés', specialty: 'Senderismo', place: 'Cocora, Quindío', rating: '4.9', reviews: '78', price: '$60.000', image: require('../../assets/normalized/guia-andres.jpg'), tags: ['ES', 'EN'] },
  { id: '4', name: 'María', specialty: 'Cultura & Historia', place: 'Cartagena', rating: '5.0', reviews: '112', price: '$65.000', image: require('../../assets/normalized/Guia-Lucia.jpg'), tags: ['ES', 'EN'] },
]
