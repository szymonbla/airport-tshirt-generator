import type { DrizzleDb } from './db.js'
import type { EmailSender } from './sizeService.js'

export type Bindings = {
  DB: D1Database
  RESEND_API_KEY: string
}

export type Variables = {
  db: DrizzleDb
  sendEmail: EmailSender
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
