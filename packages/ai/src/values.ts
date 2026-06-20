import { PieceType } from '@xiangqi/engine';

/** Material values in centipawns. The general's value is nominal (it can never
 * actually be captured in a legal game) but kept large for safety. */
export const VALUE: Record<PieceType, number> = {
  [PieceType.None]: 0,
  [PieceType.General]: 10000,
  [PieceType.Advisor]: 200,
  [PieceType.Elephant]: 200,
  [PieceType.Horse]: 450,
  [PieceType.Chariot]: 900,
  [PieceType.Cannon]: 450,
  [PieceType.Soldier]: 100,
};
