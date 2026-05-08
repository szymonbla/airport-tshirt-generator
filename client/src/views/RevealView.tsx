import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { decode } from '../lib/linkCodec'
import { VALID_SIZES } from '../lib/types'
import { submitSize, subscribeNotification, fetchRecipientSize } from '../lib/api'

type State = 'gate' | 'submitted'

function storageKey(r: string) { return `reveal:${r}` }

export default function RevealView() {
  const [searchParams] = useSearchParams()
  const assignment = decode(searchParams.get('r') ?? '')

  const queryClient = useQueryClient()
  const r = searchParams.get('r') ?? ''
  const alreadySubmitted = !!assignment && !!localStorage.getItem(storageKey(r))

  const [state, setState] = useState<State>(alreadySubmitted ? 'submitted' : 'gate')
  const [selectedSize, setSelectedSize] = useState('')
  const [email, setEmail] = useState('')
  const [notified, setNotified] = useState(false)

  const { data: recipientResult } = useQuery({
    queryKey: ['recipientSize', assignment?.recipient],
    queryFn: async () => {
      const size = await fetchRecipientSize(assignment!.recipient)
      return size ? { known: true as const, size } : { known: false as const }
    },
    enabled: state === 'submitted' && !!assignment,
    retry: false,
  })

  const submitMutation = useMutation({
    mutationFn: () => submitSize(assignment!.giver, selectedSize, assignment!.recipient),
    onSuccess: (result) => {
      localStorage.setItem(storageKey(r), JSON.stringify({ size: selectedSize }))
      setState('submitted')
      if (result.known) return
    },
    onError: () => toast.error('Nie udało się zapisać rozmiaru. Spróbuj ponownie.'),
  })

  const notifyMutation = useMutation({
    mutationFn: () => subscribeNotification(assignment!.giver, email, assignment!.recipient),
    onSuccess: (result) => {
      if (result.alreadyKnown) {
        queryClient.setQueryData(['recipientSize', assignment?.recipient], { known: true, size: result.size })
      } else {
        setNotified(true)
      }
    },
    onError: () => toast.error('Nie udało się zapisać powiadomienia. Spróbuj ponownie.'),
  })

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

  const displayResult = submitMutation.data ?? recipientResult

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
            onClick={() => submitMutation.mutate()}
            disabled={!selectedSize || submitMutation.isPending}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-lg rounded-lg transition-colors"
          >
            {submitMutation.isPending ? 'Zapisuję…' : 'UJAWNIJ PRZYDZIAŁ'}
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

        {displayResult?.known ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Rozmiar tej osoby</p>
            <p className="text-3xl font-bold">{displayResult.size}</p>
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
                  onClick={() => notifyMutation.mutate()}
                  disabled={!email || notifyMutation.isPending}
                  className="w-full py-2 bg-black text-white font-medium rounded disabled:opacity-40 hover:bg-gray-800 transition-colors"
                >
                  {notifyMutation.isPending ? 'Zapisuję…' : 'Powiadom mnie'}
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
