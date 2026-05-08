import { Hono } from 'hono'
import { createSizeService, isValidSize } from '../sizeService.js'
import type { AppEnv } from '../types.js'

const app = new Hono<AppEnv>()

app.post('/size', async (c) => {
  const service = createSizeService(c.get('db'), c.get('sendEmail'))
  const { tripId, name, size, recipientName } = await c.req.json<{ tripId: unknown; name: string; size: string; recipientName: string }>()
  if (typeof tripId !== 'number') return c.json({ error: 'missing or invalid tripId' }, 400)
  if (!isValidSize(size)) return c.json({ error: 'invalid size' }, 400)
  return c.json(await service.submitSize(tripId, name, size, recipientName))
})

app.post('/notify', async (c) => {
  const service = createSizeService(c.get('db'), c.get('sendEmail'))
  const { tripId, name, email, recipientName } = await c.req.json<{ tripId: unknown; name: string; email: string; recipientName: string }>()
  if (typeof tripId !== 'number') return c.json({ error: 'missing or invalid tripId' }, 400)
  if (!name || !email || !recipientName) return c.json({ error: 'missing fields' }, 400)
  return c.json(await service.subscribeNotification(tripId, name, email, recipientName))
})

app.get('/size/:name', async (c) => {
  const service = createSizeService(c.get('db'), c.get('sendEmail'))
  const tripIdRaw = c.req.query('tripId')
  const tripId = tripIdRaw !== undefined ? Number(tripIdRaw) : NaN
  if (!Number.isInteger(tripId)) return c.json({ error: 'missing or invalid tripId' }, 400)
  return c.json({ size: await service.getSize(tripId, c.req.param('name')) })
})

export { app as sizeRoutes }
