// /js/screens/scratch.js - Screen 08: Scratch-Off Golden Tickets & Hidden Truths

import { t, getContent } from '../content.js';
import { playPopSound, playSuccessChime } from '../ui/audio.js';
import { triggerConfetti } from '../ui/confetti.js';

export function renderScratch(container, onNext) {
  const content = getContent();
  const scratchData = content?.scratch || {};
  const cards = scratchData.cards || [];
  let unlockedCount = 0;

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <div class="relative w-full h-full rounded-[2.5rem] bg-[#FFF0F0] overflow-hidden flex flex-col justify-between p-4 select-none">
          <!-- Header -->
          <div class="pt-4 flex flex-col gap-1">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-[#963A85] uppercase tracking-wider" data-key="scratch.stepTag">
                ${t('scratch.stepTag', 'SCREEN 08 • FOIL TICKETS')}
              </span>
              <span id="scratch-counter" class="text-[10px] font-bold text-[#963A85]">
                0 of ${cards.length} Unlocked
              </span>
            </div>
            <h3 class="font-heading text-[18px] font-bold text-[#362436] leading-tight" data-key="scratch.title">
              ${t('scratch.title', 'Scratch for 8 Real Truths')}
            </h3>
            <p class="text-[11px] text-gray-600" data-key="scratch.subtitle">
              ${t('scratch.subtitle', 'Tap or drag across holographic foil to reveal Chloe\'s secrets.')}
            </p>
          </div>

          <!-- 2x3 or 2x4 Scrollable Grid of Scratch Cards -->
          <div class="grid grid-cols-2 gap-2 my-2 overflow-y-auto max-h-[460px] pr-1">
            ${cards.map((card, idx) => `
              <div class="scratch-card-item relative bg-white rounded-xl p-2.5 shadow-sm flex flex-col justify-between overflow-hidden min-h-[110px] border border-white cursor-pointer group" data-index="${idx}">
                <!-- Underneath Revealed Content -->
                <div class="flex items-center justify-between">
                  <span class="text-[9px] font-bold text-[#963A85] uppercase" data-key="scratch.cards.${idx}.title">${card.title}</span>
                  <span class="material-symbols-outlined text-[14px] text-[#963A85]">done_all</span>
                </div>
                <p class="text-[11px] text-[#362436] font-medium leading-snug my-1" data-key="scratch.cards.${idx}.text">${card.text}</p>
                <span class="font-handwritten text-[14px] text-[#963A85]" data-key="scratch.cards.${idx}.tag">${card.tag}</span>

                <!-- Scratch Foil Overlay -->
                <div class="scratch-foil-layer absolute inset-0 bg-gradient-to-br from-[#E6D6D6] via-[#EFDFDF] to-[#FFF8F7] flex flex-col items-center justify-center text-center p-2 transition-all duration-300 z-10">
                  <span class="material-symbols-outlined text-[#963A85] text-[22px] mb-0.5">grain</span>
                  <span class="text-[9px] font-bold text-[#4D3A4D] uppercase">SCRATCH TO REVEAL</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Bottom Actions -->
          <div class="pt-1 flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-gray-500" data-key="scratch.helper">${t('scratch.helper', 'Tap cards to uncover')}</span>
              <button id="btn-reveal-all-scratch" class="font-bold text-[#963A85] hover:underline bg-transparent border-none cursor-pointer">
                ${t('scratch.revealAll', 'Reveal All')}
              </button>
            </div>

            <button id="scratch-continue-btn" class="w-full py-2.5 rounded-full bg-[#963A85] text-white font-bold text-[13px] shadow-md transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer">
              <span data-key="scratch.continue">${t('scratch.continue', 'Listen to Voice Note →')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const counter = container.querySelector('#scratch-counter');
  const cardItems = container.querySelectorAll('.scratch-card-item');
  const revealAllBtn = container.querySelector('#btn-reveal-all-scratch');
  const continueBtn = container.querySelector('#scratch-continue-btn');

  function revealSingleCard(cardEl) {
    const foil = cardEl.querySelector('.scratch-foil-layer');
    if (foil && !foil.classList.contains('opacity-0')) {
      foil.classList.add('opacity-0', 'pointer-events-none');
      unlockedCount++;
      playPopSound();
      counter.innerText = `${unlockedCount} of ${cards.length} Unlocked`;
      if (unlockedCount === cards.length) {
        triggerConfetti({ particleCount: 30 });
        playSuccessChime();
      }
    }
  }

  cardItems.forEach(cardEl => {
    cardEl.addEventListener('click', () => revealSingleCard(cardEl));
  });

  revealAllBtn.addEventListener('click', () => {
    cardItems.forEach(cardEl => {
      const foil = cardEl.querySelector('.scratch-foil-layer');
      if (foil) foil.classList.add('opacity-0', 'pointer-events-none');
    });
    unlockedCount = cards.length;
    counter.innerText = `${unlockedCount} of ${cards.length} Unlocked`;
    playSuccessChime();
    triggerConfetti();
  });

  continueBtn.addEventListener('click', () => {
    playSuccessChime();
    if (onNext) onNext();
  });
}
