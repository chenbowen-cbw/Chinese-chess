'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Difficulty } from '@xiangqi/ai';
import type { Move } from '@xiangqi/engine';
import type { AiResponse } from './aiWorker';

/**
 * Owns a single AI Web Worker and exposes a promise-based `requestMove`.
 * Requests are matched to responses by an incrementing id.
 */
export function useAiWorker(): (fen: string, difficulty: Difficulty) => Promise<Move | null> {
  const workerRef = useRef<Worker | null>(null);
  const seqRef = useRef(0);
  const pendingRef = useRef(new Map<number, (move: Move | null) => void>());

  useEffect(() => {
    const worker = new Worker(new URL('./aiWorker.ts', import.meta.url));
    worker.onmessage = (event: MessageEvent<AiResponse>) => {
      const { id, from, to } = event.data;
      const resolve = pendingRef.current.get(id);
      if (resolve) {
        pendingRef.current.delete(id);
        resolve(from < 0 ? null : { from, to });
      }
    };
    workerRef.current = worker;
    const pending = pendingRef.current;
    return () => {
      worker.terminate();
      workerRef.current = null;
      // Settle any in-flight requests so their promises never hang.
      for (const resolve of pending.values()) resolve(null);
      pending.clear();
    };
  }, []);

  return useCallback((fen: string, difficulty: Difficulty) => {
    return new Promise<Move | null>((resolve) => {
      const worker = workerRef.current;
      if (!worker) {
        resolve(null);
        return;
      }
      const id = (seqRef.current += 1);
      pendingRef.current.set(id, resolve);
      worker.postMessage({ id, fen, difficulty });
    });
  }, []);
}
