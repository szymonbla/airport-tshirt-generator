import { describe, it, expect } from 'vitest';
import { encode, decode, buildAssignmentLink, type Assignment } from './linkCodec';

const pair: Assignment = { giver: 'Alice', recipient: 'Bob', tripId: 1 }

describe('linkCodec', () => {
  it('round-trips ascii names', () => {
    const pairs: Assignment[] = [
      { giver: 'Alice', recipient: 'Bob', tripId: 1 },
      { giver: 'José', recipient: 'Ångström', tripId: 2 },
      { giver: 'Zhang Wei', recipient: 'Müller', tripId: 42 },
    ]
    pairs.forEach(p => expect(decode(encode(p))).toEqual(p))
  })

  it('encoded output is URL-safe', () => {
    const encoded = encode({ giver: 'Hello World / test+value', recipient: 'Other / one', tripId: 1 })
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

  it('decode returns null for old links without tripId', () => {
    const old = btoa(encodeURIComponent(JSON.stringify({ g: 'Alice', r: 'Bob' })))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    expect(decode(old)).toBeNull()
  })

  it('encode produces stable URL-safe output', () => {
    expect(encode(pair)).toMatch(/^[A-Za-z0-9\-_]+$/)
  })
})

describe('buildAssignmentLink', () => {
  it('builds a decodable link', () => {
    const link = buildAssignmentLink('https://example.com/', 'Alice', 'Bob', 1)
    const hash = new URL(link).hash // '#/reveal?r=...'
    const param = hash.replace('#/reveal?r=', '')
    expect(decode(param)).toEqual({ giver: 'Alice', recipient: 'Bob', tripId: 1 })
  })

  it('encoded param is URL-safe', () => {
    const link = buildAssignmentLink('https://example.com/', 'Alice', 'Bob', 1)
    const param = new URL(link).hash.replace('#/reveal?r=', '')
    expect(param).toMatch(/^[A-Za-z0-9\-_]+$/)
  })
})
