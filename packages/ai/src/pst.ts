import { PieceType } from '@xiangqi/engine';

/**
 * Piece-square tables, from Red's perspective. Rows are listed visually from
 * rank 9 (top, Black's side) down to rank 0 (bottom, Red's side); the helper
 * re-indexes them to `rank * 9 + file`. Black piece values are looked up via
 * {@link mirror}. Magnitudes are deliberately small so material dominates.
 */

function table(rows: number[][]): Int16Array {
  const t = new Int16Array(90);
  for (let row = 0; row < 10; row++) {
    const rank = 9 - row;
    for (let file = 0; file < 9; file++) {
      t[rank * 9 + file] = rows[row][file];
    }
  }
  return t;
}

/** Reflect a board index across the river (same file, opposite rank). */
export function mirror(index: number): number {
  const rank = (index / 9) | 0;
  const file = index % 9;
  return (9 - rank) * 9 + file;
}

// prettier-ignore
const SOLDIER = table([
  [  0,  3,  6,  9, 12,  9,  6,  3,  0],
  [ 18, 36, 56, 80, 90, 80, 56, 36, 18],
  [ 14, 26, 42, 60, 80, 60, 42, 26, 14],
  [ 10, 20, 30, 34, 40, 34, 30, 20, 10],
  [  6, 12, 18, 18, 20, 18, 18, 12,  6],
  [  2,  0,  8,  0, 10,  0,  8,  0,  2],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
  [  0,  0,  0,  0,  0,  0,  0,  0,  0],
]);

// prettier-ignore
const HORSE = table([
  [  0,  2,  4,  6,  6,  6,  4,  2,  0],
  [  2,  6, 10, 12, 12, 12, 10,  6,  2],
  [  4, 10, 14, 16, 16, 16, 14, 10,  4],
  [  6, 12, 16, 18, 18, 18, 16, 12,  6],
  [  4, 10, 14, 16, 16, 16, 14, 10,  4],
  [  2,  8, 12, 14, 14, 14, 12,  8,  2],
  [  0,  6, 10, 12, 12, 12, 10,  6,  0],
  [ -2,  2,  6,  8,  8,  8,  6,  2, -2],
  [ -4,  0,  2,  4,  4,  4,  2,  0, -4],
  [ -6, -2,  0,  2,  2,  2,  0, -2, -6],
]);

// prettier-ignore
const CANNON = table([
  [  0,  0,  2,  4,  6,  4,  2,  0,  0],
  [  0,  2,  4,  6,  8,  6,  4,  2,  0],
  [  2,  4,  6,  8, 10,  8,  6,  4,  2],
  [  2,  4,  6,  8, 10,  8,  6,  4,  2],
  [  2,  4,  6,  8, 10,  8,  6,  4,  2],
  [  2,  4,  6,  8, 10,  8,  6,  4,  2],
  [  0,  2,  6,  6,  8,  6,  6,  2,  0],
  [  0,  0,  4,  4,  6,  4,  4,  0,  0],
  [  0,  0,  2,  2,  4,  2,  2,  0,  0],
  [  0,  0,  0,  2,  2,  2,  0,  0,  0],
]);

// prettier-ignore
const CHARIOT = table([
  [ 12, 14, 14, 16, 16, 16, 14, 14, 12],
  [ 14, 16, 16, 18, 20, 18, 16, 16, 14],
  [ 12, 14, 14, 16, 18, 16, 14, 14, 12],
  [ 12, 14, 14, 16, 16, 16, 14, 14, 12],
  [ 12, 14, 14, 16, 16, 16, 14, 14, 12],
  [ 12, 14, 14, 16, 16, 16, 14, 14, 12],
  [ 10, 12, 12, 14, 16, 14, 12, 12, 10],
  [ 10, 12, 12, 14, 14, 14, 12, 12, 10],
  [  8, 10, 12, 16, 16, 16, 12, 10,  8],
  [ -2, 10, 10, 14, 14, 14, 10, 10, -2],
]);

// prettier-ignore
const ADVISOR = table([
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0,  0,  0,  0, 0, 0, 0],
  [0, 0, 0, 10,  0, 10, 0, 0, 0],
  [0, 0, 0,  0, 15,  0, 0, 0, 0],
  [0, 0, 0, 10,  0, 10, 0, 0, 0],
]);

// prettier-ignore
const ELEPHANT = table([
  [0, 0, 0, 0,  0, 0, 0, 0, 0],
  [0, 0, 0, 0,  0, 0, 0, 0, 0],
  [0, 0, 0, 0,  0, 0, 0, 0, 0],
  [0, 0, 0, 0,  0, 0, 0, 0, 0],
  [0, 0, 0, 0,  0, 0, 0, 0, 0],
  [0, 0, 8, 0,  0, 0, 8, 0, 0],
  [0, 0, 0, 0,  0, 0, 0, 0, 0],
  [8, 0, 0, 0, 12, 0, 0, 0, 8],
  [0, 0, 0, 0,  0, 0, 0, 0, 0],
  [0, 0, 8, 0,  0, 0, 8, 0, 0],
]);

const GENERAL = new Int16Array(90); // safety handled by search, not position

export const PST: Record<PieceType, Int16Array> = {
  [PieceType.None]: new Int16Array(90),
  [PieceType.General]: GENERAL,
  [PieceType.Advisor]: ADVISOR,
  [PieceType.Elephant]: ELEPHANT,
  [PieceType.Horse]: HORSE,
  [PieceType.Chariot]: CHARIOT,
  [PieceType.Cannon]: CANNON,
  [PieceType.Soldier]: SOLDIER,
};
