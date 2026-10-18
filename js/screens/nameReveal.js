// /js/screens/nameReveal.js - Screen 03: Liquid Gooey Name Reveal

import { t, getContent } from '../content.js';
import { playSuccessChime } from '../ui/audio.js';
import { triggerHeartBurst } from '../ui/confetti.js';

export function renderNameReveal(container, onNext) {
  const content = getContent();
  const recipient = content?.recipientName || 'Maya';

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 text-center select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <div class="relative w-full h-full rounded-[2.5rem] bg-gradient-to-b from-[#FFF8F7] via-[#FFF0F0] to-[#FBEAEA] overflow-hidden flex flex-col justify-between p-6 text-center select-none">
          <!-- Top Tag -->
          <div class="pt-4 flex items-center justify-between">
            <span class="px-3 py-1 rounded-full bg-[#F6DAF3] text-[#261627] text-[11px] font-bold tracking-wider" data-key="nameReveal.stepTag">
              ${t('nameReveal.stepTag', 'CHAPTER 01')}
            </span>
            <span class="material-symbols-outlined text-[#963A85] text-[20px]">auto_awesome</span>
          </div>

          <!-- Liquid Gooey Name Center -->
          <div class="relative flex flex-col items-center justify-center my-auto">
            <!-- Pulsing ambient glow backdrops -->
            <div class="absolute w-60 h-60 rounded-full bg-[#FD91E3]/40 blur-3xl -z-10 animate-pulse"></div>

            <!-- Merging Goo Blobs Container -->
            <div class="relative flex items-center justify-center mb-6">
              <div class="w-32 h-32 rounded-full bg-[#963A85]/25 blur-md absolute -left-6 animate-pulse"></div>
              <div class="w-28 h-28 rounded-full bg-[#FFD7F0] blur-md absolute -right-4 animate-pulse"></div>

              <div class="relative px-8 py-4 bg-white/80 backdrop-blur-xl rounded-full shadow-lg flex items-center gap-2 border border-white/90">
                <span class="material-symbols-outlined text-[#963A85] text-[24px]">favorite</span>
                <span id="revealed-recipient" class="font-heading text-[32px] text-[#362436] tracking-tight font-extrabold" data-key="recipientName">
                  ${recipient}
                </span>
                <span class="material-symbols-outlined text-[#963A85] text-[24px]">auto_awesome</span>
              </div>
            </div>

            <span class="px-3.5 py-1 rounded-full bg-[#FFD7F0] text-[#7A206C] text-[11px] font-bold uppercase tracking-wider mb-2" data-key="nameReveal.badge">
              ${t('nameReveal.badge', 'BIRTHDAY QUEEN MODE: UNLOCKED')}
            </span>

            <p class="text-[14px] text-[#4C454A] max-w-[260px] leading-relaxed" data-key="nameReveal.subtitle">
              ${t('nameReveal.subtitle', 'Officially another year hotter and still tolerating me.')}
            </p>

            <div class="mt-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-sm -rotate-2 max-w-[260px] border border-dashed border-[#BE5CA9]/40">
              <p class="font-handwritten text-[22px] text-[#963A85] leading-snug" data-key="nameReveal.handwrittenNote">
                ${t('nameReveal.handwrittenNote', '"No one else I\'d rather send 47 TikToks to at 3 AM."')}
              </p>
            </div>
          </div>

          <!-- Bottom Action Zone -->
          <div class="pb-4 flex flex-col items-center gap-2">
            <button id="name-continue-btn" class="w-full py-3.5 rounded-full bg-gradient-to-r from-[#963A85] to-[#362436] text-white font-bold text-[14px] shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer">
              <span data-key="nameReveal.ctaText">${t('nameReveal.ctaText', 'Continue Journey')}</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <span class="text-[11px] text-[#4C454A]" data-key="nameReveal.hintText">
              ${t('nameReveal.hintText', 'Tap to enter memory archives')}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  const btn = container.querySelector('#name-continue-btn');
  btn.addEventListener('click', () => {
    playSuccessChime();
    triggerHeartBurst(0.5, 0.4);
    if (onNext) onNext();
  });
}
