/**
 * Pseudo-legal move generation.
 *
 * "Pseudo-legal" means moves obey each piece's movement rules (including the
 * hobbling-leg, blocked-eye and cannon-screen rules) but may still leave one's
 * own general in check or facing the enemy general. Legality filtering lives in
 * {@link ./rules}.
 */

import { type Board, crossedRiver, inPalace, ownHalf, type Position } from './board';
import {
  Color,
  EMPTY,
  fileOf,
  type Move,
  onBoard,
  PieceType,
  pieceColor,
  pieceType,
  rankOf,
  sq,
} from './types';

// [df, dr]
const ORTHOGONAL: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

const DIAGONAL: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

// Horse: [df, dr, legDf, legDr] — the leg is the orthogonal point the horse
// steps over; if occupied, the move is blocked (蹩马腿).
const HORSE: ReadonlyArray<readonly [number, number, number, number]> = [
  [1, 2, 0, 1],
  [-1, 2, 0, 1],
  [1, -2, 0, -1],
  [-1, -2, 0, -1],
  [2, 1, 1, 0],
  [2, -1, 1, 0],
  [-2, 1, -1, 0],
  [-2, -1, -1, 0],
];

// Elephant: [df, dr, eyeDf, eyeDr] — the eye is the midpoint; if occupied, the
// move is blocked (塞象眼).
const ELEPHANT: ReadonlyArray<readonly [number, number, number, number]> = [
  [2, 2, 1, 1],
  [2, -2, 1, -1],
  [-2, 2, -1, 1],
  [-2, -2, -1, -1],
];

function canLand(board: Board, color: Color, file: number, rank: number): boolean {
  if (!onBoard(file, rank)) return false;
  const target = board[sq(file, rank)];
  return target === EMPTY || pieceColor(target) !== color;
}

export function generatePseudoLegalMoves(pos: Position): Move[] {
  const moves: Move[] = [];
  const { board, turn } = pos;
  for (let i = 0; i < board.length; i++) {
    const piece = board[i];
    if (piece === EMPTY || pieceColor(piece) !== turn) continue;
    const f = fileOf(i);
    const r = rankOf(i);
    switch (pieceType(piece)) {
      case PieceType.General:
        genGeneral(board, turn, f, r, i, moves);
        break;
      case PieceType.Advisor:
        genAdvisor(board, turn, f, r, i, moves);
        break;
      case PieceType.Elephant:
        genElephant(board, turn, f, r, i, moves);
        break;
      case PieceType.Horse:
        genHorse(board, turn, f, r, i, moves);
        break;
      case PieceType.Chariot:
        genChariot(board, turn, f, r, i, moves);
        break;
      case PieceType.Cannon:
        genCannon(board, turn, f, r, i, moves);
        break;
      case PieceType.Soldier:
        genSoldier(board, turn, f, r, i, moves);
        break;
      default:
        break;
    }
  }
  return moves;
}

function genGeneral(
  board: Board,
  color: Color,
  f: number,
  r: number,
  from: number,
  moves: Move[],
): void {
  for (const [df, dr] of ORTHOGONAL) {
    const nf = f + df;
    const nr = r + dr;
    if (!inPalace(nf, nr, color)) continue;
    if (canLand(board, color, nf, nr)) moves.push({ from, to: sq(nf, nr) });
  }
}

function genAdvisor(
  board: Board,
  color: Color,
  f: number,
  r: number,
  from: number,
  moves: Move[],
): void {
  for (const [df, dr] of DIAGONAL) {
    const nf = f + df;
    const nr = r + dr;
    if (!inPalace(nf, nr, color)) continue;
    if (canLand(board, color, nf, nr)) moves.push({ from, to: sq(nf, nr) });
  }
}

function genElephant(
  board: Board,
  color: Color,
  f: number,
  r: number,
  from: number,
  moves: Move[],
): void {
  for (const [df, dr, edf, edr] of ELEPHANT) {
    const nf = f + df;
    const nr = r + dr;
    if (!onBoard(nf, nr)) continue;
    if (!ownHalf(nr, color)) continue; // elephants never cross the river
    if (board[sq(f + edf, r + edr)] !== EMPTY) continue; // blocked eye
    if (canLand(board, color, nf, nr)) moves.push({ from, to: sq(nf, nr) });
  }
}

function genHorse(
  board: Board,
  color: Color,
  f: number,
  r: number,
  from: number,
  moves: Move[],
): void {
  for (const [df, dr, ldf, ldr] of HORSE) {
    const nf = f + df;
    const nr = r + dr;
    if (!onBoard(nf, nr)) continue;
    if (board[sq(f + ldf, r + ldr)] !== EMPTY) continue; // hobbled leg
    if (canLand(board, color, nf, nr)) moves.push({ from, to: sq(nf, nr) });
  }
}

function genChariot(
  board: Board,
  color: Color,
  f: number,
  r: number,
  from: number,
  moves: Move[],
): void {
  for (const [df, dr] of ORTHOGONAL) {
    let nf = f + df;
    let nr = r + dr;
    while (onBoard(nf, nr)) {
      const target = board[sq(nf, nr)];
      if (target === EMPTY) {
        moves.push({ from, to: sq(nf, nr) });
      } else {
        if (pieceColor(target) !== color) moves.push({ from, to: sq(nf, nr) });
        break;
      }
      nf += df;
      nr += dr;
    }
  }
}

function genCannon(
  board: Board,
  color: Color,
  f: number,
  r: number,
  from: number,
  moves: Move[],
): void {
  for (const [df, dr] of ORTHOGONAL) {
    let nf = f + df;
    let nr = r + dr;
    // Non-capturing slides across empty points.
    while (onBoard(nf, nr) && board[sq(nf, nr)] === EMPTY) {
      moves.push({ from, to: sq(nf, nr) });
      nf += df;
      nr += dr;
    }
    if (!onBoard(nf, nr)) continue; // no screen in this direction
    // (nf, nr) is the screen. Jump it and capture the first piece beyond.
    nf += df;
    nr += dr;
    while (onBoard(nf, nr)) {
      const target = board[sq(nf, nr)];
      if (target !== EMPTY) {
        if (pieceColor(target) !== color) moves.push({ from, to: sq(nf, nr) });
        break;
      }
      nf += df;
      nr += dr;
    }
  }
}

function genSoldier(
  board: Board,
  color: Color,
  f: number,
  r: number,
  from: number,
  moves: Move[],
): void {
  const forward = color === Color.Red ? 1 : -1;
  if (canLand(board, color, f, r + forward)) {
    moves.push({ from, to: sq(f, r + forward) });
  }
  if (crossedRiver(r, color)) {
    if (canLand(board, color, f - 1, r)) moves.push({ from, to: sq(f - 1, r) });
    if (canLand(board, color, f + 1, r)) moves.push({ from, to: sq(f + 1, r) });
  }
}
