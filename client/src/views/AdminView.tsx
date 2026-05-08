import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchTrips, createTrip } from '../lib/api'
import type { Trip } from '../lib/types'
import { Wordmark } from '../components/icons'

export default function AdminView() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchTrips().then(setTrips).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || creating) return
    setCreating(true)
    try {
      const trip = await createTrip(name.trim())
      setTrips(prev => [trip, ...prev])
      setName('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen font-sans text-ink">
      <div className="flex items-center px-6 pt-5 max-w-[600px] mx-auto">
        <Wordmark />
      </div>

      <div className="max-w-[600px] mx-auto mt-6 px-4 pb-10">
        <div className="bg-white rounded-[22px] shadow-[0_1px_0_rgba(45,49,66,0.06),0_8px_24px_-12px_rgba(45,49,66,0.18)] py-8 px-7">
          <div className="mb-7">
            <div className="font-sans font-bold text-[11px] tracking-[0.06em] uppercase text-[rgba(45,49,66,0.55)] mb-2">
              Organizator
            </div>
            <h1 className="font-heading font-extrabold text-[32px] leading-[1.1] tracking-[-0.02em] m-0">
              Wyjazdy
            </h1>
          </div>

          <form onSubmit={handleCreate} className="flex gap-2.5 mb-7">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nazwa wyjazdu"
              className="flex-1 bg-white border-[1.5px] border-sand-500 rounded-[14px] px-3.5 py-2.5 font-sans text-[15px] text-ink outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-300/50"
            />
            <button
              type="submit"
              disabled={!name.trim() || creating}
              className={`font-heading font-bold text-[15px] px-5 py-2.5 rounded-full border-[1.5px] border-ink text-ink whitespace-nowrap transition-opacity ${name.trim() ? 'bg-peach-300 cursor-pointer opacity-100' : 'bg-sand-200 cursor-not-allowed opacity-50'}`}
            >Nowy Wyjazd</button>
          </form>

          {loading ? (
            <div className="text-ink-soft text-sm">Ładowanie...</div>
          ) : trips.length === 0 ? (
            <div className="text-ink-soft text-sm">Brak wyjazdów. Stwórz pierwszy!</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {trips.map(trip => (
                <Link
                  key={trip.id}
                  to={`/admin/trip/${trip.id}`}
                  className="flex items-center justify-between bg-cream rounded-[14px] px-[18px] py-3.5 no-underline text-ink"
                >
                  <span className="font-heading font-bold text-base">{trip.name}</span>
                  <span className="text-[13px] text-ink-soft">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
