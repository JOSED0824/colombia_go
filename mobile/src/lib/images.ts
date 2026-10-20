// La API devuelve rutas de imagen de la web (ej. "/images/comuna13.jpg") que no existen en la app.
// Mientras las fotos no estén en Supabase Storage, se usan las de assets/normalized por id del lugar.
// Si la API devuelve una URL completa (http...), se usa esa directamente.

const LOGO = require('../../assets/normalized/Logo-oficial-Colombia-GO.jpeg')

const FOTOS_LUGARES: Record<string, any> = {
  'comuna-13': require('../../assets/normalized/comuna13.jpg'),
  'parque-arvi': require('../../assets/normalized/Arvi.jpg'),
  'pueblito-paisa': require('../../assets/normalized/Pueblito paisa.jpg'),
  'museo-de-antioquia': require('../../assets/normalized/Museo Antioquia.jpg'),
  provenza: require('../../assets/normalized/provenza.jpg'),
  guatape: require('../../assets/normalized/guatape.jpg'),
  cartagena: require('../../assets/normalized/Cartagena.jpg'),
  mompox: require('../../assets/normalized/Santa-Cruz-de-Mompox.jpg'),
  salento: require('../../assets/normalized/salento.jpg'),
  jardin: require('../../assets/normalized/jardin.jpg'),
  tayrona: require('../../assets/normalized/Tayrona.jpg'),
  cali: require('../../assets/normalized/Cali.jpg'),
  bogota: require('../../assets/normalized/Bogota.jpg'),
  'san-andres': require('../../assets/normalized/San-Andres.jpg'),
  'villa-de-leyva': require('../../assets/normalized/villadeLeyva.jpg'),
  barichara: require('../../assets/normalized/barichara.jpg'),
  'santa-marta': require('../../assets/normalized/Santa-Marta.jpg'),
  popayan: require('../../assets/normalized/Popayan.jpg'),
}

const FOTOS_GUIAS: Record<string, any> = {
  mateo: require('../../assets/normalized/guia-mateo.jpg'),
  sofia: require('../../assets/normalized/guia-Luis.jpg'),
  andres: require('../../assets/normalized/guia-andres.jpg'),
  lucia: require('../../assets/normalized/Guia-Lucia.jpg'),
}

function esUrlCompleta(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//.test(url)
}

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function fotoLugar(id: string, url?: string | null) {
  if (esUrlCompleta(url)) return { uri: url }
  return FOTOS_LUGARES[id] ?? LOGO
}

export function fotoGuia(nombre: string, url?: string | null) {
  if (esUrlCompleta(url)) return { uri: url }
  return FOTOS_GUIAS[normalizar(nombre)] ?? LOGO
}
