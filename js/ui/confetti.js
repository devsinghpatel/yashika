// /js/ui/confetti.js - Celebratory Confetti & Particle Bursts

export function triggerConfetti(options = {}) {
  if (typeof window.confetti === 'function') {
    const defaults = {
      particleCount: 60,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#FF6FB5', '#BE5CA9', '#8B5CF6', '#FD91E3', '#FFD7F0', '#5EEAD4']
    };
    window.confetti({ ...defaults, ...options });
  }
}

export function triggerHeartBurst(x = 0.5, y = 0.5) {
  if (typeof window.confetti === 'function') {
    window.confetti({
      particleCount: 35,
      spread: 60,
      origin: { x, y },
      shapes: ['heart'],
      colors: ['#FF6FB5', '#BE5CA9', '#FFD7F0', '#FD91E3']
    });
  }
}

export function triggerGrandFinaleBlast() {
  if (typeof window.confetti !== 'function') return;

  const duration = 3.5 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    window.confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#FF6FB5', '#8B5CF6', '#FFB085', '#5EEAD4']
    });
    window.confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#FF6FB5', '#8B5CF6', '#FFB085', '#5EEAD4']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}
