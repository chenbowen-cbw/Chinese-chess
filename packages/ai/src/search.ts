/**
 * Negamax alpha-beta search with iterative deepening, a quiescence search to
 * tame the horizon effect, and MVV-LVA move ordering. A wall-clock budget caps
 * thinking time; incomplete iterations are discarded.
 */

import {
  clonePosition,
  EMPTY,
  generateLegalMoves,
  makeMove,
  type Move,
  type Position,
  pieceType,
  unmakeMove,
} from '@xiangqi/engine';
import { evaluate } from './evaluate';
import { VALUE } from './values';

export const MATE = 1_000_000;
const INF = 2_000_000;
const MATE_THRESHOLD = MATE - 1000;

export interface SearchLimits {
  maxDepth: number;
  timeMs: number;
}

export interface SearchResult {
  move: Move | null;
  score: number;
  depth: number;
  nodes: number;
}

interface Ctx {
  nodes: number;
  ply: number;
  deadline: number;
  stopped: boolean;
  rootBest: Move | null;
}

export function search(root: Position, limits: SearchLimits): SearchResult {
  const pos = clonePosition(root);
  const ctx: Ctx = {
    nodes: 0,
    ply: 0,
    deadline: Date.now() + Math.max(1, limits.timeMs),
    stopped: false,
    rootBest: null,
  };

  let result: SearchResult = { move: null, score: 0, depth: 0, nodes: 0 };

  for (let depth = 1; depth <= limits.maxDepth; depth++) {
    if (ctx.stopped) break;
    const iteration = searchRoot(pos, depth, ctx);
    if (ctx.stopped && depth > 1) break; // discard incomplete deepening
    result = { move: iteration.move, score: iteration.score, depth, nodes: ctx.nodes };
    ctx.rootBest = iteration.move;
    if (Math.abs(iteration.score) >= MATE_THRESHOLD) break; // forced mate found
  }

  result.nodes = ctx.nodes;
  return result;
}

function searchRoot(pos: Position, depth: number, ctx: Ctx): { move: Move | null; score: number } {
  const moves = generateLegalMoves(pos);
  if (moves.length === 0) return { move: null, score: -MATE + ctx.ply };

  shuffle(moves); // vary play between otherwise-equal moves
  orderMoves(pos, moves, ctx.rootBest);

  let alpha = -INF;
  let bestMove: Move = moves[0];
  let bestScore = -INF;
  ctx.ply = 0;

  for (const move of moves) {
    const undo = makeMove(pos, move);
    ctx.ply = 1;
    const score = -negamax(pos, depth - 1, -INF, -alpha, ctx);
    ctx.ply = 0;
    unmakeMove(pos, undo);
    if (ctx.stopped && depth > 1) break;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
    if (score > alpha) alpha = score;
  }

  return { move: bestMove, score: bestScore };
}

function negamax(pos: Position, depth: number, alpha: number, beta: number, ctx: Ctx): number {
  if (ctx.stopped) return 0;
  if (depth <= 0) return quiescence(pos, alpha, beta, ctx);

  ctx.nodes++;
  if ((ctx.nodes & 2047) === 0 && Date.now() >= ctx.deadline) {
    ctx.stopped = true;
    return 0;
  }

  const moves = generateLegalMoves(pos);
  if (moves.length === 0) return -MATE + ctx.ply; // checkmate or stalemate: loss

  orderMoves(pos, moves, null);
  let best = -INF;

  for (const move of moves) {
    const undo = makeMove(pos, move);
    ctx.ply++;
    const score = -negamax(pos, depth - 1, -beta, -alpha, ctx);
    ctx.ply--;
    unmakeMove(pos, undo);
    if (ctx.stopped) return best;
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break; // beta cutoff
  }

  return best;
}

function quiescence(pos: Position, alpha: number, beta: number, ctx: Ctx): number {
  if (ctx.stopped) return 0;
  ctx.nodes++;
  if ((ctx.nodes & 2047) === 0 && Date.now() >= ctx.deadline) {
    ctx.stopped = true;
    return 0;
  }

  const standPat = evaluate(pos);
  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;

  const captures = generateLegalMoves(pos).filter((m) => pos.board[m.to] !== EMPTY);
  orderMoves(pos, captures, null);

  for (const move of captures) {
    const undo = makeMove(pos, move);
    const score = -quiescence(pos, -beta, -alpha, ctx);
    unmakeMove(pos, undo);
    if (ctx.stopped) return alpha;
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

function orderMoves(pos: Position, moves: Move[], pv: Move | null): void {
  const board = pos.board;
  moves.sort((a, b) => scoreMove(board, b, pv) - scoreMove(board, a, pv));
}

function scoreMove(board: Int8Array, move: Move, pv: Move | null): number {
  if (pv !== null && move.from === pv.from && move.to === pv.to) return 2_000_000;
  const victim = board[move.to];
  if (victim !== EMPTY) {
    // MVV-LVA: prefer capturing valuable victims with cheap attackers.
    return 1_000_000 + VALUE[pieceType(victim)] * 10 - VALUE[pieceType(board[move.from])];
  }
  return 0;
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}
