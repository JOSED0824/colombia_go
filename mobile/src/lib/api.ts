import { supabase } from './supabase'
import { getLanguage } from '../i18n'

const API_URL = process.env.EXPO_PUBLIC_API_URL

/** Dirección del backend con la que se armó la app (para mostrarla en los avisos de conexión). */
export const API_BASE = API_URL ?? '(EXPO_PUBLIC_API_URL sin definir)'

/** true si el backend responde en /health; se usa para avisar al usuario cuando no hay conexión con el servidor. */
export async function pingApi(): Promise<boolean> {
  if (!API_URL) return false
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(`${API_URL}/health`, { signal: controller.signal })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/** Error de la API: `code` es el `title` del ProblemDetails (p. ej. "GuiaIa.LimiteAlcanzado"). */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | null,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Adjunta el access_token de la sesión de Supabase (la API lo valida en los endpoints protegidos) y el
// idioma actual: la API traduce el contenido y los textos con Accept-Language.
async function headers(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return {
    'Content-Type': 'application/json',
    'Accept-Language': getLanguage(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function toError(res: Response, label: string): Promise<ApiError> {
  let code: string | null = null
  try {
    const body = await res.json()
    code = typeof body?.title === 'string' ? body.title : null
  } catch {
    // respuesta sin cuerpo JSON
  }
  return new ApiError(res.status, code, `${label} -> ${res.status}`)
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: await headers() })
  if (!res.ok) throw await toError(res, `GET ${path}`)
  return res.json()
}

export async function apiSend<T = void>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: await headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw await toError(res, `${method} ${path}`)
  return res.status === 204 ? (undefined as T) : res.json()
}
