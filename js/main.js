// /js/main.js - Boot, flow engine, router, and screen lifecycle

import { loadContent, getContent, onContentChange } from './content.js';
import { initGooFilter } from './ui/goo.js';
import { renderHeader, renderFooter } from './ui/progress.js';
import { showToast } from './ui/toast.js';
import { initAdmin } from './admin.js';

// Screen Modules
import { renderIntro } from './screens/intro.js';
import { renderGift } from './screens/gift.js';
import { renderNameReveal } from './screens/nameReveal.js';
import { renderQuiz } from './screens/quiz.js';
import { renderBubbles } from './screens/bubbles.js';
import { renderAudioGallery, renderPhotoGallery, renderVideoGallery } from './screens/media.js';
import { renderGame } from './screens/game.js';
import { renderScratch } from './screens/scratch.js';
import { renderLetter } from './screens/letter.js';
import { renderCake } from './screens/cake.js';
import { renderFinale } from './screens/finale.js';

const screenRenderers = {
  intro: renderIntro,
  gift: renderGift,
  nameReveal: renderNameReveal,
  quiz: renderQuiz,
  bubbles: renderBubbles,
  gallery: renderPhotoGallery,
  videos: renderVideoGallery,
  game: renderGame,
  scratch: renderScratch,
  voice: renderAudioGallery,
  letter: renderLetter,
  cake: renderCake,
  finale: renderFinale
};

let currentScreenId = null;
let currentCleanup = null;

async function bootstrap() {
  initGooFilter();

  try {
    await loadContent();
  } catch (err) {
    console.error('Failed to initialize content:', err);
    showToast('Failed to load content.json. Please check file.', 'error', 5000);
    return;
  }

  const content = getContent();
  const flow = content.flow || ['intro'];

  // Check saved screen or autostart query parameter
  const urlParams = new URLSearchParams(window.location.search);
  let initialScreen = flow[0];

  if (urlParams.get('autostart') === '1') {
    initialScreen = flow[0];
  } else {
    try {
      const savedScreen = localStorage.getItem('bday_current_screen');
      if (savedScreen && flow.includes(savedScreen)) {
        initialScreen = savedScreen;
      }
    } catch {}
  }

  // Handle URL hash routing if present (#screen-name)
  const hash = window.location.hash.replace('#', '');
  if (hash && flow.includes(hash)) {
    initialScreen = hash;
  }

  navigateToScreen(initialScreen);

  // Initialize admin mode if requested
  initAdmin(() => {
    // Re-render current screen on config change
    navigateToScreen(currentScreenId);
  });

  // Global visibilitychange listener to pause work when tab is backgrounded
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.body.classList.add('tab-paused');
    } else {
      document.body.classList.remove('tab-paused');
    }
  });

  // Hashchange listener for manual navigation
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '');
    if (newHash && flow.includes(newHash) && newHash !== currentScreenId) {
      navigateToScreen(newHash);
    }
  });
}

export function navigateToScreen(screenId) {
  const content = getContent();
  const flow = content.flow || ['intro'];

  // If requested screen is not in flow, default to first in flow
  if (!flow.includes(screenId)) {
    screenId = flow[0];
  }

  // Run cleanup of previous screen (e.g. Three.js renderer disposal, timers, streams)
  if (typeof currentCleanup === 'function') {
    try {
      currentCleanup();
    } catch (e) {
      console.warn('Cleanup error:', e);
    }
    currentCleanup = null;
  }

  currentScreenId = screenId;
  try {
    localStorage.setItem('bday_current_screen', screenId);
  } catch {}

  // Update URL hash without reload
  if (window.location.hash !== `#${screenId}`) {
    history.replaceState(null, '', `#${screenId}${window.location.search}`);
  }

  // Render Header
  const headerContainer = document.getElementById('header-root');
  if (headerContainer) {
    renderHeader(headerContainer, currentScreenId, (targetId) => {
      navigateToScreen(targetId);
    });
  }

  // Render Current Screen
  const mainContainer = document.getElementById('screen-root');
  if (!mainContainer) return;

  const renderer = screenRenderers[screenId];
  if (typeof renderer === 'function') {
    const nextScreenIndex = flow.indexOf(screenId) + 1;
    const nextScreenId = flow[nextScreenIndex] || flow[0];

    const onNext = () => {
      navigateToScreen(nextScreenId);
    };

    const onRestart = () => {
      try {
        localStorage.removeItem('bday_current_screen');
        localStorage.removeItem('bday_popped_bubbles');
      } catch {}
      navigateToScreen(flow[0]);
    };

    // Transition smoothly
    mainContainer.style.opacity = '0';
    mainContainer.style.transform = 'translateY(8px)';
    mainContainer.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

    setTimeout(() => {
      mainContainer.innerHTML = '';
      currentCleanup = renderer(mainContainer, screenId === 'finale' ? onRestart : onNext);

      requestAnimationFrame(() => {
        mainContainer.style.opacity = '1';
        mainContainer.style.transform = 'translateY(0)';
      });
    }, 200);
  } else {
    mainContainer.innerHTML = `
      <div class="p-8 text-center">
        <p class="text-red-500 font-bold">Screen renderer not found for: ${screenId}</p>
        <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-full">Reload</button>
      </div>
    `;
  }

  // Render Footer
  const footerContainer = document.getElementById('footer-root');
  if (footerContainer) {
    renderFooter(footerContainer);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Start app once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
