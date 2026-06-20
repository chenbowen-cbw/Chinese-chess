/**
 * ICCS-style coordinate notation.
 *
 * Each point is written as a file letter (a-i) followed by a rank digit (0-9),
 * from Red's perspective. A move is the origin square followed by the
 * destination square, e.g. "h2e2" or "b0c2".
 */

import { fileOf, FILES, type Move, rankOf } from './types';

const FILE_LETTERS = 'abcdefghi';

export function squareToCoord(index: number): string {
  return FILE_LETTERS[fileOf(index)] + String(rankOf(index));
}

export function coordToSquare(coord: string): number {
  const file = FILE_LETTERS.indexOf(coord[0]);
  const rank = coord.charCodeAt(1) - '0'.charCodeAt(0);
  if (file < 0 || rank < 0 || rank > 9) {
    throw new Error(`Invalid coordinate: ${coord}`);
  }
  return rank * FILES + file;
}

export function moveToCoord(move: Move): string {
  return squareToCoord(move.from) + squareToCoord(move.to);
}

export function parseMoveCoord(text: string): Move {
  if (text.length < 4) throw new Error(`Invalid move coordinate: ${text}`);
  return {
    from: coordToSquare(text.slice(0, 2)),
    to: coordToSquare(text.slice(2, 4)),
  };
}
