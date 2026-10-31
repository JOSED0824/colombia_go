import { Image } from 'react-native'

/** URL de una imagen (require() o { uri }) que se pueda usar dentro del WebView del mapa; null si no hay una. */
export function assetUrl(source: any): string | null {
  try {
    const uri = Image.resolveAssetSource(source)?.uri
    // En desarrollo (Expo Go) los assets salen del servidor de Metro por http; en un build suelto son file://,
    // que el WebView no puede leer: en ese caso la tarjeta usa el ícono de la categoría.
    return uri && /^https?:/.test(uri) ? uri : null
  } catch {
    return null
  }
}
