# @xiangqi/engine

A pure-TypeScript Chinese Chess (Xiangqi) rules engine. No dependencies, no side
effects — safe to share between the web UI, the AI (Web Worker), and the server.

## Board geometry

- 9 files × 10 ranks = 90 points; `index = rank * 9 + file`.
- file `0..8` (left→right from Red); rank `0..9` (Red's back rank = 0, Black's = 9).
- Red advances toward higher ranks; the river lies between ranks 4 and 5.

## Quick start

```ts
import { Game, moveToCoord, parseMoveCoord } from '@xiangqi/engine';

const game = new Game(); // standard opening position, Red to move
game.legalMoves(); // => Move[]
game.move(parseMoveCoord('b2e2')); // cannon to the centre file
game.inCheck(); // => boolean
game.result(); // => GameResult
```

## What it implements

- All piece movement with the special rules: hobbled horse leg (蹩马腿),
  blocked elephant eye (塞象眼), cannon screen-capture, soldier crossing the
  river, palace confinement.
- Check detection, the flying-general rule (对脸), checkmate, and stalemate
  (困毙 — a loss for the side to move, per Xiangqi rules).
- FEN parsing/serialization, ICCS coordinate notation, `make`/`unmake`, and
  `perft`.
- A `Game` wrapper with move history, undo, and threefold-repetition draws.

## Public API (selected)

| Export                                           | Purpose                         |
| ------------------------------------------------ | ------------------------------- |
| `Color`, `PieceType`, `Move`, `makePiece`, `sq`  | Core types & geometry           |
| `parseFen`, `toFen`, `initialPosition`           | FEN & setup                     |
| `generateLegalMoves`, `generatePseudoLegalMoves` | Move generation                 |
| `isInCheck`, `isCheckmate`, `isStalemate`        | Legality & terminal detection   |
| `makeMove`, `unmakeMove`                         | Low-level mutation (for search) |
| `perft`, `perftDivide`                           | Move-generation verification    |
| `Game`, `GameResult`, `resultFromPosition`       | High-level game state           |
| `moveToCoord`, `parseMoveCoord`                  | ICCS coordinate notation        |

## Tests

```bash
pnpm -C packages/engine test
```
