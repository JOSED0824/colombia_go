import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiGet, onApiMutation, peekCache } from './api'

/**
 * Carga una ruta GET con caché: si ya se pidió antes, la pantalla arranca con ese dato (sin spinner) y solo vuelve a pedir
 * cuando venció. Se recarga al cambiar la ruta o el idioma. `path = null` no pide nada.
 */
export function useApi<T>(path: string | null, options: { refreshOnMutation?: boolean } = {}) {
  const { i18n } = useTranslation()
  const [data, setData] = useState<T | undefined>(() => (path ? peekCache<T>(path) : undefined))
  const [loading, setLoading] = useState(() => !!path && peekCache<T>(path) === undefined)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!path) {
      setData(undefined)
      setLoading(false)
      return
    }
    let cancelled = false
    const cached = peekCache<T>(path)
    setData(cached)
    setLoading(cached === undefined)
    setError(false)

    apiGet<T>(path, { force: attempt > 0 })
      .then((fresh) => {
        if (!cancelled) setData(fresh)
      })
      .catch(() => {
        // Con un dato viejo a la vista no se muestra error: es mejor eso que una pantalla en blanco.
        if (!cancelled && cached === undefined) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [path, i18n.language, attempt])

  // Para datos que cambian con lo que hace la persona (p. ej. sus insignias): se vuelven a pedir tras cada acción.
  useEffect(() => {
    if (!options.refreshOnMutation || !path) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = onApiMutation(() => {
      clearTimeout(timer)
      timer = setTimeout(() => setAttempt((n) => n + 1), 1300)
    })
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [path, options.refreshOnMutation])

  return { data, loading, error, reload: () => setAttempt((n) => n + 1) }
}
