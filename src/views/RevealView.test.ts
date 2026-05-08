import { describe, it, expect } from 'vitest'
import { encode, decode } from '../lib/linkCodec'

// Simulates what RevealView does: decode(searchParams.get('r') ?? '')
function resolveRecipient(r: string | null): string | null {
  return decode(r ?? '')
}

describe('RevealView link resolution', () => {
  it('decodes a valid assignment link param', () => {
    const names = ['Alice', 'Bob', 'José', 'Zhang Wei']
    names.forEach(name => {
      expect(resolveRecipient(encode(name))).toBe(name)
    })
  })

  it('returns null for missing param', () => {
    expect(resolveRecipient(null)).toBeNull()
  })

  it('returns null for empty param', () => {
    expect(resolveRecipient('')).toBeNull()
  })

  it('returns null for garbage param', () => {
    expect(resolveRecipient('not-valid-base64!!!')).toBeNull()
  })

  it('full round-trip: encode in OrganizerView, decode in RevealView', () => {
    const participants = ['Alice', 'Bob', 'Charlie']
    participants.forEach(name => {
      const encoded = encode(name)
      // encoded must be URL-safe so it survives query string transport
      expect(encoded).toMatch(/^[A-Za-z0-9\-_]+$/)
      expect(resolveRecipient(encoded)).toBe(name)
    })
  })
})
