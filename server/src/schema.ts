import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

export const trips = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
})

export const participants = sqliteTable('participants', {
  tripId: integer('trip_id').notNull(),
  name: text('name').notNull(),
  size: text('size').notNull(),
  email: text('email'),
  submittedAt: text('submitted_at').notNull(),
}, (t) => [primaryKey({ columns: [t.tripId, t.name] })])

export const assignments = sqliteTable('assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').notNull(),
  giverName: text('giver_name').notNull(),
  recipientName: text('recipient_name').notNull(),
})

export const pendingNotifications = sqliteTable('pending_notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').notNull(),
  giverEmail: text('giver_email').notNull(),
  recipient: text('recipient').notNull(),
  createdAt: text('created_at').notNull(),
})
