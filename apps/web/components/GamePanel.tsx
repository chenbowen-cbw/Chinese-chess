'use client';

import type { ReactElement } from 'react';
import { Color, GameResult, type Move, moveToCoord } from '@xiangqi/engine';

interface GamePanelProps {
  turn: Color;
  inCheck: boolean;
  result: GameResult;
  history: readonly Move[];
  canUndo: boolean;
  onReset: () => void;
  onUndo: () => void;
}

export function GamePanel({
  turn,
  inCheck,
  result,
  history,
  canUndo,
  onReset,
  onUndo,
}: GamePanelProps): ReactElement {
  const over = result !== GameResult.Ongoing;
  return (
    <aside className="panel">
      <h1>中国象棋</h1>
      <p className="mode">本地双人对战 · PVP</p>

      <div className={`status${over ? ' over' : ''}`}>{statusText(turn, inCheck, result)}</div>

      <div className="controls">
        <button type="button" onClick={onReset}>
          新局
        </button>
        <button type="button" onClick={onUndo} disabled={!canUndo}>
          悔棋
        </button>
      </div>

      <ol className="history">
        {history.map((move, i) => (
          <li key={i}>
            <span className="num">{i + 1}.</span>
            {moveToCoord(move)}
          </li>
        ))}
      </ol>
    </aside>
  );
}

function statusText(turn: Color, inCheck: boolean, result: GameResult): string {
  if (result === GameResult.RedWins) return '红方胜 🎉';
  if (result === GameResult.BlackWins) return '黑方胜 🎉';
  if (result === GameResult.Draw) return '和棋';
  const side = turn === Color.Red ? '红方' : '黑方';
  return inCheck ? `${side}走棋（将军！）` : `轮到 ${side} 走棋`;
}
