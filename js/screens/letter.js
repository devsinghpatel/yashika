// /js/screens/letter.js - Screen 10: The Unapologetic Love Letter (Ink Typewriter)

import { t, getContent } from '../content.js';
import { playSuccessChime } from '../ui/audio.js';
import { triggerHeartBurst } from '../ui/confetti.js';

export function renderLetter(container, onNext) {
  const content = getContent();
  const letterData = content?.letter || {};
  const recipient = content?.recipientName || 'Maya';
  const friendName = content?.friendName || 'Chloe';
  const paragraphs = letterData.paragraphs || [
    "Life with you is pure unfiltered cinematic chaos — and I wouldn't trade a single second for the quietest sanity on earth.",
    "Thank you for being the person who answers FaceTime calls while brushing teeth, who shares fries without an eye-roll, and who celebrates every tiny win like an Olympic gold medal.",
    "You make every single room warmer just by existing in it. Here is to another year of being completely, unapologetically unhinged together."
  ];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <div class="relative w-full h-full rounded-[2.5rem] bg-[#FFF0F0] overflow-hidden flex flex-col justify-between p-4 select-none">
          <!-- Top Header Stamp -->
          <div class="pt-4 flex items-center justify-between pb-1 border-b border-[#EFDFDF]">
            <div>
              <span class="text-[10px] font-bold text-[#963A85] uppercase tracking-widest" data-key="letter.stepTag">
                ${t('letter.stepTag', 'SCREEN 10 • PRIVATE CORRESPONDENCE')}
              </span>
              <div class="text-[11px] text-gray-500" data-key="letter.postmark">
                ${t('letter.postmark', 'Postmarked: Today & Always')}
              </div>
            </div>
            <div class="w-9 h-11 bg-[#FFD7F0] rounded-lg border-2 border-dashed border-[#963A85]/40 flex items-center justify-center rotate-6 shadow-sm">
              <span class="material-symbols-outlined text-[#963A85] text-[18px]">local_post_office</span>
            </div>
          </div>

          <!-- Frosted Glass Parchment -->
          <div class="relative flex-1 my-2 bg-white/85 backdrop-blur-md rounded-2xl p-4 shadow-sm overflow-y-auto flex flex-col justify-between border border-white">
            <!-- Watermark Background -->
            <div class="absolute -right-4 top-1/4 text-[#FFD7F0]/40 select-none pointer-events-none">
              <span class="material-symbols-outlined text-[130px]">favorite</span>
            </div>

            <!-- Typed Body -->
            <div class="relative z-10 flex flex-col gap-2.5 text-left">
              <h3 class="font-heading text-[18px] font-bold text-[#362436]">
                Dear <span data-key="recipientName">${recipient}</span>,
              </h3>

              <div id="typewriter-body" class="flex flex-col gap-2 text-[12px] text-[#221A1A] leading-relaxed">
                <!-- Injected via script or instantly -->
              </div>
            </div>

            <!-- Handwritten Signature -->
            <div class="relative z-10 pt-3 mt-2 text-left">
              <div class="font-handwritten text-[18px] text-[#963A85] -rotate-1" data-key="letter.signoff">
                ${t('letter.signoff', 'Forever your ride-or-die,')}
              </div>
              <div class="font-handwritten text-[28px] text-[#362436] font-bold leading-tight" data-key="letter.signature">
                ${friendName} ♡
              </div>
            </div>
          </div>

          <!-- P.S. Sticky Note Attached -->
          <div class="bg-[#FFD7F0] text-[#3A0033] p-2.5 rounded-xl shadow-sm rotate-1 flex items-center justify-between border border-[#FD91E3]/50">
            <span class="font-handwritten text-[16px] font-bold" data-key="letter.psNote">
              ${t('letter.psNote', 'P.S. Yes, we are ordering spicy noodles tonight! 🥢')}
            </span>
          </div>

          <!-- Continue Button -->
          <div class="pt-2">
            <button id="letter-next-btn" class="w-full py-2.5 rounded-full bg-[#963A85] text-white font-bold text-[13px] shadow-md transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer">
              <span data-key="letter.continue">${t('letter.continue', 'Proceed to the Cake →')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const typewriterContainer = container.querySelector('#typewriter-body');
  const nextBtn = container.querySelector('#letter-next-btn');

  if (prefersReducedMotion) {
    // Show instantly
    typewriterContainer.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
  } else {
    // Animate typewriter ink effect
    let pIdx = 0;
    let charIdx = 0;
    const currentParagraphs = paragraphs.map(() => '');

    const renderText = () => {
      typewriterContainer.innerHTML = currentParagraphs.map(p => `<p>${p}</p>`).join('');
    };

    const typeTimer = setInterval(() => {
      if (pIdx >= paragraphs.length) {
        clearInterval(typeTimer);
        return;
      }

      currentParagraphs[pIdx] += paragraphs[pIdx][charIdx];
      renderText();
      charIdx++;

      if (charIdx >= paragraphs[pIdx].length) {
        pIdx++;
        charIdx = 0;
      }
    }, 18);
  }

  nextBtn.addEventListener('click', () => {
    playSuccessChime();
    triggerHeartBurst(0.5, 0.4);
    if (onNext) onNext();
  });
}
