import type { DrizzleDb } from './db.js'
import type { EmailSender } from './sizeService.js'

export type Bindings = {
  DB: D1Database
  BREVO_API_KEY: string
  BREVO_SENDER_EMAIL: string
}

export type Variables = {
  db: DrizzleDb
  sendEmail: EmailSender
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
