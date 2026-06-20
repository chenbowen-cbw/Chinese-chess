import { Color, EMPTY, type Position, pieceColor, pieceType } from '@xiangqi/engine';
import { mirror, PST } from './pst';
import { VALUE } from './values';

/**
 * Static evaluation in centipawns, returned from the perspective of the side to
 * move (positive = good for the player about to move). Material dominates;
 * piece-square tables add positional nudges.
 */
export function evaluate(pos: Position): number {
  const board = pos.board;
  let score = 0; // from Red's perspective

  for (let i = 0; i < board.length; i++) {
    const piece = board[i];
    if (piece === EMPTY) continue;
    const type = pieceType(piece);
    if (pieceColor(piece) === Color.Red) {
      score += VALUE[type] + PST[type][i];
    } else {
      score -= VALUE[type] + PST[type][mirror(i)];
    }
  }

  return pos.turn === Color.Red ? score : -score;
}
