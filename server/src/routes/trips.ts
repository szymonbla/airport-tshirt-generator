import { Hono } from 'hono'
import { trips } from '../schema.js'
import type { AppEnv } from '../types.js'

const app = new Hono<AppEnv>()

app.get('/trips', async (c) => {
  const db = c.get('db')
  const all = await db.select().from(trips).all()
  return c.json(all)
})

app.post('/trips', async (c) => {
  const db = c.get('db')
  const { name } = await c.req.json<{ name: string }>()
  if (!name?.trim()) return c.json({ error: 'name required' }, 400)
  const [trip] = await db.insert(trips).values({ name: name.trim(), createdAt: new Date().toISOString() }).returning()
  return c.json(trip, 201)
})

export { app as tripRoutes }
