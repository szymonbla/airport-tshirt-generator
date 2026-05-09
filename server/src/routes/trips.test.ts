import { describe, it, expect } from 'vitest'
import { derange } from './trips.js'

const NAMES = ['Martyna', 'Szymon', 'Ola', 'Mateusz', 'Malina', 'Wiktor', 'Wiktoria', 'Julia', 'Patryk']

describe('derange', () => {
  it('nikt nie losuje siebie (9 osob)', () => {
    const result = derange(NAMES)
    for (const { giver, recipient } of result) {
      expect(giver).not.toBe(recipient)
    }
  })

  it('kazda osoba jest giverem dokladnie raz', () => {
    const result = derange(NAMES)
    expect(result.map(a => a.giver).sort()).toEqual([...NAMES].sort())
  })

  it('kazda osoba jest recipientem dokladnie raz', () => {
    const result = derange(NAMES)
    expect(result.map(a => a.recipient).sort()).toEqual([...NAMES].sort())
  })

  it('minimalna liczba osob (n=2)', () => {
    const result = derange(['A', 'B'])
    expect(result).toEqual([{ giver: 'A', recipient: 'B' }, { giver: 'B', recipient: 'A' }])
  })

  it('pusta lista zwraca pustą tablice', () => {
    expect(derange([])).toEqual([])
  })

  it('nikt nie losuje siebie w 1000 losowaniach', () => {
    for (let i = 0; i < 1000; i++) {
      const result = derange(NAMES)
      for (const { giver, recipient } of result) {
        expect(giver).not.toBe(recipient)
      }
    }
  })
})
