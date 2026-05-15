import { useState, useRef } from 'react'
import dzienDobry from '../assets/dzien-dobry.mp4'
import smiech from '../assets/smiech.mp4'
import zart1 from '../assets/zart-1.mp4'
import zart2 from '../assets/zart-2.mp4'
import pizza from '../assets/pizza.mp4'
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
    <div className="min-h-screen flex flex-col items-center px-4 pt-6 pb-10">
      <div className="w-full max-w-[540px] flex flex-col gap-6">
        <div><Wordmark small /></div>
        {children}
      </div>
    </div>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[22px] shadow-[0_1px_0_rgba(45,49,66,0.06),0_8px_24px_-12px_rgba(45,49,66,0.18)] py-6 sm:py-8 px-4 sm:px-7 ${className ?? ''}`}>
      {children}
    </div>
  )
}

function TagCard({ recipient, sizeContent }: { recipient: string; sizeContent: React.ReactNode }) {
  return (
    <div className="bg-cream-2 rounded-[22px] p-[28px_24px] relative text-center">
      <span className="absolute top-4 right-4 font-hand font-bold text-base text-peach-700 bg-cream border-[1.5px] border-dashed border-peach-500 rounded-[10px] px-2.5 py-[3px] -rotate-[4deg] inline-block">
        prezentowy
      </span>

      <TshirtIcon size={72} />

      <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-[rgba(45,49,66,0.55)] mt-4 mb-2">
        Kupujesz koszulkę dla
      </div>

      <div className="font-heading font-extrabold text-[48px] leading-[1.05] tracking-[-0.02em] text-ink mb-4">
        {recipient}
      </div>

      <div className="inline-flex items-center gap-3 bg-white rounded-[14px] px-5 py-2.5">
        <span className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-[rgba(45,49,66,0.55)]">
          Rozmiar
        </span>
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
  const dzienDobryRef = useRef<HTMLAudioElement>(null)
  const smiechRef = useRef<HTMLAudioElement>(null)
  const zart1Ref = useRef<HTMLAudioElement>(null)
  const zart2Ref = useRef<HTMLAudioElement>(null)
  const pizzaRef = useRef<HTMLAudioElement>(null)

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
        queryClient.setQueryData(['recipientSize', assignment?.tripId, assignment?.recipient], { known: true, size: result.size })
      } else {
        setNotified(true)
      }
    },
    onError: () => toast.error('Nie udało się zapisać powiadomienia. Spróbuj ponownie.'),
  })

  if (!assignment) {
    if (!searchParams.get('r')) {
      return (
        <PageShell>
          <Card className="text-center px-7 py-12">
            <TshirtIcon size={64} />
            <h2 className="font-heading font-bold text-[26px] m-0 mb-3 mt-6 text-ink">
              Szmatex
            </h2>
            <p className="text-ink-soft text-[15px] leading-[1.5]">
              Użyj linku otrzymanego od organizatora wyjazdu.
            </p>
          </Card>
        </PageShell>
      )
    }
    return (
      <PageShell>
        <Card className="text-center px-7 py-12">
          <div className="font-heading font-extrabold text-[56px] sm:text-[88px] text-peach-500 leading-none mb-6">
            ¯\_(ツ)_/¯
          </div>
          <h2 className="font-heading font-bold text-[26px] m-0 mb-3 text-ink">
            Ten link jest dziwny.
          </h2>
          <p className="text-ink-soft text-[15px] leading-[1.5] mb-7">
            Wygląda na uszkodzony albo skrócony w połowie. Poproś organizatora o ponowne przesłanie.
          </p>
          <button
            onClick={() => navigate('/')}
            className="font-sans font-semibold text-[14px] px-5 py-2 rounded-full border-[1.5px] border-[rgba(45,49,66,0.20)] bg-transparent text-ink-soft cursor-pointer"
          >Wróć do strony głównej</button>
        </Card>
      </PageShell>
    )
  }

  const displayResult = submitMutation.data ?? recipientResult

  if (state === 'gate') {
    return (
      <PageShell>
        <Card className="text-center">
          <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-[rgba(45,49,66,0.55)] mb-2">
            Hej, {assignment.giver}!
          </div>

          <h1 className="font-heading font-extrabold text-[32px] leading-[1.1] tracking-[-0.02em] m-0 mb-2.5 text-ink">
            Wpisz swój rozmiar 🍆
          </h1>

          <p className="text-ink-soft text-[15px] leading-[1.5] mb-6">
            Twój prezentowy ujawni się dopiero po naciśnięciu walizki. Bez podglądania!
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {VALID_SIZES.map(s => (
              <button
                key={s}
                onClick={() => {
                  setSelectedSize(s)
                  const allRefs = [dzienDobryRef, smiechRef, zart1Ref, zart2Ref, pizzaRef]
                  allRefs.forEach(r => { const a = r.current; if (a) { a.pause(); a.currentTime = 0 } })
                  const play = (ref: React.RefObject<HTMLAudioElement | null>) => {
                    const a = ref.current; if (a) { a.currentTime = 0; a.play() }
                  }
                  play(dzienDobryRef)
                  if (s === 'GRUBY') play(pizzaRef)
                  else if (s === '2X GRUBY' || s === '3X GRUBY') play(pizzaRef)
                  else if (s === 'DUŻY EUROPEJSKI') play(zart2Ref)
                  else if (s === 'ŚREDNIA AZJATYCKA') play(zart1Ref)
                  else if (s === 'MEGA MAŁY' || s === 'MAŁY, ALE ŚMIERDZI JAK DUŻY') play(smiechRef)
                }}
                className={`px-4 py-2 rounded-full border-[1.5px] font-sans font-semibold text-[15px] cursor-pointer transition-all duration-[120ms] ${selectedSize === s ? 'border-ink bg-ink text-cream' : 'border-sand-500 bg-white text-ink-soft'}`}
              >{s}</button>
            ))}
            <audio ref={dzienDobryRef} src={dzienDobry} />
            <audio ref={smiechRef} src={smiech} />
            <audio ref={zart1Ref} src={zart1} />
            <audio ref={zart2Ref} src={zart2} />
            <audio ref={pizzaRef} src={pizza} />
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-7 text-[12px] font-sans text-ink-soft">
            {([
              ['MEGA MAŁY', 'XS'],
              ['MAŁY, ALE ŚMIERDZI JAK DUŻY', 'S'],
              ['ŚREDNIA AZJATYCKA', 'M'],
              ['DUŻY EUROPEJSKI', 'L'],
              ['GRUBY', 'XL'],
              ['2X GRUBY', '2XL'],
              ['3X GRUBY', '3XL'],
            ] as const).map(([label, code]) => (
              <span key={code} className={`transition-all duration-[120ms] ${selectedSize === label ? 'text-ink font-semibold' : ''}`}>
                {code} = {label}
              </span>
            ))}
          </div>

          <button
            onClick={() => submitMutation.mutate()}
            disabled={!selectedSize || submitMutation.isPending}
            className={`w-full flex items-center justify-center gap-3 py-[18px] px-7 rounded-[22px] border-[1.5px] border-ink bg-peach-300 text-ink font-heading font-extrabold text-[20px] transition-[box-shadow,transform] duration-[120ms] shadow-[0_3px_0_var(--color-ink)] active:shadow-none active:translate-y-[3px] ${selectedSize ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50 pointer-events-none'}`}
          >
            <SuitcaseIcon size={36} wobble={!submitMutation.isPending} />
            {submitMutation.isPending ? 'Zapisuję…' : 'Rozpakuj walizkę'}
          </button>

          <div className="mt-3 font-hand font-bold text-[17px] text-peach-700 italic -rotate-[1.5deg] block">
            ↑ zaznacz rozmiar, potem klik
          </div>
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
              <span className="font-heading font-bold text-[22px] text-ink">{knownSize}</span>
            ) : (
              <span className="font-hand font-bold text-[20px] text-peach-700 italic">jeszcze nie podany</span>
            )
          }
        />

        {isKnown ? (
          <div className="mt-5 text-center">
            <p className="text-ink-soft text-sm m-0">
              Znamy już rozmiar — czas na zakupy!
            </p>
          </div>
        ) : notified ? (
          <div className="mt-4 flex items-center gap-3 bg-[rgba(181,201,154,0.30)] border-[1.5px] border-olive-300 rounded-[14px] px-[18px] py-3.5">
            <span className="w-7 h-7 rounded-full bg-olive-600 text-white flex items-center justify-center text-[14px] font-bold shrink-0">✓</span>
            <p className="m-0 text-sm text-ink leading-[1.5]">
              Wyślemy Ci email, gdy <strong>{assignment.recipient}</strong> poda swój rozmiar.
            </p>
          </div>
        ) : (
          <div className="mt-4 bg-cream-2 rounded-[14px] p-5">
            <div className="flex items-start gap-3.5 mb-4">
              <EnvelopeIcon size={36} />
              <div>
                <div className="font-heading font-bold text-base text-ink mb-1">
                  Powiadom mnie, gdy {assignment.recipient} poda rozmiar
                </div>
                <div className="text-[13px] text-ink-soft">Wyślemy jeden mail. Bez spamu, słowo.</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 bg-white border-[1.5px] border-sand-500 rounded-[14px] px-3.5 py-2.5 font-sans text-[14px] text-ink outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-300/50"
              />
              <button
                onClick={() => notifyMutation.mutate()}
                disabled={!email || notifyMutation.isPending}
                className={`w-full sm:w-auto font-sans font-semibold text-[14px] px-4 py-2.5 rounded-[14px] border-[1.5px] border-peach-500 bg-peach-300 text-ink whitespace-nowrap transition-opacity ${email ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'}`}
              >{notifyMutation.isPending ? 'Zapisuję…' : 'Powiadom mnie'}</button>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] font-sans text-ink-soft">
          {([
            ['MEGA MAŁY', 'XS'],
            ['MAŁY, ALE ŚMIERDZI JAK DUŻY', 'S'],
            ['ŚREDNIA AZJATYCKA', 'M'],
            ['DUŻY EUROPEJSKI', 'L'],
            ['GRUBY', 'XL'],
            ['2X GRUBY', '2XL'],
            ['3X GRUBY', '3XL'],
          ] as const).map(([label, code]) => (
            <span key={code} className={knownSize === label ? 'text-ink font-semibold' : ''}>
              {code} = {label}
            </span>
          ))}
        </div>
      </Card>
    </PageShell>
  )
}
