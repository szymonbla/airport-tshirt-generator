import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { fetchTrip, runDraw } from '../lib/api'
import { buildAssignmentLink } from '../lib/linkCodec'
import type { TripDetail } from '../lib/types'
import { Wordmark } from '../components/icons'

const AVATAR_TONES = [
  { bg: 'var(--color-teal-200)', color: 'var(--color-teal-700)' },
  { bg: 'var(--color-peach-100)', color: 'var(--color-peach-700)' },
  { bg: 'var(--color-butter)', color: '#7a6000' },
  { bg: 'var(--color-olive-300)', color: 'var(--color-olive-600)' },
  { bg: 'var(--color-sand-200)', color: 'var(--color-ink)' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: 13,
        padding: '6px 14px',
        borderRadius: 10,
        border: '1.5px solid var(--color-ink)',
        background: copied ? 'var(--color-olive-300)' : 'var(--color-cream)',
        color: 'var(--color-ink)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
    >
      {copied ? '✓ Skopiowano!' : 'Kopiuj'}
    </button>
  )
}

type FormValues = { names: { value: string }[] }

export default function TripDetailView() {
  const { id } = useParams<{ id: string }>()
  const tripId = Number(id)

  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const lastInputRef = useRef<HTMLInputElement | null>(null)

  const { register, control, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { names: [{ value: '' }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'names' })
  const watchedNames = watch('names')
  const validNames = watchedNames.map(f => f.value.trim()).filter(Boolean)
  const canDraw = validNames.length >= 2

  const appendAndFocus = () => {
    append({ value: '' })
    requestAnimationFrame(() => lastInputRef.current?.focus())
  }

  useEffect(() => {
    fetchTrip(tripId)
      .then(data => {
        setTrip(data)
        if (data.participants.length > 0) {
          reset({ names: data.participants.map(p => ({ value: p })) })
        }
      })
      .finally(() => setLoading(false))
  }, [tripId])

  const onSubmit = async (data: FormValues) => {
    const names = data.names.map(f => f.value.trim()).filter(Boolean)
    if (names.length < 2 || drawing) return
    setDrawing(true)
    try {
      const drawn = await runDraw(tripId, names)
      setTrip(prev => prev ? { ...prev, assignments: drawn, participants: names } : prev)
    } catch {
      toast.error('Błąd podczas losowania')
    } finally {
      setDrawing(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)' }}>
        Ładowanie...
      </div>
    )
  }

  if (!trip) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)' }}>
        Nie znaleziono wyjazdu.
      </div>
    )
  }

  const hasAssignments = trip.assignments.length > 0
  const base = window.location.origin + window.location.pathname

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-sans)', color: 'var(--color-ink)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0', maxWidth: 600, margin: '0 auto' }}>
        <Wordmark />
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--color-teal-100)',
          color: 'var(--color-teal-700)',
          borderRadius: 999,
          padding: '6px 14px 6px 6px',
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--color-ink)', color: 'var(--color-cream)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12,
          }}>{hasAssignments ? 2 : 1}</span>
          {hasAssignments ? 'Wyślij linki' : 'Zbiórka załogi'}
        </span>
      </div>

      <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 16px 40px' }}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/admin" style={{ fontSize: 13, color: 'var(--color-ink-soft)', textDecoration: 'none' }}>
            ← Wyjazdy
          </Link>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 22,
          boxShadow: '0 1px 0 rgba(45,49,66,0.06), 0 8px 24px -12px rgba(45,49,66,0.18)',
          padding: '32px 28px',
        }}>
          {!hasAssignments ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: 'rgba(45,49,66,0.55)', marginBottom: 8,
                }}>Organizator</div>
                <h1 style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32,
                  lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0,
                }}>{trip.name}</h1>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {fields.map((field, i) => {
                    const isLast = i === fields.length - 1
                    const { ref: rhfRef, ...rest } = register(`names.${i}.value`)
                    return (
                      <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--color-cream-2)', color: 'var(--color-ink)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>{i + 1}</span>
                        <input
                          {...rest}
                          ref={el => {
                            rhfRef(el)
                            if (isLast) lastInputRef.current = el
                          }}
                          style={{
                            flex: 1, background: '#fff',
                            border: '1.5px solid var(--color-sand-500)',
                            borderRadius: 14, padding: '10px 14px',
                            fontFamily: 'var(--font-sans)', fontSize: 15,
                            color: 'var(--color-ink)', outline: 'none',
                          }}
                          placeholder={`Uczestnik ${i + 1}`}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-teal-500)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,216,220,0.50)' }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-sand-500)'; e.currentTarget.style.boxShadow = 'none' }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && watchedNames[i]?.value.trim()) {
                              e.preventDefault()
                              if (isLast) appendAndFocus()
                            }
                          }}
                        />
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            style={{
                              width: 32, height: 32, borderRadius: '50%',
                              border: '1.5px solid rgba(45,49,66,0.15)',
                              background: 'transparent', color: 'var(--color-ink-soft)',
                              cursor: 'pointer', fontSize: 16,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                          >×</button>
                        )}
                      </div>
                    )
                  })}

                  <button
                    type="button"
                    onClick={appendAndFocus}
                    style={{
                      background: 'transparent',
                      border: '1.5px dashed var(--color-sand-500)',
                      borderRadius: 14, padding: '10px 14px',
                      fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                      color: 'var(--color-ink-soft)', cursor: 'pointer', textAlign: 'left',
                    }}
                  >+ Dodaj uczestnika</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--color-butter)', borderRadius: 999,
                    padding: '6px 14px 6px 6px', fontSize: 13,
                    fontFamily: 'var(--font-sans)', fontWeight: 600,
                  }}>
                    <span style={{
                      background: 'var(--color-ink)', color: 'var(--color-cream)',
                      borderRadius: '50%', width: 22, height: 22,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                    }}>{validNames.length}</span>
                    uczestników gotowych
                  </span>
                  <button
                    type="submit"
                    disabled={!canDraw || drawing}
                    style={{
                      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16,
                      padding: '12px 24px', borderRadius: 999,
                      border: '1.5px solid var(--color-ink)',
                      background: canDraw ? 'var(--color-peach-300)' : 'var(--color-sand-200)',
                      color: 'var(--color-ink)',
                      cursor: canDraw && !drawing ? 'pointer' : 'not-allowed',
                      opacity: canDraw && !drawing ? 1 : 0.5,
                    }}
                  >{drawing ? 'Losuję...' : 'Losuj 🎲'}</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: 'rgba(45,49,66,0.55)', marginBottom: 8,
                }}>Wylosowane</div>
                <h2 style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 26,
                  lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0,
                }}>Linki z przydziałami</h2>
                <p style={{ marginTop: 8, color: 'var(--color-ink-soft)', fontSize: 14 }}>
                  Wyślij każdy link prywatnie do odpowiedniego uczestnika.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {trip.assignments.map(({ giverName, recipientName }, idx) => {
                  const link = buildAssignmentLink(base, giverName, recipientName, tripId)
                  const tone = AVATAR_TONES[idx % AVATAR_TONES.length]
                  return (
                    <div key={giverName} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'var(--color-cream)', borderRadius: 14, padding: '14px 16px',
                    }}>
                      <span style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: tone.bg, color: tone.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, flexShrink: 0,
                      }}>{giverName[0]}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{giverName}</div>
                        <div style={{
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          fontSize: 11, color: 'var(--color-ink-soft)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{link}</div>
                      </div>
                      <CopyButton text={link} />
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <div style={{
                  height: 14, backgroundRepeat: 'repeat-x', backgroundSize: '60px 14px',
                  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 14'><path d='M0 7 Q15 0 30 7 T60 7' fill='none' stroke='%232E7C82' stroke-width='2' stroke-linecap='round'/></svg>\")",
                  marginBottom: 12,
                }} />
                <p style={{ color: 'rgba(45,49,66,0.45)', fontSize: 13 }}>
                  Kliknięcie linku ujawni przydział po podaniu rozmiaru
                </p>
                <button
                  onClick={() => setTrip(prev => prev ? { ...prev, assignments: [] } : prev)}
                  style={{
                    marginTop: 8, fontSize: 12, color: 'var(--color-ink-soft)',
                    background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline',
                  }}
                >Losuj ponownie</button>
              </div>
            </>
          )}
        </div>

        {!hasAssignments && (
          <div style={{
            marginTop: 12, textAlign: 'center',
            fontFamily: 'var(--font-hand)', fontWeight: 700, fontSize: 18,
            color: 'var(--color-peach-700)', transform: 'rotate(-1.5deg)',
            display: 'block', fontStyle: 'italic',
          }}>
            ↑ minimum 2 osoby, żeby losowanie miało sens
          </div>
        )}
      </div>
    </div>
  )
}
