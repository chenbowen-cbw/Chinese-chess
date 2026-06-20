/**
 * Perft (performance test): count the number of leaf nodes reachable in exactly
 * `depth` plies. Matching published Xiangqi perft values is the gold-standard
 * correctness check for move generation.
 *
 * Initial position reference counts:
 *   depth 1 = 44, depth 2 = 1920, depth 3 = 79666, depth 4 = 3290240.
 */

import { makeMove, type Position, unmakeMove } from './board';
import { generateLegalMoves } from './rules';
import { moveToCoord } from './notation';

export function perft(pos: Position, depth: number): number {
  if (depth <= 0) return 1;
  const moves = generateLegalMoves(pos);
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const move of moves) {
    const undo = makeMove(pos, move);
    nodes += perft(pos, depth - 1);
    unmakeMove(pos, undo);
  }
  return nodes;
}

/** Per-root-move perft breakdown, handy for debugging move generation. */
export function perftDivide(pos: Position, depth: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const move of generateLegalMoves(pos)) {
    const undo = makeMove(pos, move);
    result[moveToCoord(move)] = depth <= 1 ? 1 : perft(pos, depth - 1);
    unmakeMove(pos, undo);
  }
  return result;
}
