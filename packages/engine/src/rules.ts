/**
 * Legality: check detection, the flying-general rule, legal move generation,
 * and checkmate / stalemate.
 */

import { type Board, makeMove, type Position, unmakeMove } from './board';
import { generatePseudoLegalMoves } from './moves';
import {
  Color,
  EMPTY,
  fileOf,
  makePiece,
  type Move,
  onBoard,
  opponent,
  PieceType,
  pieceColor,
  pieceType,
  rankOf,
  sq,
} from './types';

const ORTHOGONAL: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

// For each way a horse could attack a square: [df, dr, legDf, legDr]. The horse
// would sit at (target - df, target - dr); its leg is (horse + legDf, legDr).
const HORSE_ATTACK: ReadonlyArray<readonly [number, number, number, number]> = [
  [1, 2, 0, 1],
  [-1, 2, 0, 1],
  [1, -2, 0, -1],
  [-1, -2, 0, -1],
  [2, 1, 1, 0],
  [2, -1, 1, 0],
  [-2, 1, -1, 0],
  [-2, -1, -1, 0],
];

export function findGeneral(board: Board, color: Color): number {
  const target = makePiece(color, PieceType.General);
  for (let i = 0; i < board.length; i++) {
    if (board[i] === target) return i;
  }
  return -1;
}

/**
 * Is `color`'s general currently attacked? This also covers the flying-general
 * rule: two generals may not face each other on an open file.
 */
export function isInCheck(pos: Position, color: Color): boolean {
  return isGeneralAttacked(pos.board, color);
}

function isGeneralAttacked(board: Board, color: Color): boolean {
  const gi = findGeneral(board, color);
  if (gi < 0) return true; // general already captured — treat as lost
  const gf = fileOf(gi);
  const gr = rankOf(gi);
  const enemy = opponent(color);

  // Orthogonal scans cover chariots, cannons, and the flying general.
  for (const [df, dr] of ORTHOGONAL) {
    let nf = gf + df;
    let nr = gr + dr;
    let seenScreen = false;
    while (onBoard(nf, nr)) {
      const piece = board[sq(nf, nr)];
      if (piece !== EMPTY) {
        if (!seenScreen) {
          if (pieceColor(piece) === enemy) {
            const t = pieceType(piece);
            if (t === PieceType.Chariot) return true;
            // Flying general: only along a file (vertical).
            if (t === PieceType.General && df === 0) return true;
          }
          seenScreen = true;
        } else {
          if (pieceColor(piece) === enemy && pieceType(piece) === PieceType.Cannon) {
            return true;
          }
          break;
        }
      }
      nf += df;
      nr += dr;
    }
  }

  // Horse attacks (respecting the attacker's hobbling leg).
  for (const [df, dr, ldf, ldr] of HORSE_ATTACK) {
    const hf = gf - df;
    const hr = gr - dr;
    if (!onBoard(hf, hr)) continue;
    const piece = board[sq(hf, hr)];
    if (piece !== EMPTY && pieceColor(piece) === enemy && pieceType(piece) === PieceType.Horse) {
      if (board[sq(hf + ldf, hr + ldr)] === EMPTY) return true;
    }
  }

  // Soldier attacks. Enemy soldiers advance by `advance` ranks; one sitting
  // directly "behind" the general (relative to its advance) attacks forward,
  // and once across the river an adjacent one attacks sideways.
  const advance = enemy === Color.Red ? 1 : -1;
  {
    const bf = gf;
    const br = gr - advance;
    if (onBoard(bf, br)) {
      const piece = board[sq(bf, br)];
      if (
        piece !== EMPTY &&
        pieceColor(piece) === enemy &&
        pieceType(piece) === PieceType.Soldier
      ) {
        return true;
      }
    }
    for (const df of [-1, 1]) {
      const af = gf + df;
      if (!onBoard(af, gr)) continue;
      const piece = board[sq(af, gr)];
      if (
        piece !== EMPTY &&
        pieceColor(piece) === enemy &&
        pieceType(piece) === PieceType.Soldier
      ) {
        const crossed = enemy === Color.Red ? gr >= 5 : gr <= 4;
        if (crossed) return true;
      }
    }
  }

  return false;
}

export function generateLegalMoves(pos: Position): Move[] {
  const mover = pos.turn;
  const pseudo = generatePseudoLegalMoves(pos);
  const legal: Move[] = [];
  for (const move of pseudo) {
    const undo = makeMove(pos, move);
    if (!isGeneralAttacked(pos.board, mover)) legal.push(move);
    unmakeMove(pos, undo);
  }
  return legal;
}

export function isCheckmate(pos: Position): boolean {
  return isInCheck(pos, pos.turn) && generateLegalMoves(pos).length === 0;
}

/**
 * Stalemate (困毙): the side to move has no legal move but is not in check. In
 * Xiangqi — unlike international chess — this is a loss for the side to move,
 * not a draw.
 */
export function isStalemate(pos: Position): boolean {
  return !isInCheck(pos, pos.turn) && generateLegalMoves(pos).length === 0;
}
