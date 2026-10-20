import React from 'react'

type Props = { html: string }

/** Variante web: react-native-webview no soporta navegador, pero un <iframe> con srcDoc hace
 * exactamente lo mismo (un documento HTML aislado) y existe de forma nativa en cualquier browser. */
export function MapBody({ html }: Props) {
  return (
    <iframe
      srcDoc={html}
      style={{ flex: 1, border: 0, width: '100%', height: '100%' }}
      sandbox="allow-scripts allow-same-origin"
    />
  )
}
