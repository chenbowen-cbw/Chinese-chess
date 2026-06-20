'use client';

import { Board } from '@/components/Board';
import { BoardFrame } from '@/components/BoardFrame';
import { GamePanel } from '@/components/GamePanel';
import { useMatch } from '@/lib/useMatch';

export default function Page() {
  const match = useMatch();

  return (
    <main className="layout">
      <BoardFrame>
        <Board
          board={match.board}
          selected={match.selected}
          targets={match.targets}
          lastMove={match.lastMove}
          checkSquare={match.checkSquare}
          ply={match.ply}
          disabled={match.thinking || !match.humanToMove || match.reviewing}
          onPointClick={match.onPointClick}
        />
      </BoardFrame>
      <GamePanel
        config={match.config}
        turn={match.turn}
        inCheck={match.inCheck}
        result={match.result}
        thinking={match.thinking}
        soundOn={match.soundOn}
        notation={match.notation}
        reviewing={match.reviewing}
        currentPly={match.currentPly}
        canUndo={match.history.length > 0}
        onNewGame={match.newGame}
        onUndo={match.undo}
        onDifficultyChange={match.setDifficulty}
        onToggleSound={match.toggleSound}
        onGoToPly={match.goToPly}
        onStepBackward={match.stepBackward}
        onStepForward={match.stepForward}
        onToStart={match.toStart}
        onToLive={match.toLive}
      />
    </main>
  );
}
