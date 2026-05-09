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
      className={`font-heading font-bold text-[13px] px-3.5 py-1.5 rounded-[10px] border-[1.5px] border-ink text-ink cursor-pointer whitespace-nowrap transition-[background] duration-150 ${copied ? 'bg-olive-300' : 'bg-cream'}`}
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
    if (!Number.isFinite(tripId)) {
      setLoading(false)
      return
    }
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
      <div className="min-h-screen flex items-center justify-center font-sans">
        Ładowanie...
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        Nie znaleziono wyjazdu.
      </div>
    )
  }

  const hasAssignments = trip.assignments.length > 0
  const base = window.location.origin + '/'

  return (
    <div className="min-h-screen font-sans text-ink">
      <div className="flex items-center justify-between px-4 sm:px-6 pt-5 max-w-[600px] mx-auto">
        <Wordmark />
        <span className="flex items-center gap-2 bg-teal-100 text-teal-700 rounded-full py-1.5 pr-3.5 pl-1.5 font-sans font-bold text-[13px] tracking-[0.04em] uppercase">
          <span className="w-[22px] h-[22px] rounded-full bg-ink text-cream flex items-center justify-center font-heading font-bold text-[12px]">
            {hasAssignments ? 2 : 1}
          </span>
          {hasAssignments ? 'Wyślij linki' : 'Zbiórka załogi'}
        </span>
      </div>

      <div className="max-w-[600px] mx-auto mt-6 px-3 sm:px-4 pb-10">
        <div className="mb-4">
          <Link to="/backstage" className="text-[13px] text-ink-soft no-underline">
            ← Wyjazdy
          </Link>
        </div>

        <div className="bg-white rounded-[22px] shadow-[0_1px_0_rgba(45,49,66,0.06),0_8px_24px_-12px_rgba(45,49,66,0.18)] py-6 sm:py-8 px-4 sm:px-7">
          {!hasAssignments ? (
            <>
              <div className="mb-6">
                <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-[rgba(45,49,66,0.55)] mb-2">
                  Organizator
                </div>
                <h1 className="font-heading font-extrabold text-[32px] leading-[1.1] tracking-[-0.02em] m-0">
                  {trip.name}
                </h1>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2.5">
                  {fields.map((field, i) => {
                    const isLast = i === fields.length - 1
                    const { ref: rhfRef, ...rest } = register(`names.${i}.value`)
                    return (
                      <div key={field.id} className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-cream-2 text-ink flex items-center justify-center font-heading font-bold text-[14px] shrink-0">
                          {i + 1}
                        </span>
                        <input
                          {...rest}
                          ref={el => {
                            rhfRef(el)
                            if (isLast) lastInputRef.current = el
                          }}
                          className="flex-1 bg-white border-[1.5px] border-sand-500 rounded-[14px] px-3.5 py-2.5 font-sans text-[15px] text-ink outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-300/50"
                          placeholder={`Uczestnik ${i + 1}`}
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
                            className="w-8 h-8 rounded-full border-[1.5px] border-[rgba(45,49,66,0.15)] bg-transparent text-ink-soft cursor-pointer text-[16px] flex items-center justify-center shrink-0"
                          >×</button>
                        )}
                      </div>
                    )
                  })}

                  <button
                    type="button"
                    onClick={appendAndFocus}
                    className="bg-transparent border-[1.5px] border-dashed border-sand-500 rounded-[14px] px-3.5 py-2.5 font-sans font-semibold text-[14px] text-ink-soft cursor-pointer text-left"
                  >+ Dodaj uczestnika</button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-5 gap-3">
                  <span className="flex items-center gap-2 bg-butter rounded-full py-1.5 pr-3.5 pl-1.5 text-[13px] font-sans font-semibold self-start">
                    <span className="bg-ink text-cream rounded-full w-[22px] h-[22px] flex items-center justify-center text-[11px] font-bold">
                      {validNames.length}
                    </span>
                    uczestników gotowych
                  </span>
                  <button
                    type="submit"
                    disabled={!canDraw || drawing}
                    className={`w-full sm:w-auto font-heading font-bold text-base px-6 py-3 rounded-full border-[1.5px] border-ink text-ink transition-opacity ${canDraw ? 'bg-peach-300 cursor-pointer opacity-100' : 'bg-sand-200 cursor-not-allowed opacity-50'}`}
                  >{drawing ? 'Losuję...' : 'Losuj 🎲'}</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-[rgba(45,49,66,0.55)] mb-2">
                  Wylosowane
                </div>
                <h2 className="font-heading font-bold text-[26px] leading-[1.1] tracking-[-0.02em] m-0">
                  Linki z przydziałami
                </h2>
                <p className="mt-2 text-ink-soft text-sm">
                  Wyślij każdy link prywatnie do odpowiedniego uczestnika.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {trip.assignments.map(({ giverName, recipientName }, idx) => {
                  const link = buildAssignmentLink(base, giverName, recipientName, tripId)
                  const tone = AVATAR_TONES[idx % AVATAR_TONES.length]
                  return (
                    <div key={giverName} className="flex items-center gap-3 bg-cream rounded-[14px] px-4 py-3.5">
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-[18px] shrink-0"
                        style={{ background: tone.bg, color: tone.color }}
                      >{giverName[0]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-bold text-[15px]">{giverName}</div>
                        <div className="font-mono text-[11px] text-ink-soft overflow-hidden text-ellipsis whitespace-nowrap">{link}</div>
                      </div>
                      <CopyButton text={link} />
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 text-center">
                <div
                  className="h-[14px] mb-3 bg-repeat-x"
                  style={{
                    backgroundSize: '60px 14px',
                    backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 14'><path d='M0 7 Q15 0 30 7 T60 7' fill='none' stroke='%232E7C82' stroke-width='2' stroke-linecap='round'/></svg>\")",
                  }}
                />
                <p className="text-[rgba(45,49,66,0.45)] text-[13px]">
                  Kliknięcie linku ujawni przydział po podaniu rozmiaru
                </p>
                <button
                  onClick={() => setTrip(prev => prev ? { ...prev, assignments: [] } : prev)}
                  className="mt-2 text-[12px] text-ink-soft bg-none bg-transparent border-none cursor-pointer underline"
                >Losuj ponownie</button>
              </div>
            </>
          )}
        </div>

        {!hasAssignments && (
          <div className="mt-3 text-center font-hand font-bold text-[18px] text-peach-700 rotate-[-1.5deg] inline-block italic w-full">
            ↑ minimum 2 osoby, żeby losowanie miało sens
          </div>
        )}
      </div>
    </div>
  )
}
