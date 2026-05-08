import type { RecipientSizeResult, NotifyResult } from './types'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export async function submitSize(giver: string, size: string, recipient: string): Promise<RecipientSizeResult> {
  return req('/api/size', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: giver, size, recipientName: recipient }),
  })
}

export async function subscribeNotification(giver: string, email: string, recipient: string): Promise<NotifyResult> {
  return req('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: giver, email, recipientName: recipient }),
  })
}

export async function fetchRecipientSize(recipient: string): Promise<string | null> {
  const data = await req<{ size: string | null }>(`/api/size/${encodeURIComponent(recipient)}`)
  return data.size
}
