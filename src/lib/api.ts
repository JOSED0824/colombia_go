const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7174'

// TODO: once login is wired up with Supabase, read the access token from the session
// (supabase.auth.getSession()) and return { Authorization: `Bearer ${token}` } here.
function authHeader(): HeadersInit {
  return {}
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: authHeader(), signal })
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
  return res.json()
}

export async function apiSend<T>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`)
  return res.status === 204 ? (undefined as T) : res.json()
}
