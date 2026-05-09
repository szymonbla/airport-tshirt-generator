export function makeSendSizeNotification(apiKey: string | undefined, senderEmail: string | undefined) {
  return async (giverEmail: string, recipientName: string, size: string) => {
    if (!apiKey || !senderEmail) return
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail },
        to: [{ email: giverEmail }],
        subject: `[Koszulki] ${recipientName} podał swój rozmiar`,
        textContent: `${recipientName} ma rozmiar ${size}. Możesz teraz kupić koszulkę!`,
      }),
    })
    if (!res.ok) {
      console.error('Brevo error', res.status, await res.text())
    }
  }
}
