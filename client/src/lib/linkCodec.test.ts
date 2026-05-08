import { describe, it, expect } from 'vitest';
import { encode, decode, type Assignment } from './linkCodec';

const pair: Assignment = { giver: 'Alice', recipient: 'Bob' }

describe('linkCodec', () => {
  it('round-trips ascii names', () => {
    const pairs: Assignment[] = [
      { giver: 'Alice', recipient: 'Bob' },
      { giver: 'José', recipient: 'Ångström' },
      { giver: 'Zhang Wei', recipient: 'Müller' },
    ]
    pairs.forEach(p => expect(decode(encode(p))).toEqual(p))
  })

  it('encoded output is URL-safe', () => {
    const encoded = encode({ giver: 'Hello World / test+value', recipient: 'Other / one' })
    expect(encoded).toMatch(/^[A-Za-z0-9\-_]+$/)
  })

  it('decode returns null for empty string', () => {
    expect(decode('')).toBeNull()
  })

  it('decode returns null for random garbage', () => {
    expect(decode('!!!notbase64!!!')).toBeNull()
  })

  it('decode returns null for malformed base64', () => {
    expect(decode('YWJj!!!!')).toBeNull()
  })

  it('decode returns null when fields missing', () => {
    const broken = btoa(encodeURIComponent(JSON.stringify({ g: 'Alice' })))
    expect(decode(broken)).toBeNull()
  })

  it('encode produces stable URL-safe output', () => {
    expect(encode(pair)).toMatch(/^[A-Za-z0-9\-_]+$/)
  })
})
