'use client';

import type { ReactElement } from 'react';
import { Color, GameResult, type Move, moveToCoord } from '@xiangqi/engine';
import type { Difficulty } from '@xiangqi/ai';
import type { MatchConfig } from '@/lib/useMatch';

interface GamePanelProps {
  config: MatchConfig;
  turn: Color;
  inCheck: boolean;
  result: GameResult;
  thinking: boolean;
  history: readonly Move[];
  canUndo: boolean;
  onNewGame: (next?: Partial<MatchConfig>) => void;
  onUndo: () => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '入门',
  medium: '中级',
  hard: '大师',
};

export function GamePanel({
  config,
  turn,
  inCheck,
  result,
  thinking,
  history,
  canUndo,
  onNewGame,
  onUndo,
  onDifficultyChange,
}: GamePanelProps): ReactElement {
  const over = result !== GameResult.Ongoing;

  return (
    <aside className="panel">
      <h1>中国象棋</h1>

      <div className="segmented" role="group" aria-label="对战模式">
        <button
          type="button"
          className={config.mode === 'pvp' ? 'active' : ''}
          onClick={() => onNewGame({ mode: 'pvp' })}
        >
          本地双人
        </button>
        <button
          type="button"
          className={config.mode === 'pve' ? 'active' : ''}
          onClick={() => onNewGame({ mode: 'pve' })}
        >
          人机对战
        </button>
      </div>

      {config.mode === 'pve' && (
        <div className="options">
          <label>
            执方
            <div className="segmented small">
              <button
                type="button"
                className={config.humanColor === Color.Red ? 'active' : ''}
                onClick={() => onNewGame({ humanColor: Color.Red })}
              >
                红先
              </button>
              <button
                type="button"
                className={config.humanColor === Color.Black ? 'active' : ''}
                onClick={() => onNewGame({ humanColor: Color.Black })}
              >
                黑后
              </button>
            </div>
          </label>
          <label>
            难度
            <select
              value={config.difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
            >
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className={`status${over ? ' over' : ''}`}>
        {thinking ? '电脑思考中…' : statusText(turn, inCheck, result)}
      </div>

      <div className="controls">
        <button type="button" onClick={() => onNewGame()}>
          新局
        </button>
        <button type="button" onClick={onUndo} disabled={!canUndo || thinking}>
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
