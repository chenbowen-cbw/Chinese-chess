import { describe, expect, it } from 'vitest';
import { initialPosition } from '../src/fen';
import { perft } from '../src/perft';

// Published reference perft values for the Xiangqi initial position. Matching
// these is a strong guarantee that move generation and legality are correct.
describe('perft — initial position', () => {
  it('depth 1 = 44', () => {
    expect(perft(initialPosition(), 1)).toBe(44);
  });

  it('depth 2 = 1920', () => {
    expect(perft(initialPosition(), 2)).toBe(1920);
  });

  it('depth 3 = 79666', () => {
    expect(perft(initialPosition(), 3)).toBe(79666);
  });

  it('depth 4 = 3290240', { timeout: 60_000 }, () => {
    expect(perft(initialPosition(), 4)).toBe(3290240);
  });
});
