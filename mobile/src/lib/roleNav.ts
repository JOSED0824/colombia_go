import type { Role } from './types'

export type NavTab = { id: string; label: string; icon: string }

/**
 * Pestañas de la barra inferior según el tipo de cuenta. El turista ve la app de siempre; el guía y el negocio abren
 * en su propio panel, y conservan Explorar para ver la app como la ve un turista.
 */
const TABS: Record<Role, NavTab[]> = {
  turista: [
    { id: 'Inicio', label: 'nav.home', icon: 'home' },
    { id: 'Explorar', label: 'nav.explore', icon: 'compass' },
    { id: 'Guías', label: 'nav.guides', icon: 'book' },
    { id: 'IA', label: 'nav.ai', icon: 'sparkles' },
    { id: 'Favoritos', label: 'nav.favorites', icon: 'heart' },
    { id: 'Perfil', label: 'nav.profile', icon: 'person' },
  ],
  guia: [
    { id: 'MiGuia', label: 'nav.myGuide', icon: 'id-card' },
    { id: 'Explorar', label: 'nav.explore', icon: 'compass' },
    { id: 'Guías', label: 'nav.guides', icon: 'book' },
    { id: 'Perfil', label: 'nav.profile', icon: 'person' },
  ],
  negocio: [
    { id: 'MiNegocio', label: 'nav.myBusiness', icon: 'storefront' },
    { id: 'Publicar', label: 'nav.publish', icon: 'add-circle' },
    { id: 'Explorar', label: 'nav.explore', icon: 'compass' },
    { id: 'Perfil', label: 'nav.profile', icon: 'person' },
  ],
  admin: [
    { id: 'Moderar', label: 'nav.moderate', icon: 'shield-checkmark' },
    { id: 'Inicio', label: 'nav.home', icon: 'home' },
    { id: 'Explorar', label: 'nav.explore', icon: 'compass' },
    { id: 'Guías', label: 'nav.guides', icon: 'book' },
    { id: 'Perfil', label: 'nav.profile', icon: 'person' },
  ],
}

export function tabsForRole(role: Role): NavTab[] {
  return TABS[role] ?? TABS.turista
}

/** Todas las pestañas posibles (para saber si un destino de navegación es una pestaña). */
export const ALL_TAB_IDS = new Set(Object.values(TABS).flat().map((t) => t.id))
