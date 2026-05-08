import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { decode } from '../lib/linkCodec'
import { VALID_SIZES } from '../lib/types'
import { submitSize, subscribeNotification, fetchRecipientSize } from '../lib/api'
import { SuitcaseIcon, TshirtIcon, EnvelopeIcon, Wordmark } from '../components/icons'

type State = 'gate' | 'submitted'

function storageKey(r: string) { return `reveal:${r}` }

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 40px' }}>
      <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div><Wordmark small /></div>
        {children}
      </div>
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 22,
      boxShadow: '0 1px 0 rgba(45,49,66,0.06), 0 8px 24px -12px rgba(45,49,66,0.18)',
      padding: '32px 28px',
      ...style,
    }}>
      {children}
    </div>
  )
}

function TagCard({ recipient, sizeContent }: { recipient: string; sizeContent: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-cream-2)',
      borderRadius: 22,
      padding: '28px 24px',
      position: 'relative',
      textAlign: 'center',
    }}>
      <span style={{
        position: 'absolute',
        top: 16,
        right: 16,
        fontFamily: 'var(--font-hand)',
        fontWeight: 700,
        fontSize: 16,
        color: 'var(--color-peach-700)',
        background: 'var(--color-cream)',
        border: '1.5px dashed var(--color-peach-500)',
        borderRadius: 10,
        padding: '3px 10px',
        transform: 'rotate(-4deg)',
        display: 'inline-block',
      }}>prezentowy</span>

      <TshirtIcon size={72} />

      <div style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'rgba(45,49,66,0.55)',
        marginTop: 16,
        marginBottom: 8,
      }}>Kupujesz koszulkę dla</div>

      <div style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 800,
        fontSize: 48,
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        color: 'var(--color-ink)',
        marginBottom: 16,
      }}>{recipient}</div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        background: '#fff',
        borderRadius: 14,
        padding: '10px 20px',
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'rgba(45,49,66,0.55)',
        }}>Rozmiar</span>
        {sizeContent}
      </div>
    </div>
  )
}

export default function RevealView() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const assignment = decode(searchParams.get('r') ?? '')

  const queryClient = useQueryClient()
  const r = searchParams.get('r') ?? ''
  const alreadySubmitted = !!assignment && !!localStorage.getItem(storageKey(r))

  const [state, setState] = useState<State>(alreadySubmitted ? 'submitted' : 'gate')
  const [selectedSize, setSelectedSize] = useState('')
  const [email, setEmail] = useState('')
  const [notified, setNotified] = useState(false)

  const { data: recipientResult } = useQuery({
    queryKey: ['recipientSize', assignment?.tripId, assignment?.recipient],
    queryFn: async () => {
      const size = await fetchRecipientSize(assignment!.tripId, assignment!.recipient)
      return size ? { known: true as const, size } : { known: false as const }
    },
    enabled: state === 'submitted' && !!assignment,
    retry: false,
  })

  const submitMutation = useMutation({
    mutationFn: () => submitSize(assignment!.tripId, assignment!.giver, selectedSize, assignment!.recipient),
    onSuccess: (result) => {
      localStorage.setItem(storageKey(r), JSON.stringify({ size: selectedSize }))
      setState('submitted')
      if (result.known) return
    },
    onError: () => toast.error('Nie udało się zapisać rozmiaru. Spróbuj ponownie.'),
  })

  const notifyMutation = useMutation({
    mutationFn: () => subscribeNotification(assignment!.tripId, assignment!.giver, email, assignment!.recipient),
    onSuccess: (result) => {
      if ('alreadyKnown' in result) {
        queryClient.setQueryData(['recipientSize', assignment?.recipient], { known: true, size: result.size })
      } else {
        setNotified(true)
      }
    },
    onError: () => toast.error('Nie udało się zapisać powiadomienia. Spróbuj ponownie.'),
  })

  if (!assignment) {
    return (
      <PageShell>
        <Card style={{ textAlign: 'center', padding: '48px 28px' }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 88,
            color: 'var(--color-peach-500)',
            lineHeight: 1,
            marginBottom: 24,
          }}>¯\_(ツ)_/¯</div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 26,
            margin: '0 0 12px',
            color: 'var(--color-ink)',
          }}>Ten link jest dziwny.</h2>
          <p style={{ color: 'var(--color-ink-soft)', fontSize: 15, lineHeight: 1.5, marginBottom: 28 }}>
            Wygląda na uszkodzony albo skrócony w połowie. Poproś organizatora o ponowne przesłanie.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 14,
              padding: '8px 20px',
              borderRadius: 999,
              border: '1.5px solid rgba(45,49,66,0.20)',
              background: 'transparent',
              color: 'var(--color-ink-soft)',
              cursor: 'pointer',
            }}
          >Wróć do strony głównej</button>
        </Card>
      </PageShell>
    )
  }

  const displayResult = submitMutation.data ?? recipientResult

  if (state === 'gate') {
    return (
      <PageShell>
        <Card style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'rgba(45,49,66,0.55)',
            marginBottom: 8,
          }}>Hej, {assignment.giver}!</div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 10px',
            color: 'var(--color-ink)',
          }}>Wpisz swój rozmiar</h1>

          <p style={{ color: 'var(--color-ink-soft)', fontSize: 15, lineHeight: 1.5, marginBottom: 24 }}>
            Twój prezentowy ujawni się dopiero po naciśnięciu walizki. Bez podglądania!
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {VALID_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: `1.5px solid ${selectedSize === s ? 'var(--color-ink)' : 'var(--color-sand-500)'}`,
                  background: selectedSize === s ? 'var(--color-ink)' : '#fff',
                  color: selectedSize === s ? 'var(--color-cream)' : 'var(--color-ink-soft)',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >{s}</button>
            ))}
          </div>

          <button
            onClick={() => submitMutation.mutate()}
            disabled={!selectedSize || submitMutation.isPending}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '18px 28px',
              borderRadius: 22,
              border: '1.5px solid var(--color-ink)',
              background: 'var(--color-peach-300)',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 20,
              cursor: selectedSize ? 'pointer' : 'not-allowed',
              opacity: selectedSize ? 1 : 0.5,
              boxShadow: '0 3px 0 var(--color-ink)',
              transition: 'box-shadow 0.12s, transform 0.12s',
              pointerEvents: !selectedSize || submitMutation.isPending ? 'none' : 'auto',
            }}
            onMouseDown={e => { if (selectedSize) { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 var(--color-ink)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(3px)' } }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 3px 0 var(--color-ink)'; (e.currentTarget as HTMLButtonElement).style.transform = '' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 3px 0 var(--color-ink)'; (e.currentTarget as HTMLButtonElement).style.transform = '' }}
          >
            <SuitcaseIcon size={36} wobble={!submitMutation.isPending} />
            {submitMutation.isPending ? 'Zapisuję…' : 'Rozpakuj walizkę'}
          </button>

          <div style={{
            marginTop: 12,
            fontFamily: 'var(--font-hand)',
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--color-peach-700)',
            fontStyle: 'italic',
            transform: 'rotate(-1.5deg)',
            display: 'block',
          }}>↑ zaznacz rozmiar, potem klik</div>
        </Card>
      </PageShell>
    )
  }

  const isKnown = displayResult?.known
  const knownSize = isKnown ? displayResult.size : null

  return (
    <PageShell>
      <Card>
        <TagCard
          recipient={assignment.recipient}
          sizeContent={
            isKnown ? (
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 22,
                color: 'var(--color-ink)',
              }}>{knownSize}</span>
            ) : (
              <span style={{
                fontFamily: 'var(--font-hand)',
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--color-peach-700)',
                fontStyle: 'italic',
              }}>jeszcze nie podany</span>
            )
          }
        />

        {isKnown ? (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ color: 'var(--color-ink-soft)', fontSize: 14, marginBottom: 16 }}>
              Znamy już rozmiar — czas na zakupy!
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 14,
                padding: '10px 20px',
                borderRadius: 999,
                border: '1.5px solid rgba(45,49,66,0.20)',
                background: 'transparent',
                color: 'var(--color-ink)',
                cursor: 'pointer',
              }}>Zapisz w kalendarzu</button>
              <button
                onClick={async () => { await navigator.clipboard.writeText(knownSize ?? '') }}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 14,
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: '1.5px solid var(--color-ink)',
                  background: 'var(--color-cream)',
                  color: 'var(--color-ink)',
                  cursor: 'pointer',
                }}
              >Skopiuj rozmiar</button>
            </div>
          </div>
        ) : notified ? (
          <div style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(181,201,154,0.30)',
            border: '1.5px solid var(--color-olive-300)',
            borderRadius: 14,
            padding: '14px 18px',
          }}>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-olive-600)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}>✓</span>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.5 }}>
              Wyślemy Ci email, gdy <strong>{assignment.recipient}</strong> poda swój rozmiar.
            </p>
          </div>
        ) : (
          <div style={{
            marginTop: 16,
            background: 'var(--color-cream-2)',
            borderRadius: 14,
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <EnvelopeIcon size={36} />
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 16,
                  color: 'var(--color-ink)',
                  marginBottom: 4,
                }}>Powiadom mnie, gdy {assignment.recipient} poda rozmiar</div>
                <div style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>Wyślemy jeden mail. Bez spamu, słowo.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  background: '#fff',
                  border: '1.5px solid var(--color-sand-500)',
                  borderRadius: 14,
                  padding: '10px 14px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  color: 'var(--color-ink)',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => notifyMutation.mutate()}
                disabled={!email || notifyMutation.isPending}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 14,
                  padding: '10px 16px',
                  borderRadius: 14,
                  border: '1.5px solid var(--color-peach-500)',
                  background: 'var(--color-peach-300)',
                  color: 'var(--color-ink)',
                  cursor: email ? 'pointer' : 'not-allowed',
                  opacity: email ? 1 : 0.5,
                  whiteSpace: 'nowrap',
                }}
              >{notifyMutation.isPending ? 'Zapisuję…' : 'Powiadom mnie'}</button>
            </div>
          </div>
        )}
      </Card>
    </PageShell>
  )
}
