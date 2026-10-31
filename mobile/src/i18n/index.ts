import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'
import AsyncStorage from '@react-native-async-storage/async-storage'

import es from './locales/es.json'
import en from './locales/en.json'
import pt from './locales/pt.json'
import zh from './locales/zh.json'
import fr from './locales/fr.json'

export type LanguageCode = 'es' | 'en' | 'pt' | 'zh' | 'fr'

export const LANGUAGES: { code: LanguageCode; native: string; flag: string }[] = [
  { code: 'es', native: 'Español', flag: '🇨🇴' },
  { code: 'en', native: 'English', flag: '🇺🇸' },
  { code: 'pt', native: 'Português', flag: '🇧🇷' },
  { code: 'fr', native: 'Français', flag: '🇫🇷' },
  { code: 'zh', native: '中文 (Mandarín)', flag: '🇨🇳' },
]

const STORAGE_KEY = 'colombiago.language'

/** Normaliza "zh-Hans-CN", "pt-BR", "en_US"… a uno de los 5 idiomas de la app; si no, español. */
export function normalizeLanguage(code?: string | null): LanguageCode {
  const short = (code ?? '').toLowerCase().split(/[-_]/)[0]
  return (LANGUAGES.some((l) => l.code === short) ? short : 'es') as LanguageCode
}

function deviceLanguage(): LanguageCode {
  try {
    return normalizeLanguage(Localization.getLocales()[0]?.languageCode)
  } catch {
    return 'es'
  }
}

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    pt: { translation: pt },
    zh: { translation: zh },
    fr: { translation: fr },
  },
  lng: deviceLanguage(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export function getLanguage(): LanguageCode {
  return normalizeLanguage(i18n.language)
}

/** Cambia el idioma de toda la app y lo recuerda en el dispositivo. */
export async function setLanguage(code: LanguageCode): Promise<void> {
  await i18n.changeLanguage(code)
  try {
    await AsyncStorage.setItem(STORAGE_KEY, code)
  } catch {
    // si no se puede guardar, igual queda aplicado en esta sesión
  }
}

/** Recupera el idioma elegido antes (si existe); si no, queda el del teléfono. */
export async function loadSavedLanguage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY)
    if (saved) await i18n.changeLanguage(normalizeLanguage(saved))
  } catch {
    // se usa el idioma del teléfono
  }
}

/** True si el usuario ya eligió un idioma explícitamente alguna vez. */
export async function hasSavedLanguage(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) !== null
  } catch {
    return false
  }
}

/** Formato de dinero siempre en pesos colombianos, con separadores colombianos. */
export function formatCop(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`
}

export default i18n
