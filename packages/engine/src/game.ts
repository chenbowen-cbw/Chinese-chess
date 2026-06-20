/**
 * High-level game wrapper: move history, undo, threefold-repetition draws, and
 * overall result. The UI and the network layer drive a {@link Game}; the AI
 * searches over the lower-level {@link Position} directly.
 */

import { makeMove, type Position, type Undo, unmakeMove } from './board';
import { INITIAL_FEN, parseFen, toFen } from './fen';
import { type Move, movesEqual, Color } from './types';
import { generateLegalMoves, isInCheck } from './rules';

export enum GameResult {
  Ongoing = 'ongoing',
  RedWins = 'red',
  BlackWins = 'black',
  Draw = 'draw',
}

/**
 * Result purely from the position on the board (ignoring repetition history):
 * if the side to move has no legal move it loses, whether by checkmate or by
 * stalemate (困毙).
 */
export function resultFromPosition(pos: Position): GameResult {
  if (generateLegalMoves(pos).length === 0) {
    return pos.turn === Color.Red ? GameResult.BlackWins : GameResult.RedWins;
  }
  return GameResult.Ongoing;
}

export class Game {
  position: Position;
  private readonly undoStack: Undo[] = [];
  private readonly moveList: Move[] = [];
  // Board+turn keys, one per visited position, used for repetition detection.
  private readonly keys: string[] = [];

  constructor(fen: string = INITIAL_FEN) {
    this.position = parseFen(fen);
    this.keys.push(positionKey(this.position));
  }

  turn(): Color {
    return this.position.turn;
  }

  fen(): string {
    return toFen(this.position);
  }

  legalMoves(): Move[] {
    return generateLegalMoves(this.position);
  }

  isLegal(move: Move): boolean {
    return this.legalMoves().some((m) => movesEqual(m, move));
  }

  inCheck(): boolean {
    return isInCheck(this.position, this.position.turn);
  }

  history(): readonly Move[] {
    return this.moveList;
  }

  /** Apply a move if legal; returns false (and changes nothing) otherwise. */
  move(move: Move): boolean {
    if (!this.isLegal(move)) return false;
    this.undoStack.push(makeMove(this.position, move));
    this.moveList.push(move);
    this.keys.push(positionKey(this.position));
    return true;
  }

  /** Undo the most recent move; returns false if there is none. */
  undo(): boolean {
    const undo = this.undoStack.pop();
    if (undo === undefined) return false;
    unmakeMove(this.position, undo);
    this.moveList.pop();
    this.keys.pop();
    return true;
  }

  /** Current result, including threefold repetition as a draw (simplified). */
  result(): GameResult {
    const positional = resultFromPosition(this.position);
    if (positional !== GameResult.Ongoing) return positional;

    const current = this.keys[this.keys.length - 1];
    let count = 0;
    for (const key of this.keys) {
      if (key === current) count += 1;
    }
    return count >= 3 ? GameResult.Draw : GameResult.Ongoing;
  }
}

function positionKey(pos: Position): string {
  // Board layout + side to move is enough to identify a repeated position.
  return toFen(pos).split(' ').slice(0, 2).join(' ');
}
