// Twin Town — Spot the Difference: tiny synthesized sound effects.
//
// No audio files: every sound is a few WebAudio oscillators, so the game ships
// zero bytes of audio and never touches the network. The context is created on
// the first user gesture (browsers block audio before that).

let ctx = null;
let muted = false;

export function ensureAudio() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
export function isMuted() {
  return muted;
}

function tone(freq, at, dur, type, vol) {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + at);
  osc.stop(ctx.currentTime + at + dur + 0.05);
}

export const sfx = {
  // Two-note chime for a found difference.
  found() {
    tone(880, 0, 0.16, 'sine', 0.22);
    tone(1318, 0.09, 0.22, 'sine', 0.22);
  },
  // Low buzz for a wrong click.
  wrong() {
    tone(160, 0, 0.18, 'sawtooth', 0.12);
    tone(110, 0.05, 0.2, 'sawtooth', 0.1);
  },
  // Soft blip for a button press.
  click() {
    tone(660, 0, 0.07, 'triangle', 0.15);
  },
  // Little rising arpeggio for a finished scene.
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.2));
  },
  // Hint shimmer.
  hint() {
    tone(1568, 0, 0.12, 'sine', 0.12);
    tone(2093, 0.08, 0.16, 'sine', 0.1);
  },
};
