import { describe, expect, it } from 'vitest';
import { emptyBoard, type Position } from '../src/board';
import { initialPosition } from '../src/fen';
import { historyToChinese, toChineseNotation } from '../src/chineseNotation';
import { Color, makePiece, PieceType, sq } from '../src/types';

describe('Chinese notation', () => {
  const start = initialPosition();

  it('names standard Red opening moves', () => {
    expect(toChineseNotation(start, { from: sq(7, 2), to: sq(4, 2) })).toBe('炮二平五');
    expect(toChineseNotation(start, { from: sq(1, 0), to: sq(2, 2) })).toBe('马八进七');
    expect(toChineseNotation(start, { from: sq(0, 0), to: sq(0, 1) })).toBe('车九进一');
    expect(toChineseNotation(start, { from: sq(6, 3), to: sq(6, 4) })).toBe('兵三进一');
  });

  it('uses Arabic numerals for Black', () => {
    expect(toChineseNotation(start, { from: sq(7, 7), to: sq(4, 7) })).toBe('炮8平5');
    expect(toChineseNotation(start, { from: sq(1, 9), to: sq(2, 7) })).toBe('马2进3');
  });

  it('disambiguates two pieces on the same file with 前/后', () => {
    const board = emptyBoard();
    board[sq(4, 0)] = makePiece(Color.Red, PieceType.Cannon);
    board[sq(4, 2)] = makePiece(Color.Red, PieceType.Cannon);
    const pos: Position = { board, turn: Color.Red };
    // The front cannon (more advanced, rank 2) slides; the rear one advances.
    expect(toChineseNotation(pos, { from: sq(4, 2), to: sq(3, 2) })).toBe('前炮平六');
    expect(toChineseNotation(pos, { from: sq(4, 0), to: sq(4, 1) })).toBe('后炮进一');
  });

  it('renders a short opening sequence', () => {
    const moves = [
      { from: sq(7, 2), to: sq(4, 2) }, // 炮二平五
      { from: sq(7, 9), to: sq(6, 7) }, // 马8进7 (black right horse)
    ];
    expect(historyToChinese(moves)).toEqual(['炮二平五', '马8进7']);
  });
});
