import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) console.warn('RESEND_API_KEY not set — emails will not be sent')

const resend = apiKey ? new Resend(apiKey) : null

export async function sendSizeNotification(giverEmail: string, recipientName: string, size: string) {
  if (!resend) return
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: giverEmail,
    subject: `[Koszulki] ${recipientName} podał swój rozmiar`,
    text: `${recipientName} ma rozmiar ${size}. Możesz teraz kupić koszulkę!`,
  })
}
