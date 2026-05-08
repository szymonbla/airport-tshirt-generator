import { Hono } from 'hono'
import { createSizeService, isValidSize } from '../sizeService.js'
import type { AppEnv } from '../types.js'

const app = new Hono<AppEnv>()

app.post('/size', async (c) => {
  const service = createSizeService(c.get('db'), c.get('sendEmail'))
  const { name, size, recipientName } = await c.req.json<{ name: string; size: string; recipientName: string }>()
  if (!isValidSize(size)) return c.json({ error: 'invalid size' }, 400)
  return c.json(await service.submitSize(name, size, recipientName))
})

app.post('/notify', async (c) => {
  const service = createSizeService(c.get('db'), c.get('sendEmail'))
  const { name, email, recipientName } = await c.req.json<{ name: string; email: string; recipientName: string }>()
  if (!name || !email || !recipientName) return c.json({ error: 'missing fields' }, 400)
  return c.json(await service.subscribeNotification(name, email, recipientName))
})

app.get('/size/:name', async (c) => {
  const service = createSizeService(c.get('db'), c.get('sendEmail'))
  return c.json({ size: await service.getSize(c.req.param('name')) })
})

export { app as sizeRoutes }
