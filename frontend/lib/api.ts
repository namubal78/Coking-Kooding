export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function parseJwt(token: string): Record<string, string> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const EMAIL_NAMES: Record<string, string> = {
  'namubal78@gmail.com': '은새아빠',
  '1993jhk@gmail.com': '은새엄마',
}

export function getDisplayName(email: string): string {
  return EMAIL_NAMES[email] ?? email
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) throw new Error(`${res.status}`)
  return res
}

export async function apiUpload(path: string, formData: FormData) {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: formData })
  if (!res.ok) throw new Error(`${res.status}`)
  return res
}
