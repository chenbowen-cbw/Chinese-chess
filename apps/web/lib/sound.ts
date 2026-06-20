'use client';

// Tiny Web Audio "blips" for moves — no audio assets, no network. The context
// is created lazily on the first call (which happens from a user gesture, so
// autoplay policies are satisfied).

export type SoundType = 'move' | 'capture' | 'check';

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  return context;
}

export function playSound(type: SoundType): void {
  const ac = getContext();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();

  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  if (type === 'capture') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
  } else if (type === 'check') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(720, now);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  osc.start(now);
  osc.stop(now + 0.22);
}
