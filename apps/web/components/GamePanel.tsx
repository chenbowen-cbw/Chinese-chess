'use client';

import type { ReactElement } from 'react';
import { Color, GameResult } from '@xiangqi/engine';
import type { Difficulty } from '@xiangqi/ai';
import type { MatchConfig } from '@/lib/useMatch';

interface GamePanelProps {
  config: MatchConfig;
  turn: Color;
  inCheck: boolean;
  result: GameResult;
  thinking: boolean;
  soundOn: boolean;
  notation: readonly string[];
  reviewing: boolean;
  currentPly: number;
  canUndo: boolean;
  onNewGame: (next?: Partial<MatchConfig>) => void;
  onUndo: () => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onToggleSound: () => void;
  onGoToPly: (ply: number) => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onToStart: () => void;
  onToLive: () => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '入门',
  medium: '中级',
  hard: '大师',
};

export function GamePanel(props: GamePanelProps): ReactElement {
  const { config, result, thinking, soundOn, notation, reviewing, currentPly } = props;
  const total = notation.length;
  const over = result !== GameResult.Ongoing;

  const rows = [];
  for (let i = 0; i < total; i += 2) {
    rows.push({ no: i / 2 + 1, red: i, black: i + 1 < total ? i + 1 : -1 });
  }

  return (
    <aside className="panel">
      <div className="panel-head">
        <h1>中国象棋</h1>
        <button
          type="button"
          className="icon-btn"
          aria-label="音效开关"
          title={soundOn ? '关闭音效' : '开启音效'}
          onClick={props.onToggleSound}
        >
          {soundOn ? '🔊' : '🔈'}
        </button>
      </div>

      <div className="segmented" role="group" aria-label="对战模式">
        <button
          type="button"
          className={config.mode === 'pvp' ? 'active' : ''}
          onClick={() => props.onNewGame({ mode: 'pvp' })}
        >
          本地双人
        </button>
        <button
          type="button"
          className={config.mode === 'pve' ? 'active' : ''}
          onClick={() => props.onNewGame({ mode: 'pve' })}
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
                onClick={() => props.onNewGame({ humanColor: Color.Red })}
              >
                红先
              </button>
              <button
                type="button"
                className={config.humanColor === Color.Black ? 'active' : ''}
                onClick={() => props.onNewGame({ humanColor: Color.Black })}
              >
                黑后
              </button>
            </div>
          </label>
          <label>
            难度
            <select
              value={config.difficulty}
              onChange={(e) => props.onDifficultyChange(e.target.value as Difficulty)}
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
        {reviewing
          ? `复盘 ${currentPly} / ${total}`
          : thinking
            ? '电脑思考中…'
            : statusText(props.turn, props.inCheck, result)}
      </div>

      <div className="controls">
        <button type="button" onClick={() => props.onNewGame()}>
          新局
        </button>
        <button type="button" onClick={props.onUndo} disabled={!props.canUndo || thinking}>
          悔棋
        </button>
      </div>

      <div className="replay" role="group" aria-label="复盘">
        <button
          type="button"
          onClick={props.onToStart}
          disabled={currentPly === 0}
          title="回到开局"
        >
          ⏮
        </button>
        <button
          type="button"
          onClick={props.onStepBackward}
          disabled={currentPly === 0}
          title="上一步"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={props.onStepForward}
          disabled={currentPly >= total}
          title="下一步"
        >
          ▶
        </button>
        <button
          type="button"
          onClick={props.onToLive}
          disabled={currentPly >= total}
          title="回到最新"
        >
          ⏭
        </button>
      </div>

      <ol className="history">
        {rows.map((row) => (
          <li key={row.no}>
            <span className="num">{row.no}.</span>
            <button
              type="button"
              className={`mv${currentPly === row.red + 1 ? ' active' : ''}`}
              onClick={() => props.onGoToPly(row.red + 1)}
            >
              {notation[row.red]}
            </button>
            {row.black >= 0 && (
              <button
                type="button"
                className={`mv${currentPly === row.black + 1 ? ' active' : ''}`}
                onClick={() => props.onGoToPly(row.black + 1)}
              >
                {notation[row.black]}
              </button>
            )}
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
