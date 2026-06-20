'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Color,
  EMPTY,
  findGeneral,
  Game,
  GameResult,
  historyToChinese,
  initialPosition,
  isInCheck,
  makeMove,
  type Move,
  opponent,
  pieceColor,
  type Position,
} from '@xiangqi/engine';
import type { Difficulty } from '@xiangqi/ai';
import { useAiWorker } from './useAiWorker';
import { playSound } from './sound';

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
  // Displayed position (live, or a reconstructed past position while reviewing).
  board: Int8Array;
  selected: number | null;
  targets: number[];
  lastMove: Move | null;
  checkSquare: number;
  ply: number;
  // Live game status.
  turn: Color;
  inCheck: boolean;
  result: GameResult;
  finished: boolean;
  thinking: boolean;
  config: MatchConfig;
  humanToMove: boolean;
  soundOn: boolean;
  // Move record / replay.
  history: readonly Move[];
  notation: readonly string[];
  reviewing: boolean;
  currentPly: number;
  // Actions.
  onPointClick: (index: number) => void;
  newGame: (next?: Partial<MatchConfig>) => void;
  undo: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleSound: () => void;
  goToPly: (ply: number) => void;
  stepBackward: () => void;
  stepForward: () => void;
  toStart: () => void;
  toLive: () => void;
}

export function useMatch(): Match {
  const gameRef = useRef<Game | null>(null);
  if (gameRef.current === null) gameRef.current = new Game();
  const game = gameRef.current;

  const [version, bump] = useReducer((c: number) => c + 1, 0);
  const [selected, setSelected] = useState<number | null>(null);
  const [config, setConfig] = useState<MatchConfig>(DEFAULT_CONFIG);
  const [thinking, setThinking] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [reviewPly, setReviewPly] = useState<number | null>(null);

  const requestMove = useAiWorker();
  // Monotonic token: each AI request claims one; only the current token may
  // apply a result. Bumped on supersession so stale resolutions are ignored.
  const aiTokenRef = useRef(0);
  // Latest sound preference, read at move time (not captured when the AI started).
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  // Live state.
  const turn = game.turn();
  const result = game.result();
  const finished = result !== GameResult.Ongoing;
  const inCheck = game.inCheck();
  const history = game.history();
  // `version` changes on every game mutation (move / undo / new game).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notation = useMemo(() => historyToChinese(history), [version]);

  const aiColor = config.mode === 'pve' ? opponent(config.humanColor) : null;
  const humanToMove = aiColor === null || turn !== aiColor;

  // Displayed state — live, or a reconstructed past position while reviewing.
  const reviewing = reviewPly !== null;
  const currentPly = reviewPly ?? history.length;
  const displayPos = useMemo<Position>(
    () => (reviewPly !== null ? reconstruct(history, reviewPly) : game.position),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, reviewPly],
  );
  const board = displayPos.board;
  const lastMove = currentPly > 0 ? history[currentPly - 1] : null;
  const displayInCheck = reviewing ? isInCheck(displayPos, displayPos.turn) : inCheck;
  const checkSquare = displayInCheck ? findGeneral(board, displayPos.turn) : -1;

  const legalMoves = reviewing ? [] : game.legalMoves();
  const displaySelected = reviewing ? null : selected;
  const targets =
    displaySelected === null
      ? []
      : legalMoves.filter((m) => m.from === displaySelected).map((m) => m.to);

  function commitMove(move: Move): void {
    const isCapture = game.position.board[move.to] !== EMPTY;
    if (!game.move(move)) return;
    if (soundOnRef.current) playSound(game.inCheck() ? 'check' : isCapture ? 'capture' : 'move');
    setSelected(null);
    bump();
  }

  // Drive the AI on its turn (never while reviewing history). A monotonic token
  // supersedes stale resolutions, so changing difficulty / undoing / starting a
  // new game mid-think can neither apply a stale move nor strand `thinking`.
  useEffect(() => {
    const aiShouldMove = reviewPly === null && aiColor !== null && !finished && turn === aiColor;
    if (!aiShouldMove) {
      setThinking(false);
      return;
    }
    const token = (aiTokenRef.current += 1);
    setThinking(true);
    const fen = game.fen();
    void requestMove(fen, config.difficulty).then((move) => {
      if (aiTokenRef.current !== token) return; // superseded
      setThinking(false);
      if (move && game.fen() === fen) commitMove(move);
    });
    return () => {
      aiTokenRef.current += 1; // invalidate this request
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, reviewPly, aiColor, finished, turn, config.difficulty]);

  function onPointClick(index: number): void {
    if (reviewing || finished || thinking || !humanToMove) return;
    if (selected !== null && targets.includes(index)) {
      commitMove({ from: selected, to: index });
      return;
    }
    const piece = game.position.board[index];
    if (piece !== EMPTY && pieceColor(piece) === turn) setSelected(index);
    else setSelected(null);
  }

  function newGame(next?: Partial<MatchConfig>): void {
    gameRef.current = new Game();
    aiTokenRef.current += 1; // invalidate any in-flight AI request
    if (next) setConfig((c) => ({ ...c, ...next }));
    setSelected(null);
    setThinking(false);
    setReviewPly(null);
    bump();
  }

  function undo(): void {
    if (thinking) return;
    setReviewPly(null);
    game.undo();
    if (aiColor !== null && game.turn() === aiColor) game.undo();
    setSelected(null);
    bump();
  }

  const clampPly = (ply: number): number | null => {
    const n = Math.max(0, Math.min(ply, history.length));
    return n >= history.length ? null : n;
  };

  return {
    board,
    selected: displaySelected,
    targets,
    lastMove,
    checkSquare,
    ply: currentPly,
    turn,
    inCheck,
    result,
    finished,
    thinking,
    config,
    humanToMove,
    soundOn,
    history,
    notation,
    reviewing,
    currentPly,
    onPointClick,
    newGame,
    undo,
    setDifficulty: (difficulty) => setConfig((c) => ({ ...c, difficulty })),
    toggleSound: () => setSoundOn((s) => !s),
    goToPly: (ply) => setReviewPly(clampPly(ply)),
    stepBackward: () => setReviewPly(clampPly(currentPly - 1)),
    stepForward: () => setReviewPly(clampPly(currentPly + 1)),
    toStart: () => setReviewPly(history.length === 0 ? null : 0),
    toLive: () => setReviewPly(null),
  };
}

function reconstruct(moves: readonly Move[], ply: number): Position {
  const pos = initialPosition();
  for (let i = 0; i < ply; i++) makeMove(pos, moves[i]);
  return pos;
}
