/**
 * @xiangqi/ai — search and evaluation for Chinese Chess, built on
 * @xiangqi/engine. Pure and worker-friendly.
 */

import { generateLegalMoves, type Position } from '@xiangqi/engine';
import { search, type SearchResult } from './search';

export * from './evaluate';
export * from './search';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

interface Preset {
  maxDepth: number;
  timeMs: number;
  /** Probability of playing a random legal move instead of searching. */
  blunder: number;
}

const PRESETS: Record<Difficulty, Preset> = {
  easy: { maxDepth: 2, timeMs: 500, blunder: 0.3 },
  medium: { maxDepth: 4, timeMs: 1200, blunder: 0 },
  hard: { maxDepth: 6, timeMs: 3000, blunder: 0 },
};

export interface ChooseOptions {
  difficulty: Difficulty;
}

/** Pick a move for the given position at the requested difficulty. */
export function chooseMove(pos: Position, opts: ChooseOptions): SearchResult {
  const preset = PRESETS[opts.difficulty];
  const legal = generateLegalMoves(pos);
  if (legal.length === 0) return { move: null, score: 0, depth: 0, nodes: 0 };

  if (preset.blunder > 0 && Math.random() < preset.blunder) {
    const move = legal[(Math.random() * legal.length) | 0];
    return { move, score: 0, depth: 0, nodes: 0 };
  }

  return search(pos, { maxDepth: preset.maxDepth, timeMs: preset.timeMs });
}
