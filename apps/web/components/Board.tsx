'use client';

import type { CSSProperties, ReactElement } from 'react';
import { Color, EMPTY, fileOf, type Move, pieceColor, pieceType, rankOf } from '@xiangqi/engine';
import { BOARD_H, BOARD_W, CELL, px, py } from '@/lib/geometry';
import { pieceLabel } from '@/lib/labels';
import { BoardGrid } from './BoardGrid';

interface BoardProps {
  board: Int8Array;
  selected: number | null;
  targets: number[];
  lastMove: Move | null;
  checkSquare: number;
  /** Counter that changes once per ply; drives the slide animation. */
  ply: number;
  disabled?: boolean;
  onPointClick: (index: number) => void;
}

export function Board({
  board,
  selected,
  targets,
  lastMove,
  checkSquare,
  ply,
  disabled = false,
  onPointClick,
}: BoardProps): ReactElement {
  const targetSet = new Set(targets);
  const size = CELL * 0.86;
  const points: ReactElement[] = [];

  for (let i = 0; i < board.length; i++) {
    const file = fileOf(i);
    const rank = rankOf(i);
    const piece = board[i];
    const isTarget = targetSet.has(i);
    const isSelected = selected === i;
    const isLast = lastMove !== null && (lastMove.from === i || lastMove.to === i);
    const isCheck = checkSquare === i;
    const isMovedPiece = lastMove !== null && lastMove.to === i && piece !== EMPTY;

    const pieceClass = piece === EMPTY ? '' : pieceColor(piece) === Color.Red ? 'red' : 'black';

    // The moved piece slides in from where it came; remount per ply so the
    // animation runs exactly once per move.
    let slideStyle: CSSProperties | undefined;
    if (isMovedPiece && lastMove) {
      const dx = px(fileOf(lastMove.from)) - px(file);
      const dy = py(rankOf(lastMove.from)) - py(rank);
      slideStyle = { ['--dx']: `${dx}px`, ['--dy']: `${dy}px` } as CSSProperties;
    }

    points.push(
      <button
        key={i}
        type="button"
        className="point"
        style={{ left: px(file) - size / 2, top: py(rank) - size / 2, width: size, height: size }}
        onClick={() => onPointClick(i)}
        disabled={disabled}
        aria-label={`${file},${rank}`}
      >
        {isLast && <span className="mark last" />}
        {isSelected && <span className="mark selected" />}
        {piece !== EMPTY ? (
          <span
            key={isMovedPiece ? `pc-${ply}` : 'pc'}
            className={`piece ${pieceClass}${isCheck ? ' check' : ''}${isTarget ? ' capture' : ''}${
              isMovedPiece ? ' sliding' : ''
            }`}
            style={slideStyle}
          >
            {pieceLabel(pieceColor(piece), pieceType(piece))}
          </span>
        ) : (
          isTarget && <span className="dot" />
        )}
      </button>,
    );
  }

  return (
    <div className="board" style={{ width: BOARD_W, height: BOARD_H }}>
      <BoardGrid />
      {points}
    </div>
  );
}
