/**
 * Xiangqi FEN (Forsyth-Edwards Notation) parsing and serialization.
 *
 * Board ranks are listed from rank 9 (top, Black's back rank) down to rank 0
 * (bottom, Red's back rank), separated by '/'. Within a rank, digits denote
 * runs of empty points and letters denote pieces:
 *
 *   k/K general, a/A advisor, b/B elephant, n/N horse, r/R chariot,
 *   c/C cannon, p/P soldier  (lowercase = Black, uppercase = Red).
 *
 * The side to move is 'w' (Red, who moves first) or 'b' (Black). Remaining
 * fields are accepted but otherwise unused by the core engine.
 */

import { emptyBoard, type Position } from './board';
import {
  Color,
  EMPTY,
  FILES,
  makePiece,
  PieceType,
  pieceColor,
  pieceType,
  RANKS,
  sq,
} from './types';

const TYPE_TO_CHAR: Record<PieceType, string> = {
  [PieceType.None]: '',
  [PieceType.General]: 'k',
  [PieceType.Advisor]: 'a',
  [PieceType.Elephant]: 'b',
  [PieceType.Horse]: 'n',
  [PieceType.Chariot]: 'r',
  [PieceType.Cannon]: 'c',
  [PieceType.Soldier]: 'p',
};

const CHAR_TO_TYPE: Record<string, PieceType> = {
  k: PieceType.General,
  a: PieceType.Advisor,
  b: PieceType.Elephant,
  n: PieceType.Horse,
  r: PieceType.Chariot,
  c: PieceType.Cannon,
  p: PieceType.Soldier,
};

export const INITIAL_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';

export function parseFen(fen: string): Position {
  const parts = fen.trim().split(/\s+/);
  if (parts.length === 0 || parts[0].length === 0) {
    throw new Error('Invalid FEN: empty');
  }
  const rows = parts[0].split('/');
  if (rows.length !== RANKS) {
    throw new Error(`Invalid FEN: expected ${RANKS} ranks, got ${rows.length}`);
  }

  const board = emptyBoard();
  for (let row = 0; row < RANKS; row++) {
    // rows[0] is the top of the board (rank 9); rows[RANKS-1] is rank 0.
    const rank = RANKS - 1 - row;
    let file = 0;
    for (const ch of rows[row]) {
      if (ch >= '1' && ch <= '9') {
        file += ch.charCodeAt(0) - '0'.charCodeAt(0);
      } else {
        const lower = ch.toLowerCase();
        const type = CHAR_TO_TYPE[lower];
        if (type === undefined) {
          throw new Error(`Invalid FEN: unknown piece '${ch}'`);
        }
        if (file >= FILES) {
          throw new Error(`Invalid FEN: too many cells in rank row ${row}`);
        }
        const color = ch === lower ? Color.Black : Color.Red;
        board[sq(file, rank)] = makePiece(color, type);
        file += 1;
      }
    }
    if (file !== FILES) {
      throw new Error(`Invalid FEN: rank row ${row} describes ${file} files`);
    }
  }

  const turnField = parts[1] ?? 'w';
  const turn = turnField === 'b' ? Color.Black : Color.Red;
  return { board, turn };
}

export function toFen(pos: Position): string {
  const rows: string[] = [];
  for (let rank = RANKS - 1; rank >= 0; rank--) {
    let row = '';
    let empty = 0;
    for (let file = 0; file < FILES; file++) {
      const piece = pos.board[sq(file, rank)];
      if (piece === EMPTY) {
        empty += 1;
        continue;
      }
      if (empty > 0) {
        row += String(empty);
        empty = 0;
      }
      const ch = TYPE_TO_CHAR[pieceType(piece)];
      row += pieceColor(piece) === Color.Red ? ch.toUpperCase() : ch;
    }
    if (empty > 0) row += String(empty);
    rows.push(row);
  }
  const turn = pos.turn === Color.Red ? 'w' : 'b';
  return `${rows.join('/')} ${turn} - - 0 1`;
}

export function initialPosition(): Position {
  return parseFen(INITIAL_FEN);
}
