import { Resend } from 'resend'

export function makeSendSizeNotification(apiKey: string | undefined) {
  return async (giverEmail: string, recipientName: string, size: string) => {
    if (!apiKey) return
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: giverEmail,
      subject: `[Koszulki] ${recipientName} podał swój rozmiar`,
      text: `${recipientName} ma rozmiar ${size}. Możesz teraz kupić koszulkę!`,
    })
  }
}
