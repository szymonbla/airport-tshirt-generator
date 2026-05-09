import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { trips, participants, assignments } from '../schema.js'
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

app.get('/trips/:id', async (c) => {
  const db = c.get('db')
  const tripId = Number(c.req.param('id'))
  if (!Number.isFinite(tripId)) return c.json({ error: 'invalid id' }, 400)

  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId))
  if (!trip) return c.json({ error: 'not found' }, 404)

  const tripParticipants = await db.select().from(participants).where(eq(participants.tripId, tripId))
  const tripAssignments = await db.select().from(assignments).where(eq(assignments.tripId, tripId))

  return c.json({
    ...trip,
    participants: tripParticipants.map(p => p.name),
    assignments: tripAssignments.map(a => ({ giverName: a.giverName, recipientName: a.recipientName })),
  })
})

app.post('/trips/:id/draw', async (c) => {
  const db = c.get('db')
  const tripId = Number(c.req.param('id'))
  if (!Number.isFinite(tripId)) return c.json({ error: 'invalid id' }, 400)

  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId))
  if (!trip) return c.json({ error: 'not found' }, 404)

  const { participants: names } = await c.req.json<{ participants: string[] }>()
  if (!Array.isArray(names) || names.length < 2) return c.json({ error: 'need at least 2 participants' }, 400)

  const trimmed = names.map((n: string) => n.trim()).filter(Boolean)
  if (new Set(trimmed).size !== trimmed.length) return c.json({ error: 'duplicate names' }, 400)

  const drawn = derange(trimmed)

  await db.delete(assignments).where(eq(assignments.tripId, tripId))

  for (const p of trimmed) {
    await db
      .insert(participants)
      .values({ tripId, name: p, size: '', submittedAt: new Date().toISOString() })
      .onConflictDoNothing()
  }

  const inserted = await db
    .insert(assignments)
    .values(drawn.map(a => ({ tripId, giverName: a.giver, recipientName: a.recipient })))
    .returning()

  return c.json(inserted.map(a => ({ giverName: a.giverName, recipientName: a.recipientName })), 201)
})

export function derange(names: string[]): { giver: string; recipient: string }[] {
  const recipients = [...names]
  do {
    for (let i = recipients.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recipients[i], recipients[j]] = [recipients[j], recipients[i]]
    }
  } while (recipients.some((r, i) => r === names[i]))
  return names.map((giver, i) => ({ giver, recipient: recipients[i] }))
}

export { app as tripRoutes }
