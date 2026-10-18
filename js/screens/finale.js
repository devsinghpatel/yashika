// /js/screens/finale.js - Screen 12: Grand Fireworks Finale & Emergency Capsules

import { t, getContent } from '../content.js';
import { playPopSound, playSuccessChime } from '../ui/audio.js';
import { triggerGrandFinaleBlast, triggerHeartBurst } from '../ui/confetti.js';

export function renderFinale(container, onRestart) {
  const content = getContent();
  const finaleData = content?.finale || {};
  const recipient = content?.recipientName || 'Maya';
  const friendName = content?.friendName || 'Chloe';
  const envelopes = finaleData.envelopes || [];
  const replyLink = finaleData.replyLink || "https://api.whatsapp.com/send?text=Chloe%20you%20are%20insane%20and%20I%20love%20you!%20Best%20birthday%20ever%20%E2%9C%A8";

  // Trigger grand fireworks confetti on arrival
  triggerGrandFinaleBlast();
  playSuccessChime();

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <div class="relative w-full h-full rounded-[2.5rem] bg-gradient-to-b from-[#FFF8F7] via-[#FFF0F0] to-[#FFD7F0]/30 overflow-hidden flex flex-col justify-between p-4 text-center select-none">
          <!-- Floating Balloons / Confetti icons -->
          <div class="absolute top-4 left-6 text-2xl animate-bounce">🎈</div>
          <div class="absolute top-10 right-6 text-3xl animate-pulse">🎉</div>
          <div class="absolute top-20 left-1/2 -translate-x-1/2 text-xl">✨</div>

          <!-- Grand Headline -->
          <div class="flex flex-col gap-1 mt-6 relative z-10">
            <span class="text-[10px] font-bold text-[#963A85] uppercase tracking-widest" data-key="finale.cherishedBadge">
              ${t('finale.cherishedBadge', 'YOU ARE CHERISHED BEYOND WORDS')}
            </span>
            <h2 class="font-heading text-[26px] font-extrabold text-[#362436] leading-tight" data-key="finale.heading">
              Happy Birthday, <span data-key="recipientName">${recipient}</span>!
            </h2>
            <p class="font-handwritten text-[18px] text-[#963A85]" data-key="finale.subheading">
              ${t('finale.subheading', 'The journey never ends — keep these envelopes safe ♡')}
            </p>
          </div>

          <!-- Row of 3 Interactive "Open When..." Envelopes -->
          <div class="flex flex-col gap-2 my-2 relative z-10 text-left">
            <span class="text-[10px] font-bold text-gray-500 uppercase px-1" data-key="finale.capsulesHeading">
              ${t('finale.capsulesHeading', 'Your Emergency Capsules')}
            </span>

            ${envelopes.map((env, idx) => `
              <div
                class="envelope-capsule-item bg-white/95 rounded-2xl p-2.5 shadow-sm flex items-center justify-between hover:bg-white cursor-pointer transition-all border border-white"
                data-id="${env.id}"
                data-index="${idx}"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-full bg-[#FFD7F0] flex items-center justify-center text-xl shadow-inner">
                    ${env.emoji || '💌'}
                  </div>
                  <div>
                    <div class="text-[12px] font-bold text-[#362436]" data-key="finale.envelopes.${idx}.title">${env.title}</div>
                    <div class="text-[10px] text-gray-500" data-key="finale.envelopes.${idx}.subtitle">${env.subtitle}</div>
                  </div>
                </div>
                <span class="material-symbols-outlined text-[#963A85] text-[20px]">mark_email_unread</span>
              </div>
            `).join('')}
          </div>

          <!-- Bottom Actions -->
          <div class="flex flex-col gap-2 relative z-10 pb-2">
            <a
              id="finale-reply-btn"
              href="${replyLink}"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-2.5 rounded-full bg-[#963A85] text-white text-[12px] font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 no-underline"
            >
              <span class="material-symbols-outlined text-[18px]">chat</span>
              <span data-key="finale.replyLabel">${t('finale.replyLabel', 'Send Spicy Voice Reply to Chloe 💌')}</span>
            </a>

            <button
              id="finale-replay-btn"
              class="w-full py-2 rounded-full bg-white text-[#362436] text-[12px] font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-1 border border-white cursor-pointer shadow-sm"
            >
              <span class="material-symbols-outlined text-[16px]">replay</span>
              <span data-key="finale.replayLabel">${t('finale.replayLabel', 'Replay Experience from Start ↺')}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Interactive Envelope Modal Popup -->
      <div id="envelope-modal" class="fixed inset-0 bg-[#362436]/60 backdrop-blur-md z-50 hidden items-center justify-center p-4">
        <div class="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl flex flex-col gap-3 relative animate-in fade-in zoom-in duration-200 text-left">
          <button id="envelope-close-btn" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black border-none cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div class="flex items-center gap-3">
            <span id="modal-emoji" class="text-3xl">💌</span>
            <div>
              <span id="modal-tag" class="text-[10px] font-bold text-[#963A85] uppercase tracking-wider">SEALED NOTE</span>
              <h4 id="modal-title" class="font-heading text-[16px] font-bold text-[#362436] mt-0.5">Title</h4>
            </div>
          </div>

          <div class="bg-[#FFF0F0] rounded-2xl p-4 border border-[#FFD7F0]">
            <p id="modal-body" class="font-handwritten text-[20px] text-[#362436] leading-snug"></p>
          </div>

          <button id="modal-confirm-btn" class="w-full py-2.5 rounded-full bg-[#963A85] text-white font-bold text-[12px] border-none cursor-pointer">
            Keep Safe in Heart Box ♡
          </button>
        </div>
      </div>
    </div>
  `;

  const modal = container.querySelector('#envelope-modal');
  const modalEmoji = container.querySelector('#modal-emoji');
  const modalTag = container.querySelector('#modal-tag');
  const modalTitle = container.querySelector('#modal-title');
  const modalBody = container.querySelector('#modal-body');
  const closeBtn = container.querySelector('#envelope-close-btn');
  const confirmBtn = container.querySelector('#modal-confirm-btn');
  const replayBtn = container.querySelector('#finale-replay-btn');

  function openEnvelope(env) {
    playPopSound();
    triggerHeartBurst(0.5, 0.5);
    modalEmoji.innerText = env.emoji || '💌';
    modalTag.innerText = env.tag || 'EMERGENCY CAPSULE';
    modalTitle.innerText = env.title || 'Sealed Note';
    modalBody.innerText = env.body || '"Always remember how cherished you are!"';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  container.querySelectorAll('.envelope-capsule-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      const env = envelopes[idx];
      if (env) openEnvelope(env);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  confirmBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  replayBtn.addEventListener('click', () => {
    if (onRestart) onRestart();
  });
}
