import { describe, it, expect } from 'vitest'
import { encode, decode, type Assignment } from '../lib/linkCodec'

function resolveAssignment(r: string | null): Assignment | null {
  return decode(r ?? '')
}

describe('RevealView link resolution', () => {
  it('decodes a valid assignment link param', () => {
    const pairs: Assignment[] = [
      { giver: 'Alice', recipient: 'Bob' },
      { giver: 'José', recipient: 'Zhang Wei' },
    ]
    pairs.forEach(p => {
      expect(resolveAssignment(encode(p))).toEqual(p)
    })
  })

  it('returns null for missing param', () => {
    expect(resolveAssignment(null)).toBeNull()
  })

  it('returns null for empty param', () => {
    expect(resolveAssignment('')).toBeNull()
  })

  it('returns null for garbage param', () => {
    expect(resolveAssignment('not-valid-base64!!!')).toBeNull()
  })

  it('full round-trip: encode in OrganizerView, decode in RevealView', () => {
    const assignment: Assignment = { giver: 'Charlie', recipient: 'Alice' }
    const encoded = encode(assignment)
    expect(encoded).toMatch(/^[A-Za-z0-9\-_]+$/)
    expect(resolveAssignment(encoded)).toEqual(assignment)
  })
})
