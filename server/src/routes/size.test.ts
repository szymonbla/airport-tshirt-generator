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

async function getSize(app: Hono<AppEnv>, name: string) {
  return app.request(`/api/size/${encodeURIComponent(name)}`)
}

describe('POST /api/size', () => {
  it('returns known:true with size when recipient exists', async () => {
    const { app } = makeApp()
    await postSize(app, { name: 'Alice', size: 'S', recipientName: 'Bob' })
    const res = await postSize(app, { name: 'Bob', size: 'XL', recipientName: 'Alice' })
    expect(await res.json()).toEqual({ known: true, size: 'S' })
  })

  it('returns known:false when recipient not yet submitted', async () => {
    const { app } = makeApp()
    const res = await postSize(app, { name: 'Alice', size: 'L', recipientName: 'Bob' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ known: false })
  })

  it('returns 400 for invalid size', async () => {
    const { app } = makeApp()
    const res = await postSize(app, { name: 'Alice', size: 'XXXL', recipientName: 'Bob' })
    expect(res.status).toBe(400)
  })

  it('upserts on duplicate POST', async () => {
    const { app } = makeApp()
    await postSize(app, { name: 'Alice', size: 'S', recipientName: 'Bob' })
    await postSize(app, { name: 'Alice', size: 'M', recipientName: 'Bob' })
    const res = await getSize(app, 'Alice')
    expect((await res.json() as any).size).toBe('M')
  })

  it('cleans up pending_notifications after recipient submits', async () => {
    const { app } = makeApp()
    await postSize(app, { name: 'Alice', size: 'S', recipientName: 'Bob' })
    await postNotify(app, { name: 'Alice', email: 'alice@x.com', recipientName: 'Bob' })
    const res = await postSize(app, { name: 'Bob', size: 'XL', recipientName: 'Charlie' })
    expect(res.status).toBe(200)
  })
})

describe('POST /api/notify', () => {
  it('returns subscribed:true when recipient size unknown', async () => {
    const { app } = makeApp()
    await postSize(app, { name: 'Alice', size: 'S', recipientName: 'Bob' })
    const res = await postNotify(app, { name: 'Alice', email: 'alice@x.com', recipientName: 'Bob' })
    expect(await res.json()).toEqual({ subscribed: true })
  })

  it('returns alreadyKnown when recipient already submitted', async () => {
    const { app } = makeApp()
    await postSize(app, { name: 'Bob', size: 'XL', recipientName: 'Alice' })
    await postSize(app, { name: 'Alice', size: 'S', recipientName: 'Bob' })
    const res = await postNotify(app, { name: 'Alice', email: 'alice@x.com', recipientName: 'Bob' })
    expect(await res.json()).toEqual({ alreadyKnown: true, size: 'XL' })
  })

  it('returns 400 when fields missing', async () => {
    const { app } = makeApp()
    const res = await postNotify(app, { name: 'Alice', email: '', recipientName: 'Bob' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/size/:name', () => {
  it('returns size for existing participant', async () => {
    const { app } = makeApp()
    await postSize(app, { name: 'Alice', size: 'S', recipientName: 'Bob' })
    const res = await getSize(app, 'Alice')
    expect((await res.json() as any).size).toBe('S')
  })

  it('returns null for unknown participant', async () => {
    const { app } = makeApp()
    const res = await getSize(app, 'Nobody')
    expect((await res.json() as any).size).toBeNull()
  })
})
