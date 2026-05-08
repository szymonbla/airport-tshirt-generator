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
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-sans)', color: 'var(--color-ink)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px 0', maxWidth: 600, margin: '0 auto' }}>
        <Wordmark />
      </div>

      <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 16px 40px' }}>
        <div style={{
          background: '#fff',
          borderRadius: 22,
          boxShadow: '0 1px 0 rgba(45,49,66,0.06), 0 8px 24px -12px rgba(45,49,66,0.18)',
          padding: '32px 28px',
        }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(45,49,66,0.55)',
              marginBottom: 8,
            }}>Organizator</div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 32,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: 0,
            }}>Wyjazdy</h1>
          </div>

          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nazwa wyjazdu"
              style={{
                flex: 1,
                background: '#fff',
                border: '1.5px solid var(--color-sand-500)',
                borderRadius: 14,
                padding: '10px 14px',
                fontFamily: 'var(--font-sans)',
                fontSize: 15,
                color: 'var(--color-ink)',
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-teal-500)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,216,220,0.50)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-sand-500)'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <button
              type="submit"
              disabled={!name.trim() || creating}
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 15,
                padding: '10px 20px',
                borderRadius: 999,
                border: '1.5px solid var(--color-ink)',
                background: name.trim() ? 'var(--color-peach-300)' : 'var(--color-sand-200)',
                color: 'var(--color-ink)',
                cursor: name.trim() && !creating ? 'pointer' : 'not-allowed',
                opacity: name.trim() && !creating ? 1 : 0.5,
                whiteSpace: 'nowrap',
              }}
            >Nowy Wyjazd</button>
          </form>

          {loading ? (
            <div style={{ color: 'var(--color-ink-soft)', fontSize: 14 }}>Ładowanie...</div>
          ) : trips.length === 0 ? (
            <div style={{ color: 'var(--color-ink-soft)', fontSize: 14 }}>Brak wyjazdów. Stwórz pierwszy!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {trips.map(trip => (
                <Link
                  key={trip.id}
                  to={`/admin/trip/${trip.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--color-cream)',
                    borderRadius: 14,
                    padding: '14px 18px',
                    textDecoration: 'none',
                    color: 'var(--color-ink)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>{trip.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-ink-soft)' }}>→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
