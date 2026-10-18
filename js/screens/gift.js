// /js/screens/gift.js - Screen 02: The Dodging Gift Button (Anti-Clicker)

import { t, getContent } from '../content.js';
import { playPopSound, playSuccessChime } from '../ui/audio.js';
import { triggerConfetti } from '../ui/confetti.js';

export function renderGift(container, onNext) {
  const content = getContent();
  const giftData = content?.gift || {};
  const maxDodges = giftData.maxDodges || 4;
  const taunts = giftData.taunts || [
    "Too slow babe ;P",
    "Almost had it!",
    "Gotta be quicker than that!",
    "Nope! Not yet!",
    "Are your fingers asleep?!"
  ];

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 text-center select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <!-- Phone notch -->
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <!-- Phone screen inside -->
        <div class="relative w-full h-full rounded-[2.5rem] bg-[#FFF0F0] overflow-hidden flex flex-col justify-between p-6 select-none">
          <div class="flex justify-between items-center pt-4">
            <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" data-key="gift.stepTag">
              ${t('gift.stepTag', 'STAGE 02 / 12')}
            </span>
            <span class="px-2.5 py-0.5 rounded-full bg-[#FFD7F0] text-[#3A0033] text-[11px] font-bold" data-key="gift.trollBadge">
              ${t('gift.trollBadge', 'Troll Level: MAX')}
            </span>
          </div>

          <div class="flex flex-col items-center text-center gap-1 my-auto">
            <div class="w-16 h-16 rounded-full bg-[#FD91E3]/30 flex items-center justify-center text-[#963A85] mb-2 shadow-sm">
              <span class="material-symbols-outlined text-[32px]">featured_seasonal_and_gifts</span>
            </div>
            <h3 class="font-heading text-[24px] font-bold text-[#362436]" data-key="gift.title">
              ${t('gift.title', 'Careful now...')}
            </h3>
            <p class="text-[13px] text-[#4C454A] max-w-xs leading-relaxed" data-key="gift.subtitle">
              ${t('gift.subtitle', "You didn't think opening your main birthday gift was going to be that easy, did you babe?")}
            </p>
          </div>

          <!-- Interactive Playground Area -->
          <div id="gift-playground" class="relative w-full h-72 flex items-center justify-center overflow-hidden bg-white/60 rounded-2xl backdrop-blur-md p-4 border border-white/80 shadow-inner">
            <!-- Teasing Speech Bubble -->
            <div id="gift-bubble" class="absolute top-4 left-4 bg-[#362436] text-white px-3 py-1 rounded-full font-handwritten text-[18px] shadow-md transition-all duration-300">
              ${taunts[0]}
            </div>

            <!-- Evasive Dodger Button -->
            <button id="gift-dodger" class="relative z-10 px-6 py-3.5 rounded-full bg-[#963A85] text-white font-bold text-[14px] shadow-lg transition-transform duration-200 flex items-center gap-2 border-none cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">lock_open</span>
              <span data-key="gift.ctaText">${t('gift.ctaText', 'Open your surprise')}</span>
            </button>

            <!-- Caught & Melt Blob Overlay -->
            <div id="gift-melt" class="hidden absolute inset-0 flex flex-col items-center justify-center bg-[#FFD7F0]/95 backdrop-blur-md p-4 text-center rounded-2xl z-20">
              <span class="material-symbols-outlined text-[#963A85] text-[52px] animate-bounce">favorite</span>
              <h4 class="font-heading text-[22px] font-bold text-[#362436]" data-key="gift.caughtTitle">
                ${t('gift.caughtTitle', 'CAUGHT IT!')}
              </h4>
              <p class="font-handwritten text-[22px] text-[#963A85] mt-1" data-key="gift.caughtSubtitle">
                ${t('gift.caughtSubtitle', 'Melting into your VIP portal... ✨')}
              </p>
            </div>
          </div>

          <div class="flex justify-between items-center text-[#4C454A] text-[11px] font-bold pb-2">
            <span>
              <span data-key="gift.attemptLabel">${t('gift.attemptLabel', 'Attempt meter:')}</span>
              <strong id="gift-attempts" class="text-[#963A85] ml-1">0 misses</strong>
            </span>
            <span id="gift-patience" data-key="gift.patienceLabel">${t('gift.patienceLabel', 'Patience: 98%')}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const dodger = container.querySelector('#gift-dodger');
  const bubble = container.querySelector('#gift-bubble');
  const attempts = container.querySelector('#gift-attempts');
  const patience = container.querySelector('#gift-patience');
  const melt = container.querySelector('#gift-melt');

  let missCount = 0;
  let caught = false;

  const dodgeOffsets = [
    { x: -55, y: -45 },
    { x: 50, y: 35 },
    { x: -45, y: 40 },
    { x: 45, y: -40 },
    { x: -25, y: -30 },
    { x: 30, y: 25 }
  ];

  function dodge() {
    if (caught) return;
    if (missCount >= maxDodges) {
      catchGift();
      return;
    }

    missCount++;
    playPopSound();
    attempts.innerText = `${missCount} misses`;
    const pVal = Math.max(10, 98 - missCount * 18);
    patience.innerText = `Patience: ${pVal}%`;

    const offset = dodgeOffsets[(missCount - 1) % dodgeOffsets.length];
    dodger.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
    bubble.innerText = taunts[missCount % taunts.length];
  }

  function catchGift() {
    if (caught) return;
    caught = true;

    playSuccessChime();
    triggerConfetti();
    melt.classList.remove('hidden');

    setTimeout(() => {
      if (onNext) onNext();
    }, 1800);
  }

  dodger.addEventListener('mouseenter', dodge);
  dodger.addEventListener('touchstart', (e) => {
    if (missCount < maxDodges) {
      e.preventDefault();
      dodge();
    }
  });
  dodger.addEventListener('click', () => {
    if (missCount >= maxDodges) {
      catchGift();
    } else {
      dodge();
    }
  });
}
