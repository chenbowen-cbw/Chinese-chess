'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import {
  Color,
  EMPTY,
  findGeneral,
  Game,
  GameResult,
  type Move,
  opponent,
  pieceColor,
} from '@xiangqi/engine';
import type { Difficulty } from '@xiangqi/ai';
import { useAiWorker } from './useAiWorker';

export type Mode = 'pvp' | 'pve';

export interface MatchConfig {
  mode: Mode;
  /** In PVE, the colour the human plays. */
  humanColor: Color;
  difficulty: Difficulty;
}

export const DEFAULT_CONFIG: MatchConfig = {
  mode: 'pvp',
  humanColor: Color.Red,
  difficulty: 'medium',
};

export interface Match {
  board: Int8Array;
  turn: Color;
  selected: number | null;
  targets: number[];
  lastMove: Move | null;
  checkSquare: number;
  inCheck: boolean;
  result: GameResult;
  finished: boolean;
  history: readonly Move[];
  thinking: boolean;
  config: MatchConfig;
  humanToMove: boolean;
  onPointClick: (index: number) => void;
  newGame: (next?: Partial<MatchConfig>) => void;
  undo: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
}

export function useMatch(): Match {
  const gameRef = useRef<Game | null>(null);
  if (gameRef.current === null) gameRef.current = new Game();
  const game = gameRef.current;

  const [version, bump] = useReducer((c: number) => c + 1, 0);
  const [selected, setSelected] = useState<number | null>(null);
  const [config, setConfig] = useState<MatchConfig>(DEFAULT_CONFIG);
  const [thinking, setThinking] = useState(false);

  const requestMove = useAiWorker();
  const aiBusyRef = useRef(false);

  const board = game.position.board;
  const turn = game.turn();
  const result = game.result();
  const finished = result !== GameResult.Ongoing;
  const inCheck = game.inCheck();
  const checkSquare = inCheck ? findGeneral(board, turn) : -1;
  const history = game.history();
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  const aiColor = config.mode === 'pve' ? opponent(config.humanColor) : null;
  const humanToMove = aiColor === null || turn !== aiColor;

  const legalMoves = game.legalMoves();
  const targets =
    selected === null ? [] : legalMoves.filter((m) => m.from === selected).map((m) => m.to);

  // Let the AI move when it is its turn.
  useEffect(() => {
    if (aiColor === null || finished || turn !== aiColor || aiBusyRef.current) return;
    aiBusyRef.current = true;
    setThinking(true);
    const fen = game.fen();
    let cancelled = false;
    void requestMove(fen, config.difficulty).then((move) => {
      aiBusyRef.current = false;
      setThinking(false);
      if (cancelled) return;
      // Ignore a stale reply if the board changed (undo / new game) meanwhile.
      if (move && game.fen() === fen) {
        game.move(move);
        setSelected(null);
        bump();
      }
    });
    return () => {
      cancelled = true;
    };
    // `version` re-evaluates after every board change.
  }, [version, aiColor, finished, turn, config.difficulty, game, requestMove]);

  function onPointClick(index: number): void {
    if (finished || thinking || !humanToMove) return;
    if (selected !== null && targets.includes(index)) {
      game.move({ from: selected, to: index });
      setSelected(null);
      bump();
      return;
    }
    const piece = board[index];
    if (piece !== EMPTY && pieceColor(piece) === turn) setSelected(index);
    else setSelected(null);
  }

  function newGame(next?: Partial<MatchConfig>): void {
    gameRef.current = new Game();
    aiBusyRef.current = false;
    if (next) setConfig((c) => ({ ...c, ...next }));
    setSelected(null);
    setThinking(false);
    bump();
  }

  function undo(): void {
    if (thinking) return;
    game.undo();
    // In PVE, also undo the AI's reply so it stays the human's turn.
    if (aiColor !== null && game.turn() === aiColor) game.undo();
    setSelected(null);
    bump();
  }

  function setDifficulty(difficulty: Difficulty): void {
    setConfig((c) => ({ ...c, difficulty }));
  }

  return {
    board,
    turn,
    selected,
    targets,
    lastMove,
    checkSquare,
    inCheck,
    result,
    finished,
    history,
    thinking,
    config,
    humanToMove,
    onPointClick,
    newGame,
    undo,
    setDifficulty,
  };
}
