/**
 * Traditional Chinese move notation (e.g. 炮二平五, 马８进七, 车九进一).
 *
 * Red files are counted right-to-left with Chinese numerals 一..九 (file 8 = 一);
 * Black files are counted right-to-left with Arabic 1..9 (file 0 = 1). A move is
 * written as: piece + origin-file, then 进/退/平, then either the destination
 * file (horizontal moves and the "fixed-shape" pieces 马/相/士) or the number of
 * ranks travelled (the "straight" pieces 车/炮/兵/将). Two same-type pieces on one
 * file are disambiguated with 前/后 (or 前/中/后) instead of the origin file.
 */

import { makeMove, type Position } from './board';
import { initialPosition } from './fen';
import { Color, EMPTY, fileOf, type Move, PieceType, pieceColor, pieceType, rankOf } from './types';

const RED_DIGITS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

const RED_NAME: Record<PieceType, string> = {
  [PieceType.None]: '',
  [PieceType.General]: '帅',
  [PieceType.Advisor]: '仕',
  [PieceType.Elephant]: '相',
  [PieceType.Horse]: '马',
  [PieceType.Chariot]: '车',
  [PieceType.Cannon]: '炮',
  [PieceType.Soldier]: '兵',
};

const BLACK_NAME: Record<PieceType, string> = {
  [PieceType.None]: '',
  [PieceType.General]: '将',
  [PieceType.Advisor]: '士',
  [PieceType.Elephant]: '象',
  [PieceType.Horse]: '马',
  [PieceType.Chariot]: '车',
  [PieceType.Cannon]: '炮',
  [PieceType.Soldier]: '卒',
};

// Pieces that move straight along a file: 进/退 counts ranks travelled.
const STRAIGHT = new Set<PieceType>([
  PieceType.Chariot,
  PieceType.Cannon,
  PieceType.Soldier,
  PieceType.General,
]);

/** Render a 1..9 value in the side's numerals. */
function sideNumber(color: Color, value: number): string {
  return color === Color.Red ? RED_DIGITS[value - 1] : String(value);
}

/** The file's column label from the given side's perspective. */
function columnLabel(color: Color, file: number): string {
  return color === Color.Red ? RED_DIGITS[8 - file] : String(file + 1);
}

function positionLabel(index: number, count: number, color: Color): string {
  if (count === 2) return ['前', '后'][index];
  if (count === 3) return ['前', '中', '后'][index];
  return sideNumber(color, index + 1); // 4-5 stacked soldiers, counted from the front
}

/** Describe `move` in traditional notation, given the position before it. */
export function toChineseNotation(pos: Position, move: Move): string {
  const board = pos.board;
  const piece = board[move.from];
  const color = pieceColor(piece);
  const type = pieceType(piece);
  const fromFile = fileOf(move.from);
  const fromRank = rankOf(move.from);
  const toFile = fileOf(move.to);
  const toRank = rankOf(move.to);
  const name = (color === Color.Red ? RED_NAME : BLACK_NAME)[type];

  // Same-colour, same-type pieces sharing the origin file need 前/后.
  const sameFileRanks: number[] = [];
  for (let rank = 0; rank < 10; rank++) {
    const p = board[rank * 9 + fromFile];
    if (p !== EMPTY && pieceColor(p) === color && pieceType(p) === type) {
      sameFileRanks.push(rank);
    }
  }

  let descriptor: string;
  if (sameFileRanks.length >= 2) {
    // Front = more advanced: higher rank for Red, lower rank for Black.
    sameFileRanks.sort((a, b) => (color === Color.Red ? b - a : a - b));
    descriptor = positionLabel(sameFileRanks.indexOf(fromRank), sameFileRanks.length, color) + name;
  } else {
    descriptor = name + columnLabel(color, fromFile);
  }

  if (toRank === fromRank) {
    return descriptor + '平' + columnLabel(color, toFile);
  }

  const forward = color === Color.Red ? toRank > fromRank : toRank < fromRank;
  const action = forward ? '进' : '退';
  const target = STRAIGHT.has(type)
    ? sideNumber(color, Math.abs(toRank - fromRank))
    : columnLabel(color, toFile);
  return descriptor + action + target;
}

/** Replay a move list (from the initial position unless `start` is given) and
 * return each move in traditional notation. */
export function historyToChinese(moves: readonly Move[], start?: Position): string[] {
  const pos: Position = start
    ? { board: start.board.slice(), turn: start.turn }
    : initialPosition();
  const out: string[] = [];
  for (const move of moves) {
    out.push(toChineseNotation(pos, move));
    makeMove(pos, move);
  }
  return out;
}
