/**
 * Board representation and low-level mutation (make / unmake).
 *
 * A {@link Position} is the minimal mutable game state: the 90-cell board plus
 * the side to move. Higher-level concepts (history, repetition, result) live in
 * {@link ./game}.
 */

import { BOARD_SIZE, Color, EMPTY, type Move, type Piece } from './types';

export type Board = Int8Array;

export interface Position {
  board: Board;
  turn: Color;
}

/** Record produced by {@link makeMove}, consumed by {@link unmakeMove}. */
export interface Undo {
  from: number;
  to: number;
  captured: Piece;
}

export function emptyBoard(): Board {
  return new Int8Array(BOARD_SIZE);
}

export function clonePosition(pos: Position): Position {
  return { board: pos.board.slice(), turn: pos.turn };
}

// --- Region helpers -------------------------------------------------------

/** The 3x3 palace: files 3-5, ranks 0-2 for Red and 7-9 for Black. */
export function inPalace(file: number, rank: number, color: Color): boolean {
  if (file < 3 || file > 5) return false;
  return color === Color.Red ? rank >= 0 && rank <= 2 : rank >= 7 && rank <= 9;
}

/** True if `rank` is on `color`'s own side of the river (elephants stay here). */
export function ownHalf(rank: number, color: Color): boolean {
  return color === Color.Red ? rank <= 4 : rank >= 5;
}

/** True once a soldier of `color` has crossed the river (may then move sideways). */
export function crossedRiver(rank: number, color: Color): boolean {
  return color === Color.Red ? rank >= 5 : rank <= 4;
}

// --- Mutation -------------------------------------------------------------

export function makeMove(pos: Position, move: Move): Undo {
  const captured = pos.board[move.to];
  pos.board[move.to] = pos.board[move.from];
  pos.board[move.from] = EMPTY;
  pos.turn = pos.turn === Color.Red ? Color.Black : Color.Red;
  return { from: move.from, to: move.to, captured };
}

export function unmakeMove(pos: Position, undo: Undo): void {
  pos.board[undo.from] = pos.board[undo.to];
  pos.board[undo.to] = undo.captured;
  pos.turn = pos.turn === Color.Red ? Color.Black : Color.Red;
}
