import { Color, PieceType } from '@xiangqi/engine';

const RED: Record<PieceType, string> = {
  [PieceType.None]: '',
  [PieceType.General]: '帅',
  [PieceType.Advisor]: '仕',
  [PieceType.Elephant]: '相',
  [PieceType.Horse]: '马',
  [PieceType.Chariot]: '车',
  [PieceType.Cannon]: '炮',
  [PieceType.Soldier]: '兵',
};

const BLACK: Record<PieceType, string> = {
  [PieceType.None]: '',
  [PieceType.General]: '将',
  [PieceType.Advisor]: '士',
  [PieceType.Elephant]: '象',
  [PieceType.Horse]: '马',
  [PieceType.Chariot]: '车',
  [PieceType.Cannon]: '炮',
  [PieceType.Soldier]: '卒',
};

export function pieceLabel(color: Color, type: PieceType): string {
  return color === Color.Red ? RED[type] : BLACK[type];
}
