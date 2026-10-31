import { rebuildThemedStyles } from './themed'

export type ThemeMode = 'light' | 'dark'

// Paleta clara = la original de la app (no cambia nada). Paleta oscura = mismos roles, otros valores.
//   BLUE      texto e íconos de marca sobre el fondo de la app (en oscuro es un azul claro legible)
//   INK       texto/íconos sobre amarillo: siempre azul oscuro
//   PRIMARY   fondo de los botones principales
//   CREAM     fondo de pantalla · CARD/WHITE superficies (tarjetas, campos, barra inferior)
const LIGHT = {
  YELLOW: '#FFD100',
  RED: '#E63946',
  BLUE: '#003B7D',
  INK: '#003B7D',
  PRIMARY: '#003B7D',
  CREAM: '#FFF8ED',
  WHITE: '#FFFFFF',
  CARD: '#FFFFFF',
  AUTH_BG: '#FFFFFF',
  SURFACE2: '#EEF4FB',
  TEXT_BLUE: '#003B7D',
  TEXT_BODY: '#455669',
  TEXT_MUTED: '#8AA0B8',
  GRAY_LIGHT: '#F0F4F8',
  BORDER: '#CBD8E5',
}

const DARK: typeof LIGHT = {
  YELLOW: '#FFD100',
  RED: '#FF5D6C',
  BLUE: '#9DC1FF',
  INK: '#003B7D',
  PRIMARY: '#2F6FDF',
  CREAM: '#0E1621',
  WHITE: '#172230',
  CARD: '#172230',
  AUTH_BG: '#0E1621',
  SURFACE2: '#1D2C3D',
  TEXT_BLUE: '#9DC1FF',
  TEXT_BODY: '#B7C5D6',
  TEXT_MUTED: '#8FA3BA',
  GRAY_LIGHT: '#213245',
  BORDER: '#2C3E52',
}

export const COLORS: typeof LIGHT = { ...LIGHT }

let currentMode: ThemeMode = 'light'

export function getThemeMode(): ThemeMode {
  return currentMode
}

/** Cambia la paleta y reconstruye todos los estilos; hay que volver a renderizar la app después. */
export function applyTheme(mode: ThemeMode) {
  currentMode = mode
  Object.assign(COLORS, mode === 'dark' ? DARK : LIGHT)
  rebuildThemedStyles()
}

/** La app siempre abre en modo claro (sin importar el modo del teléfono); el oscuro se activa a mano en Configuración y dura la sesión. */
export async function loadSavedTheme(): Promise<ThemeMode> {
  applyTheme('light')
  return 'light'
}

export async function saveTheme(_mode: ThemeMode) {
  // Intencionalmente no se guarda: en cada apertura se vuelve al modo claro.
}
