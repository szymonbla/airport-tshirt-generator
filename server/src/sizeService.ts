import { eq } from 'drizzle-orm'
import { participants, pendingNotifications } from './schema.js'
import type { DrizzleDb } from './db.js'

const VALID_SIZES = ['MEGA MAŁY', 'MAŁY, ALE ŚMIERDZI JAK DUŻY', 'ŚREDNIA AZJATYCKA', 'DUŻY EUROPEJSKI', 'GRUBY', '2X GRUBY', '3X GRUBY'] as const

export type RecipientSizeResult = { known: true; size: string } | { known: false }
export type NotifyResult = { subscribed: true } | { alreadyKnown: true; size: string }
export type EmailSender = (to: string, recipientName: string, size: string) => Promise<void>

export function isValidSize(s: string): s is typeof VALID_SIZES[number] {
  return (VALID_SIZES as readonly string[]).includes(s)
}

export function createSizeService(db: DrizzleDb, sendEmail: EmailSender) {
  return {
    async submitSize(giver: string, size: string, recipientName: string): Promise<RecipientSizeResult> {
      const now = new Date().toISOString()
      await db.insert(participants)
        .values({ name: giver, size, submittedAt: now })
        .onConflictDoUpdate({ target: participants.name, set: { size, submittedAt: now } })
        .run()

      const recipientRow = await db.select({ size: participants.size })
        .from(participants)
        .where(eq(participants.name, recipientName))
        .get()

      const pending = await db.select({ id: pendingNotifications.id, giverEmail: pendingNotifications.giverEmail })
        .from(pendingNotifications)
        .where(eq(pendingNotifications.recipient, giver))
        .all()

      for (const row of pending) {
        await sendEmail(row.giverEmail, giver, size)
        await db.delete(pendingNotifications).where(eq(pendingNotifications.id, row.id)).run()
      }

      return recipientRow ? { known: true, size: recipientRow.size } : { known: false }
    },

    async subscribeNotification(giver: string, email: string, recipientName: string): Promise<NotifyResult> {
      const recipientRow = await db.select({ size: participants.size })
        .from(participants)
        .where(eq(participants.name, recipientName))
        .get()

      if (recipientRow?.size) {
        return { alreadyKnown: true, size: recipientRow.size }
      }

      const now = new Date().toISOString()
      await db.update(participants).set({ email }).where(eq(participants.name, giver)).run()
      await db.insert(pendingNotifications).values({ giverEmail: email, recipient: recipientName, createdAt: now }).run()

      return { subscribed: true }
    },

    async getSize(name: string): Promise<string | null> {
      const row = await db.select({ size: participants.size })
        .from(participants)
        .where(eq(participants.name, name))
        .get()
      return row?.size ?? null
    },
  }
}
