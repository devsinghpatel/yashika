// /js/ui/audio.js - Web Audio synth engine, background soundtrack & analyser

let audioCtx = null;
let isMuted = true;
let isPlayingMusic = false;
let bgMusicInterval = null;
let masterGain = null;
let analyser = null;

// Read sound preference from localStorage safely
try {
  const savedMuted = localStorage.getItem('bday_audio_muted');
  if (savedMuted !== null) {
    isMuted = savedMuted === 'true';
  }
} catch {}

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;

      masterGain.connect(analyser);
      analyser.connect(audioCtx.destination);
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.45, audioCtx.currentTime);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isAudioMuted() {
  return isMuted;
}

export function toggleAudioMute() {
  isMuted = !isMuted;
  try {
    localStorage.setItem('bday_audio_muted', String(isMuted));
  } catch {}

  const ctx = getAudioContext();
  if (ctx && masterGain) {
    const targetGain = isMuted ? 0 : 0.45;
    masterGain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
  }

  if (!isMuted && !isPlayingMusic) {
    startBackgroundMusic();
  }

  // Dispatch global audio state event
  window.dispatchEvent(new CustomEvent('audioMuteChanged', { detail: { isMuted } }));
  return isMuted;
}

export function getAudioAnalyser() {
  getAudioContext();
  return analyser;
}

/**
 * Plays a pleasant synthesizer chime (pentatonic notes)
 */
export function playChime(freq = 523.25, type = 'sine', duration = 0.8) {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playSuccessChime() {
  playChime(523.25, 'triangle', 0.4); // C5
  setTimeout(() => playChime(659.25, 'triangle', 0.4), 100); // E5
  setTimeout(() => playChime(783.99, 'triangle', 0.6), 200); // G5
  setTimeout(() => playChime(1046.50, 'sine', 0.9), 300); // C6
}

export function playPopSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

export function playWrongBuzzer() {
  playChime(180, 'sawtooth', 0.25);
  setTimeout(() => playChime(140, 'sawtooth', 0.35), 120);
}

/**
 * Generates continuous dreamy ambient synth arpeggios
 */
export function startBackgroundMusic() {
  if (isPlayingMusic) return;
  isPlayingMusic = true;

  const notes = [261.63, 329.63, 392.00, 523.25, 587.33, 659.25, 783.99]; // C major pentatonic
  let index = 0;

  bgMusicInterval = setInterval(() => {
    if (isMuted) return;
    const freq = notes[index % notes.length];
    playChime(freq, 'sine', 1.8);
    index = (index + Math.floor(Math.random() * 3) + 1) % notes.length;
  }, 1200);
}

export function stopBackgroundMusic() {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
  isPlayingMusic = false;
}
