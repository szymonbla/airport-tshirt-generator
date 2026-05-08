import type { RecipientSizeResult, NotifyResult, Trip, TripDetail } from './types'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit, jsonBody?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(jsonBody !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    body: jsonBody !== undefined ? JSON.stringify(jsonBody) : init?.body,
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
  post<T>(path: string, body: object): Promise<T> {
    return request<T>(path, { method: 'POST' }, body)
  },
}

export async function submitSize(tripId: number, giver: string, size: string, recipient: string): Promise<RecipientSizeResult> {
  return apiClient.post('/api/size', { tripId, name: giver, size, recipientName: recipient })
}

export async function subscribeNotification(tripId: number, giver: string, email: string, recipient: string): Promise<NotifyResult> {
  return apiClient.post('/api/notify', { tripId, name: giver, email, recipientName: recipient })
}

export async function fetchRecipientSize(tripId: number, recipient: string): Promise<string | null> {
  const data = await apiClient.get<{ size: string | null }>(`/api/size/${encodeURIComponent(recipient)}?tripId=${tripId}`)
  return data.size
}

export async function fetchTrips(): Promise<Trip[]> {
  return apiClient.get('/api/trips')
}

export async function createTrip(name: string): Promise<Trip> {
  return apiClient.post('/api/trips', { name })
}

export async function fetchTrip(id: number): Promise<TripDetail> {
  return apiClient.get(`/api/trips/${id}`)
}

export async function runDraw(tripId: number, participants: string[]): Promise<{ giverName: string; recipientName: string }[]> {
  return apiClient.post(`/api/trips/${tripId}/draw`, { participants })
}
