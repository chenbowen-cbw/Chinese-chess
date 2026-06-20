# 中国象棋 Xiangqi

A Chinese Chess game with **PVE** (play vs. an AI) and **PVP** (local hotseat +
online) modes, built in TypeScript and deployable to Vercel.

## Tech stack

- **Language:** TypeScript (shared across UI, AI, and server)
- **Web app:** Next.js (App Router) — _planned_
- **Rendering:** SVG board + DOM pieces — _planned_
- **AI:** alpha-beta search in a Web Worker — _planned_
- **Online play:** Vercel serverless API routes + Vercel KV + a managed realtime
  service (Ably/Pusher), with authoritative move validation on the server — _planned_
- **Tooling:** pnpm workspaces, Vitest, Prettier, GitHub Actions CI

The rules engine is framework-agnostic and is **shared** by the browser, the AI,
and the server, so the server can authoritatively validate every move with the
exact same code that runs on the client.

## Monorepo layout

```
packages/
  engine/    # ✅ Pure rules engine: board, move generation, rules, FEN, perft
  ai/        # ✅ Alpha-beta search + evaluation (depends on engine)
  shared/    # ⏳ Network protocol types, notation
apps/
  web/       # ✅ Next.js front-end — local PVP + PVE, animations, sound, replay
  server/    # ⏳ Serverless API routes for online play
```

## Development

```bash
pnpm install        # install workspace dependencies
pnpm test           # run all tests
pnpm typecheck      # strict TypeScript checks
pnpm format         # format with Prettier
```

## Roadmap

| Phase | Scope                                                    | Status |
| ----- | -------------------------------------------------------- | ------ |
| 0     | Monorepo scaffolding, tooling, CI                        | ✅     |
| 1     | Rules engine (moves, rules, check/mate, FEN, perft)      | ✅     |
| 2     | Local PVP UI (board rendering + interaction)             | ✅     |
| 3     | PVE AI (evaluation + search + Web Worker + difficulties) | ✅     |
| 4     | Online PVP (rooms, matchmaking, sync, reconnect)         | ⏳     |
| 5     | Polish (animations, sound, replay, notation, mobile)     | ✅     |
| 6     | Deploy to Vercel                                         | ⏳     |

## Engine correctness

Move generation is verified against published **perft** node counts for the
initial position (`44 / 1920 / 79666 / 3290240` at depths 1–4), the gold-standard
correctness check for a chess move generator.
