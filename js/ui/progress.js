// /js/ui/progress.js - Top Header, Heart Meter, Audio Controls & Easter Egg

import { t, getContent } from '../content.js';
import { isAudioMuted, toggleAudioMute } from './audio.js';
import { showToast } from './toast.js';
import { triggerConfetti } from './confetti.js';

let easterEggTaps = 0;
let lastTapTime = 0;

export function renderHeader(container, currentScreenId, onNavigate) {
  const content = getContent();
  if (!content) return;

  const flow = content.flow || [];
  const currentIndex = flow.indexOf(currentScreenId);
  const totalScreens = flow.length;
  const progressPercent = totalScreens > 1 ? Math.round(((currentIndex + 1) / totalScreens) * 100) : 100;

  const header = document.createElement('header');
  header.className = 'w-full z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] sticky top-0';

  const screenNames = {
    intro: 'Intro',
    gift: 'Dodging Gift',
    nameReveal: 'Liquid Reveal',
    quiz: 'Quiz',
    bubbles: 'Memories',
    gallery: 'Photos',
    videos: 'Videos',
    game: 'Catch Game',
    scratch: 'Scratch Cards',
    voice: 'Audio',
    letter: 'Love Letter',
    cake: 'Cake & Candles',
    finale: 'Grand Finale'
  };

  header.innerHTML = `
    <div class="h-16 md:h-20 w-full px-4 md:px-6 flex items-center justify-between gap-2 md:gap-4 max-w-7xl mx-auto">
      <div class="flex items-center gap-3">
        <button id="logo-easter-egg" class="flex items-center gap-1 text-secondary text-left group bg-transparent border-none cursor-pointer p-0" title="Tap 5 times for a secret!">
          <span class="material-symbols-outlined text-[24px]">cake</span>
          <span class="font-headline-md text-headline-md font-bold text-primary tracking-tight" data-key="common.appName">${t('common.appName', 'BdayCelebration')}</span>
        </button>

        <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full shadow-sm">
          <span class="material-symbols-outlined text-secondary text-[16px]">favorite</span>
          <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" data-key="common.heartMeterLabel">${t('common.heartMeterLabel', 'Heart Meter')}</span>
          <div class="w-16 md:w-24 h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div class="h-full bg-secondary rounded-full transition-all duration-500" style="width: ${progressPercent}%;"></div>
          </div>
          <span class="text-[11px] text-secondary font-bold" id="header-percent">${progressPercent}%</span>
        </div>
      </div>

      <nav class="hidden lg:flex items-center gap-1 overflow-x-auto py-1 px-1 bg-surface-container rounded-full max-w-xl" aria-label="Birthday journey">
        ${flow.map((sId) => {
          const isActive = sId === currentScreenId;
          const label = content.common?.screenNames?.[sId] || screenNames[sId] || sId;
          return `
            <button
              class="px-3 py-1 rounded-full whitespace-nowrap text-[13px] transition-all border-none cursor-pointer ${
                isActive
                  ? 'bg-secondary text-white font-bold shadow-[0_2px_12px_rgba(150,58,133,0.3)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }"
              data-screen="${sId}"
              ${isActive ? 'aria-current="page"' : ''}
            >${label}</button>
          `;
        }).join('')}
      </nav>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1 px-2 py-1 bg-surface-container-low rounded-full">
          <button id="header-audio-toggle" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-secondary border-none bg-transparent cursor-pointer transition-colors" title="${isAudioMuted() ? t('common.soundOn', 'Unmute Audio') : t('common.soundOff', 'Mute Audio')}">
            <span class="material-symbols-outlined text-[20px]">${isAudioMuted() ? 'volume_off' : 'volume_up'}</span>
          </button>
        </div>

        <button id="header-restart-btn" class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-[12px] font-semibold hover:bg-surface-container-high transition-all border-none cursor-pointer">
          <span class="material-symbols-outlined text-[16px]">restart_alt</span>
          <span class="hidden sm:inline" data-key="common.startOver">${t('common.startOver', 'Start Over ↺')}</span>
        </button>

        <a href="?admin" class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white no-underline shadow-sm hover:scale-105 transition-transform" title="Admin CMS">
          <span class="material-symbols-outlined text-[18px]">person</span>
        </a>
      </div>
    </div>
  `;

  // Attach event handlers
  const audioBtn = header.querySelector('#header-audio-toggle');
  audioBtn.addEventListener('click', () => {
    const muted = toggleAudioMute();
    audioBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">${muted ? 'volume_off' : 'volume_up'}</span>`;
    showToast(muted ? 'Audio muted' : 'Audio unmuted 🎵', 'info', 1500);
  });

  const restartBtn = header.querySelector('#header-restart-btn');
  restartBtn.addEventListener('click', () => {
    if (confirm('Start birthday journey from the beginning?')) {
      try {
        localStorage.removeItem('bday_current_screen');
        localStorage.removeItem('bday_popped_bubbles');
        localStorage.removeItem('bday_quiz_score');
      } catch {}
      if (onNavigate) onNavigate(flow[0]);
    }
  });

  header.querySelectorAll('nav button[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-screen');
      if (onNavigate && target) onNavigate(target);
    });
  });

  // Easter Egg: Tap logo 5 times in quick succession
  const easterEggBtn = header.querySelector('#logo-easter-egg');
  easterEggBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastTapTime < 1000) {
      easterEggTaps++;
    } else {
      easterEggTaps = 1;
    }
    lastTapTime = now;

    if (easterEggTaps >= (content.easterEgg?.tapsRequired || 5)) {
      easterEggTaps = 0;
      triggerConfetti();
      showToast(
        `<strong>${t('easterEgg.title', 'SECRET BFF VAULT UNLOCKED! 💖')}</strong><br>${t('easterEgg.message', 'Lifetime voucher for free tacos, iced matcha, and 3 AM therapy sessions.')}`,
        'success',
        6000
      );
    }
  });

  container.innerHTML = '';
  container.appendChild(header);

  const navigation = header.querySelector('nav');
  const activeNavigationItem = navigation?.querySelector('[aria-current="page"]');
  if (navigation && activeNavigationItem) {
    navigation.scrollLeft = activeNavigationItem.offsetLeft -
      (navigation.clientWidth - activeNavigationItem.clientWidth) / 2;
  }
}

export function renderFooter(container) {
  const footer = document.createElement('footer');
  footer.className = 'w-full bg-surface-container-low py-6 shadow-[0_-1px_8px_rgba(0,0,0,0.02)] mt-auto z-20';
  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-secondary text-[20px]">celebration</span>
        <span class="font-handwritten text-[22px] text-secondary" data-key="common.footerNote">${t('common.footerNote', 'Handmade with love for the best birthday ever')}</span>
      </div>
      <div class="flex items-center gap-6">
        <a href="?admin" class="text-[13px] font-semibold text-on-surface-variant hover:text-secondary transition-colors" data-key="common.adminCms">${t('common.adminCms', 'Admin CMS')}</a>
        <span class="text-[11px] font-bold text-on-surface-variant tracking-wider" data-key="common.copyright">${t('common.copyright', '© 2025 CELEBRATION STUDIO')}</span>
      </div>
    </div>
  `;
  container.innerHTML = '';
  container.appendChild(footer);
}
