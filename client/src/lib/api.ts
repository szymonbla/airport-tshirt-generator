import type { RecipientSizeResult, NotifyResult } from './types'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit & { body?: unknown }): Promise<T> {
  const isBodyObject = init?.body !== undefined && typeof init.body !== 'string'
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(isBodyObject ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    body: isBodyObject ? JSON.stringify(init.body) : (init?.body as BodyInit | undefined),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `${res.status} ${res.statusText}` }))
    return Promise.reject(errorBody)
  }

  return res.json() as Promise<T>
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path)
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body })
  },
}

export async function submitSize(giver: string, size: string, recipient: string): Promise<RecipientSizeResult> {
  return apiClient.post('/api/size', { name: giver, size, recipientName: recipient })
}

export async function subscribeNotification(giver: string, email: string, recipient: string): Promise<NotifyResult> {
  return apiClient.post('/api/notify', { name: giver, email, recipientName: recipient })
}

export async function fetchRecipientSize(recipient: string): Promise<string | null> {
  const data = await apiClient.get<{ size: string | null }>(`/api/size/${encodeURIComponent(recipient)}`)
  return data.size
}
