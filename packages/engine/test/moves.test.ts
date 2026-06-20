import { describe, expect, it } from 'vitest';
import { emptyBoard, makeMove, type Position, unmakeMove } from '../src/board';
import { initialPosition, toFen } from '../src/fen';
import { generatePseudoLegalMoves } from '../src/moves';
import { generateLegalMoves } from '../src/rules';
import { Color, EMPTY, makePiece, type Move, PieceType, sq } from '../src/types';

function pseudoFrom(pos: Position, from: number): Move[] {
  return generatePseudoLegalMoves(pos).filter((m) => m.from === from);
}

describe('move generation — initial position counts', () => {
  const pos = initialPosition();

  it('a chariot in the corner has 2 moves', () => {
    expect(pseudoFrom(pos, sq(0, 0)).length).toBe(2);
  });

  it('a horse has 2 moves (inner squares blocked by elephant legs)', () => {
    expect(pseudoFrom(pos, sq(1, 0)).length).toBe(2);
  });

  it('a cannon has 12 moves (incl. capturing the back-rank horse over the enemy cannon)', () => {
    const moves = pseudoFrom(pos, sq(1, 2));
    expect(moves.length).toBe(12);
    expect(moves.some((m) => m.to === sq(1, 9))).toBe(true); // capture h-horse over screen
  });

  it('an unmoved soldier has exactly 1 move', () => {
    expect(pseudoFrom(pos, sq(0, 3)).length).toBe(1);
  });

  it('has 44 legal opening moves (perft depth 1)', () => {
    expect(generateLegalMoves(pos).length).toBe(44);
  });
});

describe('special movement rules', () => {
  it('horse leg (蹩马腿) removes the two moves it blocks', () => {
    const board = emptyBoard();
    board[sq(4, 4)] = makePiece(Color.Red, PieceType.Horse);
    const pos: Position = { board, turn: Color.Red };
    expect(pseudoFrom(pos, sq(4, 4)).length).toBe(8); // open centre

    board[sq(4, 5)] = makePiece(Color.Black, PieceType.Soldier); // block upward leg
    expect(pseudoFrom(pos, sq(4, 4)).length).toBe(6);
  });

  it('elephant cannot cross the river and is stopped by a blocked eye', () => {
    const board = emptyBoard();
    board[sq(2, 0)] = makePiece(Color.Red, PieceType.Elephant);
    const pos: Position = { board, turn: Color.Red };
    expect(pseudoFrom(pos, sq(2, 0)).length).toBe(2); // (0,2) and (4,2)

    board[sq(3, 1)] = makePiece(Color.Red, PieceType.Soldier); // block one eye
    expect(pseudoFrom(pos, sq(2, 0)).map((m) => m.to)).toEqual([sq(0, 2)]);
  });

  it('elephant near the river cannot step across it', () => {
    const board = emptyBoard();
    board[sq(2, 4)] = makePiece(Color.Red, PieceType.Elephant);
    const pos: Position = { board, turn: Color.Red };
    const tos = pseudoFrom(pos, sq(2, 4)).map((m) => m.to);
    expect(tos).toContain(sq(0, 2));
    expect(tos).toContain(sq(4, 2));
    expect(tos).not.toContain(sq(0, 6)); // would cross the river
    expect(tos).not.toContain(sq(4, 6));
  });

  it('cannon captures only across exactly one screen', () => {
    const board = emptyBoard();
    board[sq(4, 0)] = makePiece(Color.Red, PieceType.Cannon);
    board[sq(4, 3)] = makePiece(Color.Red, PieceType.Soldier); // screen
    board[sq(4, 6)] = makePiece(Color.Black, PieceType.Soldier); // target beyond
    const pos: Position = { board, turn: Color.Red };
    const tos = new Set(pseudoFrom(pos, sq(4, 0)).map((m) => m.to));
    expect(tos.has(sq(4, 6))).toBe(true); // jump the screen to capture
    expect(tos.has(sq(4, 3))).toBe(false); // cannot land on own screen

    board[sq(4, 3)] = EMPTY; // remove the screen
    expect(new Set(pseudoFrom(pos, sq(4, 0)).map((m) => m.to)).has(sq(4, 6))).toBe(false);
  });

  it('soldier moves sideways only after crossing the river', () => {
    const own = emptyBoard();
    own[sq(4, 3)] = makePiece(Color.Red, PieceType.Soldier);
    expect(pseudoFrom({ board: own, turn: Color.Red }, sq(4, 3)).length).toBe(1);

    const crossed = emptyBoard();
    crossed[sq(4, 5)] = makePiece(Color.Red, PieceType.Soldier);
    const tos = pseudoFrom({ board: crossed, turn: Color.Red }, sq(4, 5)).map((m) => m.to);
    expect(tos.sort()).toEqual([sq(3, 5), sq(4, 6), sq(5, 5)].sort());
  });
});

describe('make / unmake', () => {
  it('restores the exact position for every legal first move', () => {
    const pos = initialPosition();
    const before = toFen(pos);
    for (const move of generateLegalMoves(pos)) {
      const undo = makeMove(pos, move);
      unmakeMove(pos, undo);
      expect(toFen(pos)).toBe(before);
    }
  });
});
