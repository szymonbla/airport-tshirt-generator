import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { openDb } from './db.js'
import { makeSendSizeNotification } from './email.js'
import { sizeRoutes } from './routes/size.js'
import { tripRoutes } from './routes/trips.js'
import type { AppEnv } from './types.js'

const app = new Hono<AppEnv>()

app.use('*', cors({ origin: ['https://airport-tshirt-generator.pages.dev', 'http://localhost:5173'] }))

app.use('*', async (c, next) => {
  c.set('db', openDb(c.env.DB))
  c.set('sendEmail', makeSendSizeNotification(c.env.RESEND_API_KEY))
  await next()
})

app.get('/api/health', (c) => c.json({ ok: true }))
app.route('/api', sizeRoutes)
app.route('/api', tripRoutes)

export default app
