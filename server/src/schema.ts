import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const participants = sqliteTable('participants', {
  name: text('name').primaryKey(),
  size: text('size').notNull(),
  email: text('email'),
  submittedAt: text('submitted_at').notNull(),
})

export const pendingNotifications = sqliteTable('pending_notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  giverEmail: text('giver_email').notNull(),
  recipient: text('recipient').notNull(),
  createdAt: text('created_at').notNull(),
})
