// react-native-web no trae Image.resolveAssetSource; se arma la ruta igual que lo hace su componente Image.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getAssetByID } = require('react-native-web/dist/modules/AssetRegistry')

/** URL de una imagen (require() o { uri }) que se pueda usar dentro del iframe del mapa; null si no hay una. */
export function assetUrl(source: any): string | null {
  try {
    if (typeof source === 'number') {
      const asset = getAssetByID(source)
      if (!asset) return null
      const scale = asset.scales[0]
      // Absoluta: el iframe del mapa se carga desde una URL blob:, donde una ruta relativa no resolvería.
      return `${window.location.origin}${asset.httpServerLocation}/${asset.name}${scale !== 1 ? `@${scale}x` : ''}.${asset.type}`
    }
    if (source && typeof source.uri === 'string') {
      return source.uri.startsWith('/') ? `${window.location.origin}${source.uri}` : source.uri
    }
    return null
  } catch {
    return null
  }
}
