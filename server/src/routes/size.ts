import { Hono } from 'hono'
import { sendSizeNotification } from '../email.js'
import { createSizeService, isValidSize } from '../sizeService.js'
import type { DrizzleDb } from '../db.js'

export function sizeRoutes(db: DrizzleDb) {
  const service = createSizeService(db, sendSizeNotification)
  const app = new Hono()

  app.post('/size', async (c) => {
    const { name, size, recipientName } = await c.req.json<{ name: string; size: string; recipientName: string }>()
    if (!isValidSize(size)) return c.json({ error: 'invalid size' }, 400)
    const result = await service.submitSize(name, size, recipientName)
    return c.json(result)
  })

  app.post('/notify', async (c) => {
    const { name, email, recipientName } = await c.req.json<{ name: string; email: string; recipientName: string }>()
    if (!name || !email || !recipientName) return c.json({ error: 'missing fields' }, 400)
    const result = await service.subscribeNotification(name, email, recipientName)
    return c.json(result)
  })

  app.get('/size/:name', (c) => {
    const size = service.getSize(c.req.param('name'))
    return c.json({ size })
  })

  return app
}
