// /js/screens/bubbles.js - Screen 05: Memory Bubbles (Tactile 10 Pop Journey)

import { t, getContent } from '../content.js';
import { playPopSound, playSuccessChime } from '../ui/audio.js';
import { triggerConfetti } from '../ui/confetti.js';

export function renderBubbles(container, onNext) {
  const content = getContent();
  const bubblesData = content?.bubbles || {};
  const items = bubblesData.items || [];
  const friendName = content?.friendName || 'Chloe';

  let poppedIds = new Set();
  try {
    const saved = localStorage.getItem('bday_popped_bubbles');
    if (saved) {
      poppedIds = new Set(JSON.parse(saved));
    }
  } catch {}

  const positions = [
    { top: '6%', left: '8%', size: 'w-16 h-16', bg: 'bg-[#FD91E3]/40 text-[#963A85]' },
    { top: '10%', right: '10%', size: 'w-20 h-20', bg: 'bg-[#FFD7F0]/60 text-[#362436]' },
    { top: '24%', left: '26%', size: 'w-16 h-16', bg: 'bg-[#FFD7F1]/60 text-[#362436]' },
    { top: '30%', right: '14%', size: 'w-18 h-18', bg: 'bg-[#FD91E3]/50 text-[#963A85]' },
    { top: '44%', left: '8%', size: 'w-18 h-18', bg: 'bg-[#F0B5DF]/60 text-[#362436]' },
    { top: '48%', right: '28%', size: 'w-16 h-16', bg: 'bg-[#F6DAF3]/60 text-[#362436]' },
    { top: '62%', left: '22%', size: 'w-20 h-20', bg: 'bg-[#FFD7F0]/60 text-[#963A85]' },
    { top: '66%', right: '8%', size: 'w-16 h-16', bg: 'bg-[#FD91E3]/40 text-[#362436]' },
    { top: '78%', left: '10%', size: 'w-16 h-16', bg: 'bg-[#D9BFD6]/60 text-[#362436]' },
    { top: '80%', right: '24%', size: 'w-18 h-18', bg: 'bg-[#FFD7F0]/60 text-[#963A85]' }
  ];

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 text-center select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <div class="relative w-full h-full rounded-[2.5rem] bg-[#FFF0F0] overflow-hidden flex flex-col justify-between p-4 select-none">
          <!-- Top Status Bar -->
          <div class="pt-4 flex justify-between items-center px-2">
            <span class="text-[11px] font-bold text-[#4C454A] uppercase tracking-wider">Tap bubbles to pop!</span>
            <span class="px-2.5 py-0.5 rounded-full bg-[#FFD7F0] text-[#7A206C] text-[10px] font-bold">Haptic: Crisp</span>
          </div>

          <!-- Bubble Float Canvas Area -->
          <div id="bubbles-field" class="relative w-full h-[470px] overflow-hidden my-auto rounded-2xl bg-white/40 backdrop-blur-md border border-white/60">
            ${items.map((item, index) => {
              const pos = positions[index % positions.length];
              const isPopped = poppedIds.has(item.id);
              const posStyle = `top: ${pos.top}; ${pos.left ? `left: ${pos.left};` : `right: ${pos.right};`}`;
              return `
                <div
                  class="bubble-sphere absolute ${pos.size} rounded-full ${pos.bg} backdrop-blur-md border border-white/70 flex flex-col items-center justify-center shadow-md cursor-pointer hover:scale-110 active:scale-90 transition-all ${isPopped ? 'opacity-0 pointer-events-none scale-150' : ''}"
                  style="${posStyle}"
                  data-id="${item.id}"
                >
                  <span class="material-symbols-outlined text-[20px]">${item.icon || 'favorite'}</span>
                  <span class="text-[9px] font-bold leading-none mt-0.5">${item.label}</span>
                </div>
              `;
            }).join('')}

            <!-- Bottom Revealed Memory Card -->
            <div id="bubble-revealed-card" class="absolute inset-x-3 bottom-3 p-3.5 rounded-xl bg-white/95 backdrop-blur-xl shadow-lg border border-white flex flex-col gap-1 transition-all z-20 text-left">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-[#963A85] uppercase tracking-wider">BURST MEMORY UNLOCKED</span>
                <span class="material-symbols-outlined text-[#963A85] text-[16px]">celebration</span>
              </div>
              <p id="revealed-memory-text" class="text-[12px] text-[#362436] font-medium leading-snug">
                "Remember when we got stuck in the elevator for 40 mins and ordered delivery to the 3rd floor shaft?!"
              </p>
              <span class="font-handwritten text-[18px] text-[#963A85] text-right">- ${friendName}</span>
            </div>
          </div>

          <!-- Controls & Counter -->
          <div class="flex flex-col gap-1.5 px-2 pb-1">
            <div class="flex items-center justify-between">
              <span id="bubble-count-text" class="text-[11px] font-bold text-[#963A85]">
                ${poppedIds.size} / ${items.length} ${t('bubbles.counterSuffix', 'Explored')}
              </span>
              <div class="flex items-center gap-2">
                <button id="btn-pop-all" class="text-[10px] font-bold text-[#963A85] hover:underline bg-transparent border-none cursor-pointer">
                  ${t('bubbles.popAllButton', 'Pop All')}
                </button>
                <span class="text-gray-300">•</span>
                <button id="btn-reset-bubbles" class="text-[10px] font-bold text-gray-500 hover:underline bg-transparent border-none cursor-pointer">
                  ${t('bubbles.resetButton', 'Reset')}
                </button>
              </div>
            </div>

            <div class="w-full h-1.5 bg-[#EFDFDF] rounded-full overflow-hidden">
              <div id="bubble-progress-bar" class="h-full bg-[#963A85] rounded-full transition-all duration-300" style="width: ${items.length ? (poppedIds.size / items.length) * 100 : 0}%;"></div>
            </div>

            <button id="bubble-next-btn" class="w-full py-2.5 mt-1 rounded-full bg-[#963A85] text-white font-bold text-[13px] shadow-md transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer ${poppedIds.size >= Math.min(3, items.length) ? '' : 'opacity-60'}">
              <span>Enter 3D Polaroid Gallery</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const field = container.querySelector('#bubbles-field');
  const countText = container.querySelector('#bubble-count-text');
  const progressBar = container.querySelector('#bubble-progress-bar');
  const memoryText = container.querySelector('#revealed-memory-text');
  const nextBtn = container.querySelector('#bubble-next-btn');

  function updateState() {
    const total = items.length;
    const current = poppedIds.size;
    countText.innerText = `${current} / ${total} ${t('bubbles.counterSuffix', 'Explored')}`;
    progressBar.style.width = `${(current / total) * 100}%`;

    try {
      localStorage.setItem('bday_popped_bubbles', JSON.stringify([...poppedIds]));
    } catch {}

    if (current >= total) {
      triggerConfetti();
      playSuccessChime();
      memoryText.innerText = t('bubbles.unlockMessage', 'All 10 memories liberated! The 3D polaroid scrapbook is ready to explore.');
    }

    if (current >= Math.min(3, total)) {
      nextBtn.classList.remove('opacity-60');
    }
  }

  container.querySelectorAll('.bubble-sphere').forEach(bubble => {
    bubble.addEventListener('click', () => {
      const id = parseInt(bubble.getAttribute('data-id'), 10);
      if (!poppedIds.has(id)) {
        poppedIds.add(id);
        bubble.classList.add('opacity-0', 'pointer-events-none', 'scale-150');
        playPopSound();

        const match = items.find(it => it.id === id);
        if (match) {
          memoryText.innerText = `"${match.memory}"`;
        }

        updateState();
      }
    });
  });

  container.querySelector('#btn-pop-all').addEventListener('click', () => {
    items.forEach(it => poppedIds.add(it.id));
    container.querySelectorAll('.bubble-sphere').forEach(b => b.classList.add('opacity-0', 'pointer-events-none', 'scale-150'));
    updateState();
  });

  container.querySelector('#btn-reset-bubbles').addEventListener('click', () => {
    poppedIds.clear();
    container.querySelectorAll('.bubble-sphere').forEach(b => b.classList.remove('opacity-0', 'pointer-events-none', 'scale-150'));
    updateState();
  });

  nextBtn.addEventListener('click', () => {
    playSuccessChime();
    if (onNext) onNext();
  });
}
