import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import { openTestDb } from '../testDb.js'
import { sizeRoutes } from './size.js'
import type { AppEnv } from '../types.js'

function makeApp() {
  const db = openTestDb()
  const sendEmail = vi.fn().mockResolvedValue(undefined)

  const app = new Hono<AppEnv>()
  app.use('*', async (c, next) => {
    c.set('db', db)
    c.set('sendEmail', sendEmail)
    await next()
  })
  app.route('/api', sizeRoutes)
  return { app, sendEmail }
}

async function postSize(app: Hono<AppEnv>, body: object) {
  return app.request('/api/size', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function postNotify(app: Hono<AppEnv>, body: object) {
  return app.request('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function getSize(app: Hono<AppEnv>, name: string, tripId?: number) {
  const qs = tripId !== undefined ? `?tripId=${tripId}` : ''
  return app.request(`/api/size/${encodeURIComponent(name)}${qs}`)
}

const T = 1

describe('POST /api/size', () => {
  it('returns known:true with size when recipient exists', async () => {
    const { app } = makeApp()
    await postSize(app, { tripId: T, name: 'Alice', size: 'MEGA MAŁY', recipientName: 'Bob' })
    const res = await postSize(app, { tripId: T, name: 'Bob', size: 'GRUBY', recipientName: 'Alice' })
    expect(await res.json()).toEqual({ known: true, size: 'MEGA MAŁY' })
  })

  it('returns known:false when recipient not yet submitted', async () => {
    const { app } = makeApp()
    const res = await postSize(app, { tripId: T, name: 'Alice', size: 'MEGA MAŁY', recipientName: 'Bob' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ known: false })
  })

  it('returns 400 for invalid size', async () => {
    const { app } = makeApp()
    const res = await postSize(app, { tripId: T, name: 'Alice', size: 'XXXL', recipientName: 'Bob' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when tripId missing', async () => {
    const { app } = makeApp()
    const res = await postSize(app, { name: 'Alice', size: 'GRUBY', recipientName: 'Bob' })
    expect(res.status).toBe(400)
  })

  it('upserts on duplicate POST', async () => {
    const { app } = makeApp()
    await postSize(app, { tripId: T, name: 'Alice', size: 'MEGA MAŁY', recipientName: 'Bob' })
    await postSize(app, { tripId: T, name: 'Alice', size: 'ŚREDNIA AZJATYCKA', recipientName: 'Bob' })
    const res = await getSize(app, 'Alice', T)
    expect((await res.json() as any).size).toBe('ŚREDNIA AZJATYCKA')
  })

  it('scopes participants by trip', async () => {
    const { app } = makeApp()
    await postSize(app, { tripId: 1, name: 'Alice', size: 'MEGA MAŁY', recipientName: 'Bob' })
    const res = await getSize(app, 'Alice', 2)
    expect((await res.json() as any).size).toBeNull()
  })

  it('cleans up pending_notifications after recipient submits', async () => {
    const { app } = makeApp()
    await postSize(app, { tripId: T, name: 'Alice', size: 'MEGA MAŁY', recipientName: 'Bob' })
    await postNotify(app, { tripId: T, name: 'Alice', email: 'alice@x.com', recipientName: 'Bob' })
    const res = await postSize(app, { tripId: T, name: 'Bob', size: 'GRUBY', recipientName: 'Charlie' })
    expect(res.status).toBe(200)
  })
})

describe('POST /api/notify', () => {
  it('returns subscribed:true when recipient size unknown', async () => {
    const { app } = makeApp()
    await postSize(app, { tripId: T, name: 'Alice', size: 'MEGA MAŁY', recipientName: 'Bob' })
    const res = await postNotify(app, { tripId: T, name: 'Alice', email: 'alice@x.com', recipientName: 'Bob' })
    expect(await res.json()).toEqual({ subscribed: true })
  })

  it('returns alreadyKnown when recipient already submitted', async () => {
    const { app } = makeApp()
    await postSize(app, { tripId: T, name: 'Bob', size: 'GRUBY', recipientName: 'Alice' })
    await postSize(app, { tripId: T, name: 'Alice', size: 'MEGA MAŁY', recipientName: 'Bob' })
    const res = await postNotify(app, { tripId: T, name: 'Alice', email: 'alice@x.com', recipientName: 'Bob' })
    expect(await res.json()).toEqual({ alreadyKnown: true, size: 'GRUBY' })
  })

  it('returns 400 when fields missing', async () => {
    const { app } = makeApp()
    const res = await postNotify(app, { tripId: T, name: 'Alice', email: '', recipientName: 'Bob' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when tripId missing', async () => {
    const { app } = makeApp()
    const res = await postNotify(app, { name: 'Alice', email: 'alice@x.com', recipientName: 'Bob' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/size/:name', () => {
  it('returns size for existing participant', async () => {
    const { app } = makeApp()
    await postSize(app, { tripId: T, name: 'Alice', size: 'MEGA MAŁY', recipientName: 'Bob' })
    const res = await getSize(app, 'Alice', T)
    expect((await res.json() as any).size).toBe('MEGA MAŁY')
  })

  it('returns null for unknown participant', async () => {
    const { app } = makeApp()
    const res = await getSize(app, 'Nobody', T)
    expect((await res.json() as any).size).toBeNull()
  })

  it('returns 400 when tripId missing', async () => {
    const { app } = makeApp()
    const res = await getSize(app, 'Alice')
    expect(res.status).toBe(400)
  })
})
