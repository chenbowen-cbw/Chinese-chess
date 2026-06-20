/// <reference lib="webworker" />

// Web Worker entry point: runs the AI search off the main thread so the board
// stays responsive while the computer "thinks".

import { parseFen } from '@xiangqi/engine';
import { chooseMove, type Difficulty } from '@xiangqi/ai';

export interface AiRequest {
  id: number;
  fen: string;
  difficulty: Difficulty;
}

export interface AiResponse {
  id: number;
  from: number;
  to: number; // from === -1 means "no move"
}

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (event: MessageEvent<AiRequest>) => {
  const { id, fen, difficulty } = event.data;
  const position = parseFen(fen);
  const { move } = chooseMove(position, { difficulty });
  const response: AiResponse = move
    ? { id, from: move.from, to: move.to }
    : { id, from: -1, to: -1 };
  ctx.postMessage(response);
};
