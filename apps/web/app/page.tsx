'use client';

import { Board } from '@/components/Board';
import { GamePanel } from '@/components/GamePanel';
import { useXiangqiGame } from '@/lib/useXiangqiGame';

export default function Page() {
  const game = useXiangqiGame();

  return (
    <main className="layout">
      <Board
        board={game.board}
        selected={game.selected}
        targets={game.targets}
        lastMove={game.lastMove}
        checkSquare={game.checkSquare}
        onPointClick={game.onPointClick}
      />
      <GamePanel
        turn={game.turn}
        inCheck={game.inCheck}
        result={game.result}
        history={game.history}
        canUndo={game.history.length > 0}
        onReset={game.reset}
        onUndo={game.undo}
      />
    </main>
  );
}
