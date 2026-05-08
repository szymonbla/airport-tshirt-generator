import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { decode } from '../lib/linkCodec'
import { VALID_SIZES } from '../lib/types'
import { submitSize, subscribeNotification, fetchRecipientSize } from '../lib/api'
import type { RecipientSizeResult } from '../lib/types'

type State = 'gate' | 'submitted'

function storageKey(r: string) { return `reveal:${r}` }

export default function RevealView() {
  const [searchParams] = useSearchParams()
  const assignment = decode(searchParams.get('r') ?? '')

  const [state, setState] = useState<State>('gate')
  const [selectedSize, setSelectedSize] = useState('')
  const [recipientResult, setRecipientResult] = useState<RecipientSizeResult | null>(null)
  const [email, setEmail] = useState('')
  const [notified, setNotified] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const r = searchParams.get('r') ?? ''

  useEffect(() => {
    if (!assignment) return
    const stored = localStorage.getItem(storageKey(r))
    if (!stored) return
    const { size } = JSON.parse(stored)
    if (!size) return
    fetchRecipientSize(assignment.recipient)
      .then(s => {
        setRecipientResult(s ? { known: true, size: s } : { known: false })
        setState('submitted')
      })
      .catch(() => {
        setRecipientResult({ known: false })
        setState('submitted')
      })
  }, [])

  if (!assignment) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🤔</p>
          <h1 className="text-xl font-semibold mb-2">Invalid link</h1>
          <p className="text-gray-500 text-sm">Ten link wygląda na uszkodzony. Poproś organizatora o ponowne przesłanie.</p>
        </div>
      </main>
    )
  }

  async function handleSubmit() {
    if (!selectedSize || !assignment) return
    setSubmitting(true)
    try {
      const result = await submitSize(assignment.giver, selectedSize, assignment.recipient)
      localStorage.setItem(storageKey(r), JSON.stringify({ size: selectedSize }))
      setRecipientResult(result)
      setState('submitted')
    } catch {
      toast.error('Nie udało się zapisać rozmiaru. Spróbuj ponownie.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleNotify() {
    if (!email || !assignment) return
    setSubmitting(true)
    try {
      const result = await subscribeNotification(assignment.giver, email, assignment.recipient)
      if (result.alreadyKnown) {
        setRecipientResult({ known: true, size: result.size })
      } else {
        setNotified(true)
      }
    } catch {
      toast.error('Nie udało się zapisać powiadomienia. Spróbuj ponownie.')
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'gate') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center max-w-sm w-full space-y-6">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Hej, {assignment.giver}!</p>
            <h1 className="text-2xl font-bold">Podaj swój rozmiar koszulki</h1>
            <p className="text-gray-500 text-sm mt-1">Wymagane przed ujawnieniem przydziału</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {VALID_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-4 py-2 rounded border font-medium transition-colors ${
                  selectedSize === s
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedSize || submitting}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-lg rounded-lg transition-colors"
          >
            {submitting ? 'Zapisuję…' : 'UJAWNIJ PRZYDZIAŁ'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center max-w-sm w-full space-y-6">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Kupujesz koszulkę dla</p>
          <h1 className="text-4xl font-bold">{assignment.recipient}</h1>
        </div>

        {recipientResult?.known ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Rozmiar tej osoby</p>
            <p className="text-3xl font-bold">{recipientResult.size}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Rozmiar tej osoby</p>
              <p className="text-gray-400 italic">Jeszcze nie podany</p>
            </div>
            {!notified ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Powiadom mnie, gdy {assignment.recipient} poda swój rozmiar</p>
                <input
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
                <button
                  onClick={handleNotify}
                  disabled={!email || submitting}
                  className="w-full py-2 bg-black text-white font-medium rounded disabled:opacity-40 hover:bg-gray-800 transition-colors"
                >
                  {submitting ? 'Zapisuję…' : 'Powiadom mnie'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-green-600">Wyślemy Ci email, gdy {assignment.recipient} poda swój rozmiar.</p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
