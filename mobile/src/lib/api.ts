import { supabase } from './supabase'
import { getLanguage } from '../i18n'

const API_URL = process.env.EXPO_PUBLIC_API_URL

/**
 * Página del backend a la que llegan los enlaces de los correos de Supabase (confirmar cuenta, recuperar contraseña).
 * Sin esto Supabase usa su "Site URL" por defecto, que es localhost: en el teléfono el enlace no abre nada.
 */
export const AUTH_REDIRECT_URL = API_URL ? `${API_URL}/auth/confirmado` : undefined

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

// ---------------------------------------------------------------------------------------------------------------
// Caché de respuestas GET (en memoria, por sesión de la app).
//
// Sin esto, cada vez que se abre una pestaña (Inicio, Guías, Perfil, un detalle...) la pantalla se monta de nuevo y vuelve a
// pedir lo mismo al servidor: se ve un spinner y se gasta red. Ahora:
//   - una respuesta se reutiliza durante CACHE_TTL_MS (la pantalla se pinta al instante con lo que ya se tiene);
//   - dos pantallas que piden lo mismo a la vez comparten una sola petición;
//   - cualquier cambio (POST/PUT/DELETE) descarta lo que depende de la persona (favoritos, rutas, perfil, guías de viaje),
//     pero deja el catálogo (lugares, guías locales) que no cambia por esas acciones;
//   - la clave incluye el idioma, y todo se borra al cerrar sesión o entrar con otra cuenta.
// ---------------------------------------------------------------------------------------------------------------
const CACHE_TTL_MS = 5 * 60 * 1000
const CATALOG_PREFIXES = ['/api/v1/lugares', '/api/v1/guias']

type CacheEntry = { at: number; data: unknown }
const cache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<unknown>>()
let cachedUserId: string | null | undefined

function cacheKey(path: string) {
  return `${getLanguage()}|${path}`
}

const isCatalog = (path: string) => CATALOG_PREFIXES.some((p) => path.startsWith(p))

/** Descarta lo guardado. Sin argumento borra todo; con `keepCatalog` conserva lugares y guías locales. */
export function clearApiCache(keepCatalog = false) {
  for (const key of [...cache.keys()]) {
    const path = key.slice(key.indexOf('|') + 1)
    if (!keepCatalog || !isCatalog(path)) cache.delete(key)
  }
}

// Al entrar con otra cuenta o cerrar sesión no puede quedar nada de la persona anterior.
supabase.auth.onAuthStateChange((_event, session) => {
  const userId = session?.user?.id ?? null
  if (cachedUserId !== undefined && cachedUserId !== userId) clearApiCache()
  cachedUserId = userId
})

/** Lo último guardado para esta ruta (aunque ya esté vencido), o undefined. Sirve para pintar la pantalla sin esperar. */
export function peekCache<T>(path: string): T | undefined {
  return cache.get(cacheKey(path))?.data as T | undefined
}

export async function apiGet<T>(path: string, options: { force?: boolean } = {}): Promise<T> {
  const key = cacheKey(path)
  const hit = cache.get(key)
  if (!options.force && hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data as T

  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>

  const request = (async () => {
    const res = await fetch(`${API_URL}${path}`, { headers: await headers() })
    if (!res.ok) throw await toError(res, `GET ${path}`)
    const data = await res.json()
    cache.set(key, { at: Date.now(), data })
    return data as T
  })().finally(() => inflight.delete(key))

  inflight.set(key, request)
  return request
}

/** Pide en segundo plano (de a una, sin molestar a lo que el usuario está viendo) rutas que probablemente va a abrir, para que ya estén en la caché. */
export async function prefetch(paths: string[]) {
  for (const path of paths) {
    try {
      await apiGet(path)
    } catch {
      // es solo un adelanto: si falla, la pantalla lo pedirá cuando haga falta
    }
  }
}

export async function apiSend<T = void>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  /** true = esta llamada no cambia datos que se vean en pantallas (p. ej. registrar que se abrió un lugar). */
  options: { keepCache?: boolean } = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: await headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw await toError(res, `${method} ${path}`)
  if (!options.keepCache) clearApiCache(true)
  return res.status === 204 ? (undefined as T) : res.json()
}
