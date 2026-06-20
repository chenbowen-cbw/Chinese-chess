'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { BOARD_H, BOARD_W } from '@/lib/geometry';

/**
 * Scales the fixed-size board down to fit the available width (for phones and
 * narrow columns) while reserving the correct layout space.
 */
export function BoardFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / BOARD_W));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="board-frame" style={{ height: BOARD_H * scale }}>
      <div
        style={{
          width: BOARD_W,
          height: BOARD_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}
