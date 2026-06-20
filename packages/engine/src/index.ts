/**
 * @xiangqi/engine — a pure-TypeScript Chinese Chess rules engine.
 *
 * Framework-agnostic and side-effect free, so it can be shared by the web UI,
 * the AI (running in a Web Worker), and the server (for authoritative move
 * validation).
 */

export * from './types';
export * from './board';
export * from './fen';
export * from './moves';
export * from './rules';
export * from './game';
export * from './perft';
export * from './notation';
export * from './chineseNotation';
