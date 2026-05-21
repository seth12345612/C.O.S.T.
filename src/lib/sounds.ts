const SOUNDS_ENABLED_KEY = "cost_sounds_enabled";

// Simple sound generation using Web Audio API (no external files needed)
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* Audio not supported */ }
}

export const SoundEffects = {
  enabled: localStorage.getItem(SOUNDS_ENABLED_KEY) !== "false",

  setEnabled(v: boolean) {
    this.enabled = v;
    localStorage.setItem(SOUNDS_ENABLED_KEY, String(v));
  },

  click() {
    if (!this.enabled) return;
    playTone(800, 0.08, "square", 0.05);
  },

  hover() {
    if (!this.enabled) return;
    playTone(600, 0.04, "sine", 0.02);
  },

  success() {
    if (!this.enabled) return;
    playTone(523, 0.15, "sine", 0.12);
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 100);
    setTimeout(() => playTone(784, 0.2, "sine", 0.12), 200);
  },

  error() {
    if (!this.enabled) return;
    playTone(300, 0.2, "sawtooth", 0.1);
    setTimeout(() => playTone(250, 0.3, "sawtooth", 0.1), 150);
  },

  achievement() {
    if (!this.enabled) return;
    playTone(523, 0.1, "sine", 0.12);
    setTimeout(() => playTone(659, 0.1, "sine", 0.12), 80);
    setTimeout(() => playTone(784, 0.1, "sine", 0.12), 160);
    setTimeout(() => playTone(1047, 0.3, "sine", 0.12), 240);
  },

  gameOver() {
    if (!this.enabled) return;
    playTone(400, 0.3, "sine", 0.1);
    setTimeout(() => playTone(350, 0.3, "sine", 0.1), 200);
    setTimeout(() => playTone(300, 0.5, "sine", 0.1), 400);
  },

  coin() {
    if (!this.enabled) return;
    playTone(1200, 0.06, "sine", 0.08);
    setTimeout(() => playTone(1500, 0.08, "sine", 0.08), 50);
  },

  levelUp() {
    if (!this.enabled) return;
    playTone(440, 0.1, "sine", 0.1);
    setTimeout(() => playTone(554, 0.1, "sine", 0.1), 80);
    setTimeout(() => playTone(659, 0.1, "sine", 0.1), 160);
    setTimeout(() => playTone(880, 0.3, "sine", 0.12), 240);
  },
};
