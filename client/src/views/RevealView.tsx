import { useSearchParams } from 'react-router-dom'
import { decode } from '../lib/linkCodec'

export default function RevealView() {
  const [searchParams] = useSearchParams()
  const recipient = decode(searchParams.get('r') ?? '')

  if (!recipient) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🤔</p>
          <h1 className="text-xl font-semibold mb-2">Invalid link</h1>
          <p className="text-gray-500 text-sm">This link looks broken. Ask the organizer to resend your assignment link.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">You're buying a t-shirt for</p>
        <h1 className="text-4xl font-bold">{recipient}</h1>
      </div>
    </main>
  )
}
