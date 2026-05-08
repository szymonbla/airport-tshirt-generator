import { Hono } from 'hono'
import type { Database } from 'better-sqlite3'
import { sendSizeNotification } from '../email.js'

const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'] as const

export function sizeRoutes(db: Database) {
  const app = new Hono()

  app.post('/size', async (c) => {
    const body = await c.req.json<{ name: string; size: string; recipientName: string }>()
    const { name, size, recipientName } = body

    if (!VALID_SIZES.includes(size as typeof VALID_SIZES[number])) {
      return c.json({ error: 'invalid size' }, 400)
    }

    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO participants (name, size, submitted_at)
      VALUES (?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET size=excluded.size, submitted_at=excluded.submitted_at
    `).run(name, size, now)

    const recipientRow = db.prepare('SELECT size FROM participants WHERE name = ?').get(recipientName) as { size: string } | undefined
    const recipientSize = recipientRow?.size ?? null

    const pending = db.prepare('SELECT id, giver_email FROM pending_notifications WHERE recipient = ?').all(name) as { id: number; giver_email: string }[]

    if (pending.length > 0) {
      const ids = pending.map(r => r.id)
      for (const row of pending) {
        await sendSizeNotification(row.giver_email, name, size)
      }
      const placeholders = ids.map(() => '?').join(',')
      db.prepare(`DELETE FROM pending_notifications WHERE id IN (${placeholders})`).run(...ids)
    }

    return c.json({ recipientSize })
  })

  app.post('/notify', async (c) => {
    const body = await c.req.json<{ name: string; email: string; recipientName: string }>()
    const { name, email, recipientName } = body

    if (!name || !email || !recipientName) {
      return c.json({ error: 'missing fields' }, 400)
    }

    const recipientRow = db.prepare('SELECT size FROM participants WHERE name = ?').get(recipientName) as { size: string } | undefined
    if (recipientRow?.size) {
      return c.json({ recipientSize: recipientRow.size })
    }

    const now = new Date().toISOString()
    db.prepare('UPDATE participants SET email = ? WHERE name = ?').run(email, name)
    db.prepare(`INSERT INTO pending_notifications (giver_email, recipient, created_at) VALUES (?, ?, ?)`).run(email, recipientName, now)

    return c.json({ ok: true })
  })

  app.get('/size/:name', (c) => {
    const name = c.req.param('name')
    const row = db.prepare('SELECT size FROM participants WHERE name = ?').get(name) as { size: string } | undefined
    return c.json({ size: row?.size ?? null })
  })

  return app
}
