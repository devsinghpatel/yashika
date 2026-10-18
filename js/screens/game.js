// /js/screens/game.js - Screen 07: Catch Falling Treats (Arcade Blob Minigame)

import { t, getContent } from '../content.js';
import { playPopSound, playSuccessChime, playWrongBuzzer } from '../ui/audio.js';
import { triggerConfetti } from '../ui/confetti.js';

export function renderGame(container, onNext) {
  const content = getContent();
  const gameData = content?.game || {};
  const targetScore = gameData.targetScore || 500;
  const wishInterval = gameData.wishUnlockInterval || 2;
  const wishLines = gameData.wishLines || [
    "May your iced coffees always be sweet and your skin perpetually glowing.",
    "May you never have to parallel park in front of an outdoor café audience.",
    "May our spontaneous trip ideas always become booked flight confirmations."
  ];

  let score = 0;
  let catchesCount = 0;
  let activeWishIndex = 0;
  let isGameOver = false;

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <div class="relative w-full h-full rounded-[2.5rem] bg-gradient-to-b from-[#FFF0F0] via-[#FFF8F7] to-[#F5E4E4] overflow-hidden flex flex-col justify-between p-4 select-none">
          <!-- Game Header / HUD -->
          <div class="pt-4 flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-white">
            <div>
              <span class="text-[10px] font-bold text-gray-500 uppercase">SCORE</span>
              <div id="game-score-display" class="font-heading text-[20px] font-bold text-[#362436] leading-none">0 pts</div>
            </div>
            <div class="text-right">
              <span id="game-wish-title" class="text-[10px] font-bold text-[#963A85] uppercase tracking-wider">WISH LINE #1</span>
              <p id="game-wish-status" class="text-[11px] text-gray-600">Catch 2 snacks to unlock!</p>
            </div>
          </div>

          <!-- Active Wish Notification Banner -->
          <div id="game-wish-banner" class="hidden bg-[#FFD7F0] p-2.5 rounded-xl border border-[#FD91E3] text-center my-1 animate-pulse">
            <span class="text-[10px] font-bold text-[#7A206C] uppercase">WISH UNLOCKED! ✨</span>
            <p id="game-wish-text" class="font-handwritten text-[18px] text-[#362436] leading-tight mt-0.5"></p>
          </div>

          <!-- Game Canvas / Play Area -->
          <div id="game-playfield" class="relative flex-1 my-2 overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm border border-white shadow-inner">
            <!-- Falling Items Spawn Zone -->
            <div id="game-falling-container" class="absolute inset-0 pointer-events-none"></div>

            <!-- Bottom Liquid Blob Paddle -->
            <div id="game-paddle" class="absolute bottom-3 left-1/2 -translate-x-1/2 w-36 h-10 bg-[#963A85] rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-105 active:scale-95 z-20">
              <div class="w-10 h-1 bg-white/60 rounded-full mb-0.5"></div>
              <span class="material-symbols-outlined text-white text-[18px] ml-1">favorite</span>
            </div>
          </div>

          <!-- Controls Bar -->
          <div class="bg-white/80 rounded-2xl p-2.5 flex items-center justify-between shadow-sm">
            <span class="text-[11px] text-gray-600 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-[#963A85]">swipe</span> Slide paddle to catch snacks!
            </span>
            <button id="btn-manual-catch" class="px-3 py-1 rounded-full bg-[#FD91E3] text-[#7A206C] text-[11px] font-bold hover:bg-[#963A85] hover:text-white transition-all border-none cursor-pointer">
              Catch!
            </button>
          </div>

          <!-- Win Screen Overlay -->
          <div id="game-win-overlay" class="hidden absolute inset-0 bg-[#362436]/95 backdrop-blur-xl z-30 flex-col items-center justify-center p-6 text-center text-white">
            <div class="w-20 h-20 rounded-full bg-[#FD91E3] text-4xl flex items-center justify-center mb-3 animate-bounce shadow-xl">
              🏆
            </div>
            <span class="text-[11px] font-bold text-[#FFD7F0] uppercase tracking-widest mb-1" data-key="game.winTitle">
              ${t('game.winTitle', 'CHALLENGE CLEARED! 🏆')}
            </span>
            <h3 class="font-heading text-[22px] font-bold text-white mb-2 leading-snug" data-key="game.winHeading">
              ${t('game.winHeading', 'You caught all my love (and snacks)!')}
            </h3>
            <p class="font-handwritten text-[20px] text-[#FFD7F0] mb-4" data-key="game.winNote">
              ${t('game.winNote', 'Unlocked Wish #3: Unlimited late-night ramen runs on Chloe\'s tab forever ♡')}
            </p>
            <button id="game-continue-btn" class="w-full py-3 rounded-full bg-[#963A85] text-white font-bold text-[14px] shadow-lg hover:opacity-95 transition-all border-none cursor-pointer">
              <span data-key="game.continue">${t('game.continue', 'Proceed to Scratch Cards →')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const scoreDisplay = container.querySelector('#game-score-display');
  const wishTitle = container.querySelector('#game-wish-title');
  const wishStatus = container.querySelector('#game-wish-status');
  const wishBanner = container.querySelector('#game-wish-banner');
  const wishText = container.querySelector('#game-wish-text');
  const playfield = container.querySelector('#game-playfield');
  const fallingContainer = container.querySelector('#game-falling-container');
  const paddle = container.querySelector('#game-paddle');
  const manualCatchBtn = container.querySelector('#btn-manual-catch');
  const winOverlay = container.querySelector('#game-win-overlay');
  const continueBtn = container.querySelector('#game-continue-btn');

  const snackTypes = [
    { emoji: '🍵', name: 'Matcha', pts: 100 },
    { emoji: '🍜', name: 'Ramen', pts: 150 },
    { emoji: '🐸✨', name: 'Chaos Meme', pts: 200 },
    { emoji: '🐱', name: 'Cat', pts: 150 }
  ];

  function registerCatch(snack) {
    if (isGameOver) return;
    score += snack.pts;
    catchesCount++;
    scoreDisplay.innerText = `${score} pts`;
    playPopSound();

    // Pulse paddle
    paddle.classList.add('scale-110');
    setTimeout(() => paddle.classList.remove('scale-110'), 150);

    // Wish milestone every N catches
    if (catchesCount % wishInterval === 0 && activeWishIndex < wishLines.length) {
      const line = wishLines[activeWishIndex];
      wishTitle.innerText = `WISH LINE #${activeWishIndex + 1}`;
      wishStatus.innerText = "Wish Unlocked! ✨";
      wishText.innerText = `"${line}"`;
      wishBanner.classList.remove('hidden');
      triggerConfetti({ particleCount: 20 });
      playSuccessChime();
      activeWishIndex++;
    }

    if (score >= targetScore) {
      triggerWin();
    }
  }

  function triggerWin() {
    isGameOver = true;
    playSuccessChime();
    triggerConfetti({ particleCount: 100, spread: 80 });
    winOverlay.classList.remove('hidden');
    winOverlay.classList.add('flex');
  }

  // Draggable paddle logic
  let isDragging = false;
  const updatePaddlePosition = (clientX) => {
    const rect = playfield.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(72, Math.min(rect.width - 72, x));
    paddle.style.left = `${clampedX}px`;
  };

  playfield.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePaddlePosition(e.clientX);
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updatePaddlePosition(e.clientX);
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  playfield.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      updatePaddlePosition(e.touches[0].clientX);
    }
  });

  // Spawn visual floating treats
  const spawnTimer = setInterval(() => {
    if (isGameOver || !fallingContainer) return;
    const snack = snackTypes[Math.floor(Math.random() * snackTypes.length)];
    const el = document.createElement('div');
    el.className = 'absolute flex flex-col items-center animate-bounce cursor-pointer pointer-events-auto';
    el.style.left = `${Math.floor(Math.random() * 65) + 15}%`;
    el.style.top = `${Math.floor(Math.random() * 55) + 10}%`;
    el.innerHTML = `
      <span class="text-3xl filter drop-shadow">${snack.emoji}</span>
      <span class="text-[9px] font-bold bg-white/90 text-[#963A85] px-1.5 py-0.5 rounded-full shadow-sm">+${snack.pts}</span>
    `;

    el.addEventListener('click', () => {
      registerCatch(snack);
      el.remove();
    });

    fallingContainer.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, 4500);
  }, 1600);

  manualCatchBtn.addEventListener('click', () => {
    const snack = snackTypes[Math.floor(Math.random() * snackTypes.length)];
    registerCatch(snack);
  });

  continueBtn.addEventListener('click', () => {
    clearInterval(spawnTimer);
    playSuccessChime();
    if (onNext) onNext();
  });

  return () => {
    clearInterval(spawnTimer);
  };
}
