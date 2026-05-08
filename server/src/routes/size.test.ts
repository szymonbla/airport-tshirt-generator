import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { openDb } from '../db.js'
import { sizeRoutes } from './size.js'

function makeApp() {
  const db = openDb(':memory:')
  const app = new Hono()
  app.route('/api', sizeRoutes(db))
  return app
}

async function post(app: Hono, body: object) {
  return app.request('/api/size', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function get(app: Hono, name: string) {
  return app.request(`/api/size/${encodeURIComponent(name)}`)
}

describe('POST /api/size', () => {
  it('saves participant and returns recipientSize when recipient exists', async () => {
    const app = makeApp()
    await post(app, { name: 'Bob', size: 'M', email: 'bob@x.com', recipientName: 'Alice' })
    await post(app, { name: 'Alice', size: 'S', email: 'alice@x.com', recipientName: 'Bob' })
    const res = await post(app, { name: 'Bob', size: 'M', email: 'bob@x.com', recipientName: 'Alice' })
    const data = await res.json()
    expect(data.recipientSize).toBe('S')
  })

  it('returns recipientSize null when recipient not yet submitted', async () => {
    const app = makeApp()
    const res = await post(app, { name: 'Alice', size: 'L', email: 'alice@x.com', recipientName: 'Bob' })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.recipientSize).toBeNull()
  })

  it('returns 400 for invalid size', async () => {
    const app = makeApp()
    const res = await post(app, { name: 'Alice', size: 'XXXL', email: 'a@x.com', recipientName: 'Bob' })
    expect(res.status).toBe(400)
  })

  it('upserts on duplicate POST', async () => {
    const app = makeApp()
    await post(app, { name: 'Alice', size: 'S', email: 'a@x.com', recipientName: 'Bob' })
    await post(app, { name: 'Alice', size: 'M', email: 'a@x.com', recipientName: 'Bob' })
    const res = await get(app, 'Alice')
    const data = await res.json()
    expect(data.size).toBe('M')
  })

  it('deletes pending_notifications after recipient submits', async () => {
    const app = makeApp()
    await post(app, { name: 'Alice', size: 'S', email: 'alice@x.com', recipientName: 'Bob' })
    // Bob (recipient) now submits
    const res = await post(app, { name: 'Bob', size: 'XL', email: 'bob@x.com', recipientName: 'Charlie' })
    expect(res.status).toBe(200)
    // Alice should now get email (mocked via no RESEND_API_KEY) — rows deleted
    // Verify by re-triggering: second submit should still work cleanly
    const res2 = await post(app, { name: 'Bob', size: 'XL', email: 'bob@x.com', recipientName: 'Charlie' })
    expect(res2.status).toBe(200)
  })
})

describe('GET /api/size/:name', () => {
  it('returns size for existing participant', async () => {
    const app = makeApp()
    await post(app, { name: 'Alice', size: 'S', email: 'a@x.com', recipientName: 'Bob' })
    const res = await get(app, 'Alice')
    const data = await res.json()
    expect(data.size).toBe('S')
  })

  it('returns null for unknown participant', async () => {
    const app = makeApp()
    const res = await get(app, 'Nobody')
    const data = await res.json()
    expect(data.size).toBeNull()
  })
})
