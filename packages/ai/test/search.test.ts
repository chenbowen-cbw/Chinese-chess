import { describe, expect, it } from 'vitest';
import {
  Color,
  emptyBoard,
  generateLegalMoves,
  initialPosition,
  makeMove,
  makePiece,
  PieceType,
  type Position,
  sq,
} from '@xiangqi/engine';
import { MATE, search } from '../src/search';
import { chooseMove } from '../src/index';

describe('search', () => {
  it('returns a legal move from the initial position', () => {
    const pos = initialPosition();
    const { move } = search(pos, { maxDepth: 3, timeMs: 2000 });
    expect(move).not.toBeNull();
    const legal = generateLegalMoves(pos).some((m) => m.from === move!.from && m.to === move!.to);
    expect(legal).toBe(true);
  });

  it('wins free material — captures an undefended chariot through a screen', () => {
    const board = emptyBoard();
    board[sq(4, 0)] = makePiece(Color.Red, PieceType.Cannon);
    board[sq(4, 3)] = makePiece(Color.Red, PieceType.Soldier); // screen
    board[sq(4, 7)] = makePiece(Color.Black, PieceType.Chariot); // free target
    board[sq(0, 0)] = makePiece(Color.Red, PieceType.General);
    board[sq(8, 9)] = makePiece(Color.Black, PieceType.General);
    const pos: Position = { board, turn: Color.Red };

    const { move } = search(pos, { maxDepth: 4, timeMs: 2000 });
    expect(move).toMatchObject({ from: sq(4, 0), to: sq(4, 7) });
  });

  it('finds a forced mate in one (Black left with no legal reply)', () => {
    // Black general in the palace corner d10, with the only two escape squares
    // (e10 and d9) controllable. A red chariot can finish in one move; in
    // Xiangqi both checkmate and stalemate (困毙) are wins, so we assert that
    // Black is simply left with no legal move.
    const board = emptyBoard();
    board[sq(3, 9)] = makePiece(Color.Black, PieceType.General);
    board[sq(1, 0)] = makePiece(Color.Red, PieceType.General);
    board[sq(4, 0)] = makePiece(Color.Red, PieceType.Chariot); // covers e10 (4,9)
    board[sq(8, 5)] = makePiece(Color.Red, PieceType.Chariot); // swings to the d-file
    const pos: Position = { board, turn: Color.Red };

    const { move, score } = search(pos, { maxDepth: 3, timeMs: 2000 });
    expect(score).toBeGreaterThan(MATE - 1000);
    makeMove(pos, move!);
    expect(generateLegalMoves(pos).length).toBe(0); // Black is lost
  });

  it('chooseMove returns a legal move at medium difficulty', () => {
    const pos = initialPosition();
    const { move } = chooseMove(pos, { difficulty: 'medium' });
    expect(move).not.toBeNull();
  });
});
