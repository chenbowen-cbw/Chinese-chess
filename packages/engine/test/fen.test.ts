import { describe, expect, it } from 'vitest';
import { INITIAL_FEN, initialPosition, parseFen, toFen } from '../src/fen';
import { Color, PieceType, pieceColor, pieceType, sq } from '../src/types';

describe('FEN', () => {
  it('round-trips the initial position', () => {
    const pos = parseFen(INITIAL_FEN);
    expect(toFen(pos)).toBe(INITIAL_FEN);
  });

  it('places the generals on e0 (Red) and e9 (Black)', () => {
    const pos = initialPosition();
    const red = pos.board[sq(4, 0)];
    const black = pos.board[sq(4, 9)];
    expect(pieceType(red)).toBe(PieceType.General);
    expect(pieceColor(red)).toBe(Color.Red);
    expect(pieceType(black)).toBe(PieceType.General);
    expect(pieceColor(black)).toBe(Color.Black);
  });

  it('starts with Red to move', () => {
    expect(initialPosition().turn).toBe(Color.Red);
  });

  it('rejects malformed FEN', () => {
    expect(() => parseFen('garbage')).toThrow();
    expect(() => parseFen('rnbakabnr/9/9 w')).toThrow(); // too few ranks
  });
});
