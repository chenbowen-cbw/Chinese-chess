import { describe, expect, it } from 'vitest';
import { initialPosition, parseFen } from '@xiangqi/engine';
import { evaluate } from '../src/evaluate';

describe('evaluate', () => {
  it('is perfectly balanced in the symmetric initial position', () => {
    expect(evaluate(initialPosition())).toBe(0);
  });

  it('favours the side that is up a chariot', () => {
    // Red has K + R; Black has only K.
    const red = parseFen('4k4/9/9/9/9/9/9/9/9/R3K4 w');
    expect(evaluate(red)).toBeGreaterThan(800);

    // Same material, but from Black's perspective it is losing.
    const black = parseFen('4k4/9/9/9/9/9/9/9/9/R3K4 b');
    expect(evaluate(black)).toBeLessThan(-800);
  });
});
