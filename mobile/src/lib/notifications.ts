import { useCallback, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'
import { useApi } from './useApi'
import type { LogroDto } from './types'

export type AppNotification = {
  id: string
  icon: string
  color: string
  title: string
  text: string
  /** Pestaña a la que lleva al tocarla (Inicio, Explorar, Guías, IA, Favoritos, Perfil). */
  target?: string
}

const STORAGE_KEY = 'colombiago.notifications.seen'

// Qué avisos ya se leyeron: se comparte entre la campana de Inicio y la pantalla de Notificaciones.
let seen = new Set<string>()
let loaded = false
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

async function loadSeen() {
  if (loaded) return
  loaded = true
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (raw) seen = new Set(JSON.parse(raw) as string[])
  } catch {
    // sin almacenamiento: todo se muestra como nuevo en esta sesión
  }
  emit()
}

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...seen])).catch(() => {})
}

/**
 * Avisos de la app: insignias que ya ganaste (vienen de la API de logros) y consejos para sacarle provecho a la app.
 * Los consejos son fijos y se traducen; no hay un servicio de notificaciones push todavía.
 */
export function useNotifications() {
  const { t } = useTranslation()
  const { data: logros } = useApi<LogroDto[]>('/api/v1/perfil/logros', { refreshOnMutation: true })
  const [, setTick] = useState(0)

  useEffect(() => {
    const rerender = () => setTick((n) => n + 1)
    listeners.add(rerender)
    loadSeen()
    return () => {
      listeners.delete(rerender)
    }
  }, [])

  const items = useMemo<AppNotification[]>(() => {
    const badges: AppNotification[] = (logros ?? [])
      .filter((l) => l.unlocked)
      .map((l) => {
        const name = t(`achievements.${l.id}.title`, { defaultValue: l.title })
        return {
          id: `logro-${l.id}`,
          icon: 'trophy',
          color: '#F59E0B',
          title: t('notifications.badgeTitle', { name }),
          text: t(`achievements.${l.id}.text`, { defaultValue: l.text }),
          target: 'Perfil',
        }
      })

    const tips: AppNotification[] = [
      { id: 'tip-ai', icon: 'sparkles', color: '#8B5CF6', title: t('notifications.tipAiTitle'), text: t('notifications.tipAiText'), target: 'IA' },
      { id: 'tip-guides', icon: 'book', color: '#10B981', title: t('notifications.tipGuidesTitle'), text: t('notifications.tipGuidesText'), target: 'Guías' },
      { id: 'tip-map', icon: 'map', color: '#3B82F6', title: t('notifications.tipMapTitle'), text: t('notifications.tipMapText'), target: 'Explorar' },
    ]
    return [...badges, ...tips]
  }, [logros, t])

  const unread = items.filter((n) => !seen.has(n.id)).length

  const markSeen = useCallback((id: string) => {
    if (seen.has(id)) return
    seen = new Set(seen).add(id)
    persist()
    emit()
  }, [])

  const markAllSeen = useCallback(() => {
    seen = new Set([...seen, ...items.map((n) => n.id)])
    persist()
    emit()
  }, [items])

  return { items, unread, isSeen: (id: string) => seen.has(id), markSeen, markAllSeen }
}
