import React, { useEffect, useMemo, useRef } from 'react'

type Props = { html: string; onMessage?: (data: string) => void }

/** Variante web: react-native-webview no soporta navegador, pero un <iframe> hace lo mismo (un documento
 * HTML aislado) y existe en cualquier browser. Se carga desde una URL `blob:` y no con `srcDoc`: en un srcdoc
 * el worker de MapLibre no llega a arrancar y el mapa se queda cargando para siempre. */
export function MapBody({ html, onMessage }: Props) {
  const ref = useRef<HTMLIFrameElement>(null)
  const url = useMemo(() => URL.createObjectURL(new Blob([html], { type: 'text/html' })), [html])

  useEffect(() => () => URL.revokeObjectURL(url), [url])

  // El mapa avisa con window.parent.postMessage; solo se atienden los mensajes de este iframe.
  useEffect(() => {
    function handle(event: MessageEvent) {
      if (event.source !== ref.current?.contentWindow) return
      if (typeof event.data === 'string') onMessage?.(event.data)
    }
    window.addEventListener('message', handle)
    return () => window.removeEventListener('message', handle)
  }, [onMessage])

  return <iframe ref={ref} src={url} style={{ flex: 1, border: 0, width: '100%', height: '100%' }} allow="geolocation" />
}
