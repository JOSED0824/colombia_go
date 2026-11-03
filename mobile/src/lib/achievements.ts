import { useCallback, useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGet, onApiMutation } from './api'
import type { LogroDto } from './types'

const STORAGE_PREFIX = 'colombiago.achievements.known.'

/**
 * Detecta insignias recién desbloqueadas para celebrarlas con la burbuja.
 *  - Guarda (por usuario) qué insignias ya conocía; la primera vez solo las registra, sin celebrar las viejas.
 *  - Después de cada acción que cambia datos (favorito, ruta, reseña, guía con IA…) vuelve a consultar los logros:
 *    el backend los recalcula en esa consulta, así que ahí aparecen los nuevos.
 * Devuelve la insignia a mostrar ahora (una a la vez) y cómo cerrarla.
 */
export function useAchievementWatcher(userId: string | undefined) {
  const [queue, setQueue] = useState<LogroDto[]>([])
  const known = useRef<Set<number> | null>(null)

  const check = useCallback(async () => {
    if (!userId) return
    let logros: LogroDto[]
    try {
      logros = await apiGet<LogroDto[]>('/api/v1/perfil/logros', { force: true })
    } catch {
      return
    }
    const key = STORAGE_PREFIX + userId
    if (known.current === null) {
      try {
        const raw = await AsyncStorage.getItem(key)
        known.current = raw ? new Set(JSON.parse(raw) as number[]) : null
      } catch {
        known.current = null
      }
    }
    const unlocked = logros.filter((l) => l.unlocked)
    if (known.current === null) {
      // Primera vez en este teléfono: se toman como ya vistas, sin celebrar insignias antiguas.
      known.current = new Set(unlocked.map((l) => l.id))
    } else {
      const nuevas = unlocked.filter((l) => !known.current!.has(l.id))
      if (nuevas.length === 0) return
      nuevas.forEach((l) => known.current!.add(l.id))
      setQueue((q) => [...q, ...nuevas])
    }
    AsyncStorage.setItem(key, JSON.stringify([...known.current])).catch(() => {})
  }, [userId])

  useEffect(() => {
    known.current = null
    setQueue([])
    if (!userId) return
    check()
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = onApiMutation(() => {
      clearTimeout(timer)
      timer = setTimeout(check, 1200) // se agrupan varias acciones seguidas en una sola consulta
    })
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [userId, check])

  return { current: queue[0] ?? null, dismiss: () => setQueue((q) => q.slice(1)) }
}
