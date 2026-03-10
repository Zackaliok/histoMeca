export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function authHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
  return headers
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message ?? 'Erreur serveur')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function apiRequest<T>(
  path: string,
  body: unknown,
  accessToken?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiGet<T>(path: string, accessToken?: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
  return handleResponse<T>(res)
}
