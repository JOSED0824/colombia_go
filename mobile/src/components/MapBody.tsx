import React from 'react'
import { WebView } from 'react-native-webview'

type Props = { html: string }

/** Variante nativa (Android/iOS): react-native-webview sí soporta estas plataformas. */
export function MapBody({ html }: Props) {
  return <WebView source={{ html }} style={{ flex: 1 }} originWhitelist={['*']} />
}
