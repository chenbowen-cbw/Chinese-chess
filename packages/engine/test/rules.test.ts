import { describe, expect, it } from 'vitest';
import { emptyBoard, type Position } from '../src/board';
import { generateLegalMoves, isCheckmate, isInCheck, isStalemate } from '../src/rules';
import { Game, GameResult, resultFromPosition } from '../src/game';
import { Color, makePiece, PieceType, sq } from '../src/types';

function place(spec: Array<[number, number, Color, PieceType]>): Position['board'] {
  const board = emptyBoard();
  for (const [file, rank, color, type] of spec) {
    board[sq(file, rank)] = makePiece(color, type);
  }
  return board;
}

describe('check detection', () => {
  it('detects a chariot check down an open file (not mate)', () => {
    const board = place([
      [4, 9, Color.Black, PieceType.General],
      [3, 0, Color.Red, PieceType.General],
      [4, 5, Color.Red, PieceType.Chariot],
    ]);
    const pos: Position = { board, turn: Color.Black };
    expect(isInCheck(pos, Color.Black)).toBe(true);
    expect(isCheckmate(pos)).toBe(false); // general can step to d10/f10
  });

  it('detects a cannon check through a screen', () => {
    const board = place([
      [4, 9, Color.Black, PieceType.General],
      [3, 0, Color.Red, PieceType.General],
      [4, 5, Color.Black, PieceType.Soldier], // screen (any piece works)
      [4, 2, Color.Red, PieceType.Cannon],
    ]);
    const pos: Position = { board, turn: Color.Black };
    expect(isInCheck(pos, Color.Black)).toBe(true);
  });

  it('a horse with a hobbled leg does not give check', () => {
    const checking = place([
      [4, 9, Color.Black, PieceType.General],
      [0, 0, Color.Red, PieceType.General],
      [3, 7, Color.Red, PieceType.Horse], // attacks e10 via (legDf,legDr)
    ]);
    expect(isInCheck({ board: checking, turn: Color.Black }, Color.Black)).toBe(true);

    const hobbled = checking.slice();
    hobbled[sq(3, 8)] = makePiece(Color.Black, PieceType.Soldier); // block the horse's leg
    expect(isInCheck({ board: hobbled, turn: Color.Black }, Color.Black)).toBe(false);
  });
});

describe('the flying-general rule', () => {
  it('forbids leaving the two generals facing on an open file', () => {
    const board = place([
      [4, 0, Color.Red, PieceType.General],
      [4, 9, Color.Black, PieceType.General],
    ]);
    const pos: Position = { board, turn: Color.Red };
    const tos = new Set(generateLegalMoves(pos).map((m) => m.to));
    expect(tos.has(sq(4, 1))).toBe(false); // staying on file e keeps them facing
    expect(tos.has(sq(3, 0))).toBe(true); // stepping off the file is legal
    expect(tos.has(sq(5, 0))).toBe(true);
  });
});

describe('terminal positions', () => {
  it('detects checkmate (double-chariot box)', () => {
    const board = place([
      [4, 9, Color.Black, PieceType.General],
      [3, 0, Color.Red, PieceType.General],
      [0, 9, Color.Red, PieceType.Chariot], // covers rank 10
      [0, 8, Color.Red, PieceType.Chariot], // covers rank 9
    ]);
    const pos: Position = { board, turn: Color.Black };
    expect(isInCheck(pos, Color.Black)).toBe(true);
    expect(generateLegalMoves(pos).length).toBe(0);
    expect(isCheckmate(pos)).toBe(true);
    expect(resultFromPosition(pos)).toBe(GameResult.RedWins);
  });

  it('detects stalemate (困毙) as a loss for the side to move', () => {
    const board = place([
      [4, 9, Color.Black, PieceType.General],
      [0, 0, Color.Red, PieceType.General],
      [3, 8, Color.Red, PieceType.Soldier], // covers d10 and e9
      [5, 8, Color.Red, PieceType.Soldier], // covers f10 and e9
    ]);
    const pos: Position = { board, turn: Color.Black };
    expect(isInCheck(pos, Color.Black)).toBe(false);
    expect(generateLegalMoves(pos).length).toBe(0);
    expect(isStalemate(pos)).toBe(true);
    expect(resultFromPosition(pos)).toBe(GameResult.RedWins);
  });
});

describe('Game wrapper', () => {
  it('applies and undoes moves, rejecting illegal ones', () => {
    const game = new Game();
    expect(game.turn()).toBe(Color.Red);
    expect(game.move({ from: sq(0, 0), to: sq(4, 4) })).toBe(false); // not a chariot move
    expect(game.move({ from: sq(1, 2), to: sq(4, 2) })).toBe(true); // cannon to centre
    expect(game.turn()).toBe(Color.Black);
    expect(game.history().length).toBe(1);
    expect(game.undo()).toBe(true);
    expect(game.turn()).toBe(Color.Red);
    expect(game.history().length).toBe(0);
  });
});
