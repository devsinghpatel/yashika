// /js/screens/intro.js - Screen 01: Ambient Gate & Whisper Prelude

import { t } from '../content.js';
import { getAudioContext, playChime } from '../ui/audio.js';
import { triggerHeartBurst } from '../ui/confetti.js';

export function renderIntro(container, onNext) {
  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 text-center select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <!-- Dynamic Island / Speaker notch -->
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <!-- Phone Screen Inside -->
        <div class="relative w-full h-full rounded-[2.5rem] bg-[#441B3D] overflow-hidden flex flex-col items-center justify-between p-6 text-center select-none cursor-pointer">
          <!-- Top bar inside phone -->
          <div class="w-full flex justify-between items-center z-20 pt-4">
            <span class="text-[11px] font-bold text-[#FFD7F0]" data-key="intro.timeLabel">${t('intro.timeLabel', '23:59')}</span>
            <div class="flex items-center gap-1 text-[#FFD7F0]">
              <span class="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
              <span class="material-symbols-outlined text-[16px]">wifi</span>
              <span class="material-symbols-outlined text-[16px]">battery_full</span>
            </div>
          </div>

          <!-- Restricted VIP Header -->
          <div class="relative z-20 flex flex-col items-center gap-2 mt-4">
            <span class="px-3 py-1 rounded-full bg-white/10 text-[#FFD7F0] text-[11px] font-bold uppercase tracking-wider backdrop-blur-md" data-key="intro.restrictedBadge">
              ${t('intro.restrictedBadge', 'RESTRICTED VIP ONLY')}
            </span>
            <h2 class="font-heading text-[26px] font-bold text-[#FFF8F7] tracking-tight" data-key="intro.headline">
              ${t('intro.headline', 'Psst, is anyone looking?')}
            </h2>
            <p class="text-[13px] text-[#F0B5DF] max-w-xs" data-key="intro.subheading">
              ${t('intro.subheading', 'A clandestine, whisper-toned prelude just for your eyes.')}
            </p>
          </div>

          <!-- Pulsating Central Orb -->
          <div class="relative w-64 h-64 flex items-center justify-center z-20 my-auto">
            <div id="intro-glow" class="absolute inset-0 rounded-full bg-[#FD91E3]/25 blur-2xl animate-pulse"></div>
            <div id="intro-ring" class="absolute w-48 h-48 rounded-full bg-[#963A85]/20 animate-ping"></div>
            <div class="absolute w-36 h-36 rounded-full bg-[#FD91E3]/35 blur-md"></div>
            <button id="intro-orb" class="w-24 h-24 rounded-full bg-gradient-to-tr from-[#963A85] via-[#FD91E3] to-[#FFD7F0] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 border-none cursor-pointer z-30" aria-label="Unlock birthday experience">
              <span class="material-symbols-outlined text-[40px] text-[#362436]">fingerprint</span>
            </button>
          </div>

          <!-- Whispers & Hint -->
          <div class="relative z-20 flex flex-col items-center gap-2 pb-6">
            <p id="intro-caption" class="text-[13px] font-medium text-[#F6DAF3] transition-colors" data-key="intro.caption">
              ${t('intro.caption', "tap to make sure nobody's watching...")}
            </p>
            <span class="font-handwritten text-[22px] text-[#F0B5DF]" data-key="intro.whisperQuote">
              ${t('intro.whisperQuote', '"I swear if your sister is reading this..."')}
            </span>
            <span class="text-[11px] text-white/50 mt-1" data-key="intro.hint">
              ${t('intro.hint', 'Tap directly on the pulsating violet orb to start your journey')}
            </span>
          </div>

          <!-- Ambient blur lights -->
          <div class="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#963A85]/30 blur-3xl pointer-events-none"></div>
          <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#FD91E3]/20 blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  `;

  const orb = container.querySelector('#intro-orb');
  const caption = container.querySelector('#intro-caption');
  const glow = container.querySelector('#intro-glow');
  let unlocked = false;

  const handleUnlock = () => {
    if (unlocked) return;
    unlocked = true;

    // Initialize Web Audio on user gesture
    getAudioContext();
    playChime(659.25, 'triangle', 0.8);
    triggerHeartBurst(0.5, 0.5);

    orb.classList.add('scale-125', 'rotate-45');
    glow.classList.remove('bg-[#FD91E3]/25');
    glow.classList.add('bg-[#963A85]', 'scale-150');
    caption.innerText = t('intro.accessGranted', "ACCESS GRANTED. Verifying you're the hottest human alive... ✨");
    caption.classList.add('text-[#FFD7F0]');

    setTimeout(() => {
      if (onNext) onNext();
    }, 1400);
  };

  orb.addEventListener('click', handleUnlock);
}
