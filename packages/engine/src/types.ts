/**
 * Core types and geometry for the Xiangqi (Chinese Chess) engine.
 *
 * Board geometry
 * --------------
 * The board has 9 files (columns) and 10 ranks (rows) = 90 points.
 * A point is addressed by a single index: `index = rank * 9 + file`.
 *
 *   - file: 0..8, left to right from Red's perspective (file 0 = column 'a').
 *   - rank: 0..9, where rank 0 is Red's back rank (bottom) and rank 9 is
 *     Black's back rank (top).
 *
 * Red advances toward higher ranks; Black advances toward lower ranks.
 * The river lies between rank 4 and rank 5.
 */

export enum Color {
  Red = 0,
  Black = 1,
}

export function opponent(color: Color): Color {
  return color === Color.Red ? Color.Black : Color.Red;
}

export enum PieceType {
  None = 0,
  General = 1, // 将 / 帅  (K)
  Advisor = 2, // 士 / 仕  (A)
  Elephant = 3, // 象 / 相  (B)
  Horse = 4, // 马       (N)
  Chariot = 5, // 车       (R)
  Cannon = 6, // 炮       (C)
  Soldier = 7, // 卒 / 兵  (P)
}

/**
 * A piece is encoded in a single small integer so the board can live in an
 * `Int8Array`:
 *   bits 0-2: PieceType (1-7); 0 means empty
 *   bit 3:    Color (0 = Red, 1 = Black)
 */
export type Piece = number;

export const EMPTY: Piece = 0;

export function makePiece(color: Color, type: PieceType): Piece {
  return (color << 3) | type;
}

export function pieceColor(piece: Piece): Color {
  return ((piece >> 3) & 1) as Color;
}

export function pieceType(piece: Piece): PieceType {
  return (piece & 7) as PieceType;
}

export function isEmpty(piece: Piece): boolean {
  return piece === EMPTY;
}

// --- Geometry -------------------------------------------------------------

export const FILES = 9;
export const RANKS = 10;
export const BOARD_SIZE = FILES * RANKS; // 90

export function sq(file: number, rank: number): number {
  return rank * FILES + file;
}

export function fileOf(index: number): number {
  return index % FILES;
}

export function rankOf(index: number): number {
  return (index / FILES) | 0;
}

export function onBoard(file: number, rank: number): boolean {
  return file >= 0 && file < FILES && rank >= 0 && rank < RANKS;
}

// --- Moves ----------------------------------------------------------------

/** A move is a pair of board indices. Metadata is derived from the board. */
export interface Move {
  from: number;
  to: number;
}

export function movesEqual(a: Move, b: Move): boolean {
  return a.from === b.from && a.to === b.to;
}
