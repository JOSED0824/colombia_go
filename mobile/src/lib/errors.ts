import i18n from '../i18n'
import { ApiError } from './api'

/** Texto amigable (en el idioma actual) para un error lanzado por apiGet/apiSend. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code && i18n.exists(`apiErrors.${error.code}`)) return i18n.t(`apiErrors.${error.code}`)
    if (error.status === 401) return i18n.t('apiErrors.unauthorized')
    return i18n.t('apiErrors.generic')
  }
  // fetch lanza TypeError cuando no hay red / el servidor no responde
  return i18n.t('common.noConnection')
}

/** Traduce los mensajes (en inglés) de Supabase Auth a un texto en el idioma actual. */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return i18n.t('auth.errors.invalidCredentials')
  if (m.includes('email not confirmed')) return i18n.t('auth.errors.emailNotConfirmed')
  if (m.includes('already registered') || m.includes('already been registered')) return i18n.t('auth.errors.alreadyRegistered')
  if (m.includes('password should be at least') || m.includes('weak password')) return i18n.t('auth.errors.weakPassword')
  if (m.includes('unable to validate email') || m.includes('invalid email')) return i18n.t('auth.errors.invalidEmail')
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) return i18n.t('auth.errors.rateLimit')
  return i18n.t('auth.errors.generic')
}

/** True si Supabase rechazó el inicio de sesión porque el correo aún no se verificó. */
export function isEmailNotConfirmed(error: { message?: string; code?: string } | null): boolean {
  return !!error && (error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message ?? ''))
}
