import type { ReactElement } from 'react';
import { BOARD_H, BOARD_W, px, py } from '@/lib/geometry';

/** The static board: rank/file lines, the river gap, and the two palaces. */
export function BoardGrid(): ReactElement {
  const lines: ReactElement[] = [];

  // Horizontal rank lines (full width).
  for (let r = 0; r <= 9; r++) {
    lines.push(<line key={`h${r}`} x1={px(0)} y1={py(r)} x2={px(8)} y2={py(r)} />);
  }

  // Vertical file lines. Inner files are broken at the river (ranks 4-5);
  // the two border files run the full height.
  for (let f = 0; f <= 8; f++) {
    if (f === 0 || f === 8) {
      lines.push(<line key={`v${f}`} x1={px(f)} y1={py(0)} x2={px(f)} y2={py(9)} />);
    } else {
      lines.push(<line key={`v${f}a`} x1={px(f)} y1={py(0)} x2={px(f)} y2={py(4)} />);
      lines.push(<line key={`v${f}b`} x1={px(f)} y1={py(5)} x2={px(f)} y2={py(9)} />);
    }
  }

  // Palace diagonals.
  const palace = (r0: number, r1: number, key: string): ReactElement[] => [
    <line key={`${key}1`} x1={px(3)} y1={py(r0)} x2={px(5)} y2={py(r1)} />,
    <line key={`${key}2`} x1={px(5)} y1={py(r0)} x2={px(3)} y2={py(r1)} />,
  ];
  lines.push(...palace(0, 2, 'rp'));
  lines.push(...palace(7, 9, 'bp'));

  return (
    <svg className="grid" width={BOARD_W} height={BOARD_H} viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}>
      <g stroke="#5a3a1a" strokeWidth={1.5} strokeLinecap="round">
        {lines}
      </g>
      <text
        className="river"
        x={BOARD_W / 2}
        y={(py(4) + py(5)) / 2}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        楚 河　　　漢 界
      </text>
    </svg>
  );
}
