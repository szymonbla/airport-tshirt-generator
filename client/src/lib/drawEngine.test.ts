import { describe, it, expect } from 'vitest';
import { drawEngine } from './drawEngine';

describe('drawEngine', () => {
  it('no self-assignments', () => {
    for (let i = 0; i < 20; i++) {
      const result = drawEngine(['A', 'B', 'C', 'D']);
      result.forEach(({ giver, recipient }) => {
        expect(giver).not.toBe(recipient);
      });
    }
  });

  it('every participant appears once as giver and once as recipient', () => {
    const participants = ['Alice', 'Bob', 'Carol', 'Dave'];
    const result = drawEngine(participants);
    expect(result.map(a => a.giver).sort()).toEqual([...participants].sort());
    expect(result.map(a => a.recipient).sort()).toEqual([...participants].sort());
  });

  it('works for minimum input of 2', () => {
    const result = drawEngine(['X', 'Y']);
    expect(result).toHaveLength(2);
    expect(result[0].giver).not.toBe(result[0].recipient);
  });

  it('produces different orderings across runs', () => {
    const participants = ['A', 'B', 'C', 'D', 'E'];
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      seen.add(drawEngine(participants).map(a => a.recipient).join(','));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('throws for fewer than 2 participants', () => {
    expect(() => drawEngine(['solo'])).toThrow();
  });
});
