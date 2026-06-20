'use client';

import { useReducer, useRef, useState } from 'react';
import {
  Color,
  EMPTY,
  findGeneral,
  Game,
  GameResult,
  type Move,
  pieceColor,
} from '@xiangqi/engine';

export interface XiangqiGameState {
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
  onPointClick: (index: number) => void;
  reset: () => void;
  undo: () => void;
}

/**
 * React binding around the engine's {@link Game}. The mutable Game lives in a
 * ref; a counter forces re-render after each mutation, and selection state is
 * tracked separately for click-to-move interaction.
 */
export function useXiangqiGame(): XiangqiGameState {
  const gameRef = useRef<Game | null>(null);
  if (gameRef.current === null) gameRef.current = new Game();
  const game = gameRef.current;

  const [, bump] = useReducer((c: number) => c + 1, 0);
  const [selected, setSelected] = useState<number | null>(null);

  const board = game.position.board;
  const turn = game.turn();
  const legalMoves = game.legalMoves();
  const targets =
    selected === null ? [] : legalMoves.filter((m) => m.from === selected).map((m) => m.to);
  const result = game.result();
  const finished = result !== GameResult.Ongoing;
  const inCheck = game.inCheck();
  const checkSquare = inCheck ? findGeneral(board, turn) : -1;
  const history = game.history();
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  function onPointClick(index: number): void {
    if (finished) return;
    if (selected !== null && targets.includes(index)) {
      game.move({ from: selected, to: index });
      setSelected(null);
      bump();
      return;
    }
    const piece = board[index];
    if (piece !== EMPTY && pieceColor(piece) === turn) {
      setSelected(index);
    } else {
      setSelected(null);
    }
  }

  function reset(): void {
    gameRef.current = new Game();
    setSelected(null);
    bump();
  }

  function undo(): void {
    game.undo();
    setSelected(null);
    bump();
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
    onPointClick,
    reset,
    undo,
  };
}
