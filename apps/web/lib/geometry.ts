/** Pixel geometry mapping board coordinates to the on-screen SVG/overlay. */

export const CELL = 56;
export const MARGIN = 34;
export const BOARD_W = MARGIN * 2 + 8 * CELL;
export const BOARD_H = MARGIN * 2 + 9 * CELL;

/** Screen x for a file (0 = left). */
export function px(file: number): number {
  return MARGIN + file * CELL;
}

/** Screen y for a rank (0 = Red's back rank, drawn at the bottom). */
export function py(rank: number): number {
  return MARGIN + (9 - rank) * CELL;
}
