'use client';

import { Board } from '@/components/Board';
import { GamePanel } from '@/components/GamePanel';
import { useMatch } from '@/lib/useMatch';

export default function Page() {
  const match = useMatch();

  return (
    <main className="layout">
      <Board
        board={match.board}
        selected={match.selected}
        targets={match.targets}
        lastMove={match.lastMove}
        checkSquare={match.checkSquare}
        disabled={match.thinking || !match.humanToMove}
        onPointClick={match.onPointClick}
      />
      <GamePanel
        config={match.config}
        turn={match.turn}
        inCheck={match.inCheck}
        result={match.result}
        thinking={match.thinking}
        history={match.history}
        canUndo={match.history.length > 0}
        onNewGame={match.newGame}
        onUndo={match.undo}
        onDifficultyChange={match.setDifficulty}
      />
    </main>
  );
}
