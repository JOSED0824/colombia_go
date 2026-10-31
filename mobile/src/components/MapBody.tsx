import React from 'react'
import { WebView } from 'react-native-webview'

type Props = {
  html: string
  /** Mensajes que manda el mapa (JSON en texto), p. ej. { type: 'select', id } al tocar "Ver detalle". */
  onMessage?: (data: string) => void
}

/** Variante nativa (Android/iOS): react-native-webview sí soporta estas plataformas. */
export function MapBody({ html, onMessage }: Props) {
  return (
    <WebView
      source={{ html }}
      style={{ flex: 1 }}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      geolocationEnabled
      mixedContentMode="always"
      onMessage={(event) => onMessage?.(event.nativeEvent.data)}
    />
  )
}
