/**
 * Departamentos de Colombia con sus municipios más conocidos (capital primero). Se usa en las listas desplegables de
 * "Publicar lugar" y del perfil del guía; si la ciudad no está, la persona puede escribirla ("Otra").
 */
export const DEPARTAMENTOS: { nombre: string; ciudades: string[] }[] = [
  { nombre: 'Amazonas', ciudades: ['Leticia', 'Puerto Nariño'] },
  { nombre: 'Antioquia', ciudades: ['Medellín', 'Bello', 'Envigado', 'Itagüí', 'Sabaneta', 'Rionegro', 'Guatapé', 'El Peñol', 'Santa Fe de Antioquia', 'Jardín', 'Jericó', 'La Ceja', 'Marinilla', 'Apartadó', 'Turbo'] },
  { nombre: 'Arauca', ciudades: ['Arauca', 'Saravena', 'Tame'] },
  { nombre: 'Atlántico', ciudades: ['Barranquilla', 'Soledad', 'Puerto Colombia', 'Malambo'] },
  { nombre: 'Bogotá D.C.', ciudades: ['Bogotá'] },
  { nombre: 'Bolívar', ciudades: ['Cartagena', 'Mompox', 'Magangué', 'Turbaco', 'San Jacinto'] },
  { nombre: 'Boyacá', ciudades: ['Tunja', 'Villa de Leyva', 'Paipa', 'Duitama', 'Sogamoso', 'Ráquira', 'Monguí'] },
  { nombre: 'Caldas', ciudades: ['Manizales', 'Chinchiná', 'Villamaría', 'Salamina', 'La Dorada'] },
  { nombre: 'Caquetá', ciudades: ['Florencia', 'San Vicente del Caguán'] },
  { nombre: 'Casanare', ciudades: ['Yopal', 'Aguazul', 'Paz de Ariporo'] },
  { nombre: 'Cauca', ciudades: ['Popayán', 'Silvia', 'Santander de Quilichao', 'Guapi'] },
  { nombre: 'Cesar', ciudades: ['Valledupar', 'Aguachica', 'La Paz'] },
  { nombre: 'Chocó', ciudades: ['Quibdó', 'Nuquí', 'Bahía Solano', 'Capurganá'] },
  { nombre: 'Córdoba', ciudades: ['Montería', 'Cereté', 'Lorica', 'San Bernardo del Viento'] },
  { nombre: 'Cundinamarca', ciudades: ['Zipaquirá', 'Chía', 'Soacha', 'Girardot', 'Guatavita', 'Fusagasugá', 'La Calera', 'Villeta'] },
  { nombre: 'Guainía', ciudades: ['Inírida'] },
  { nombre: 'Guaviare', ciudades: ['San José del Guaviare'] },
  { nombre: 'Huila', ciudades: ['Neiva', 'San Agustín', 'Pitalito', 'Villavieja'] },
  { nombre: 'La Guajira', ciudades: ['Riohacha', 'Uribia', 'Maicao', 'Palomino', 'Cabo de la Vela'] },
  { nombre: 'Magdalena', ciudades: ['Santa Marta', 'Ciénaga', 'Minca', 'Taganga'] },
  { nombre: 'Meta', ciudades: ['Villavicencio', 'Acacías', 'Puerto López', 'La Macarena'] },
  { nombre: 'Nariño', ciudades: ['Pasto', 'Ipiales', 'Tumaco'] },
  { nombre: 'Norte de Santander', ciudades: ['Cúcuta', 'Pamplona', 'Ocaña'] },
  { nombre: 'Putumayo', ciudades: ['Mocoa', 'Puerto Asís', 'Sibundoy'] },
  { nombre: 'Quindío', ciudades: ['Armenia', 'Salento', 'Filandia', 'Calarcá', 'Montenegro', 'Quimbaya'] },
  { nombre: 'Risaralda', ciudades: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'Marsella'] },
  { nombre: 'San Andrés y Providencia', ciudades: ['San Andrés', 'Providencia'] },
  { nombre: 'Santander', ciudades: ['Bucaramanga', 'Barichara', 'San Gil', 'Floridablanca', 'Girón', 'Socorro'] },
  { nombre: 'Sucre', ciudades: ['Sincelejo', 'Tolú', 'Coveñas'] },
  { nombre: 'Tolima', ciudades: ['Ibagué', 'Honda', 'Melgar', 'Mariquita'] },
  { nombre: 'Valle del Cauca', ciudades: ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Buga', 'Cartago'] },
  { nombre: 'Vaupés', ciudades: ['Mitú'] },
  { nombre: 'Vichada', ciudades: ['Puerto Carreño'] },
]

export function ciudadesDe(departamento: string): string[] {
  return DEPARTAMENTOS.find((d) => d.nombre === departamento)?.ciudades ?? []
}

/** Departamento al que pertenece una ciudad conocida (para rellenar el formulario al editar). */
export function departamentoDe(ciudad: string): string | null {
  const c = ciudad.trim().toLowerCase()
  return DEPARTAMENTOS.find((d) => d.ciudades.some((x) => x.toLowerCase() === c))?.nombre ?? null
}
