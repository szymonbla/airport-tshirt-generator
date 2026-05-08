import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { db } from './db.js'
import { sizeRoutes } from './routes/size.js'

const app = new Hono()

app.get('/api/health', (c) => c.json({ ok: true }))
app.route('/api', sizeRoutes(db))

const port = Number(process.env.PORT ?? 3001)
serve({ fetch: app.fetch, port }, () => console.log(`Server running on port ${port}`))
