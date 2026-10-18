// /js/screens/cake.js - Screen 11: Cake & Candles (Microphone Blow Detection + Tap Fallback)

import { t, getContent } from '../content.js';
import { playPopSound, playSuccessChime } from '../ui/audio.js';
import { triggerConfetti } from '../ui/confetti.js';

export function renderCake(container, onNext) {
  const content = getContent();
  const recipient = content?.recipientName || 'Maya';

  let isBlown = false;
  let micStream = null;
  let micAudioCtx = null;
  let micInterval = null;

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <div class="relative w-full h-full rounded-[2.5rem] bg-gradient-to-b from-[#FFF0F0] via-[#FBEAEA] to-[#F5E4E4] overflow-hidden flex flex-col justify-between p-4 select-none">
          <!-- Mic / Tap instruction badge -->
          <div class="pt-4 flex items-center justify-center">
            <div id="cake-mic-badge" class="bg-white/85 backdrop-blur-md rounded-full px-4 py-1.5 shadow-sm flex items-center justify-center gap-1.5 border border-white cursor-pointer hover:bg-white transition-all">
              <span class="text-base animate-pulse">🎙️</span>
              <span class="text-[12px] text-[#362436] font-semibold" data-key="cake.micPrompt">
                ${t('cake.micPrompt', 'Blow into mic (or tap candles) to wish!')}
              </span>
            </div>
          </div>

          <!-- Tiered Birthday Cake Illustration -->
          <div class="relative flex-1 flex flex-col items-center justify-center my-2">
            <!-- Candle Flames Layer -->
            <div id="candles-container" class="flex items-end justify-center gap-4 mb-1 z-20 cursor-pointer">
              <!-- Candle 1 -->
              <div class="candle-wrapper flex flex-col items-center">
                <div class="candle-flame w-3.5 h-6 rounded-full bg-[#FD91E3] shadow-[0_0_12px_#fd91e3] animate-pulse"></div>
                <div class="w-2 h-9 bg-white rounded-t-sm shadow-sm"></div>
              </div>
              <!-- Candle 2 (Center - taller) -->
              <div class="candle-wrapper flex flex-col items-center">
                <div class="candle-flame w-4 h-7 rounded-full bg-[#FD91E3] shadow-[0_0_16px_#fd91e3] animate-bounce"></div>
                <div class="w-2.5 h-12 bg-[#FFD7F0] rounded-t-sm shadow-sm"></div>
              </div>
              <!-- Candle 3 -->
              <div class="candle-wrapper flex flex-col items-center">
                <div class="candle-flame w-3.5 h-6 rounded-full bg-[#FD91E3] shadow-[0_0_12px_#fd91e3] animate-pulse"></div>
                <div class="w-2 h-9 bg-white rounded-t-sm shadow-sm"></div>
              </div>
            </div>

            <!-- Smoke Curls (Visible when blown out) -->
            <div id="candle-smoke" class="hidden absolute top-12 flex justify-center gap-6 text-gray-400 text-lg z-30">
              <span class="animate-ping">💨</span>
              <span class="animate-bounce">💨</span>
              <span class="animate-ping">💨</span>
            </div>

            <!-- Multi-Tier Cake Body -->
            <div class="w-full flex flex-col items-center cursor-pointer" id="cake-body-wrap">
              <!-- Tier 1: Small Top Tier -->
              <div class="w-36 h-12 bg-white rounded-t-2xl shadow-sm flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-x-0 bottom-0 h-2.5 bg-[#FFD7F0]/60"></div>
                <span class="text-xs">🍓 🍓 🍓</span>
              </div>
              <!-- Tier 2: Mid Tier -->
              <div class="w-48 h-16 bg-[#F0B5DF]/40 rounded-t-2xl shadow-sm flex items-center justify-center relative overflow-hidden border-t border-white">
                <div class="absolute inset-x-0 bottom-0 h-3 bg-[#FD91E3]/40"></div>
                <span class="font-handwritten text-[20px] text-[#963A85] font-bold">${recipient}'s Big Day</span>
              </div>
              <!-- Tier 3: Bottom Tier -->
              <div class="w-60 h-20 bg-white rounded-t-3xl shadow-md flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-x-0 bottom-0 h-4 bg-[#FFD7F0]"></div>
                <span class="text-sm">🌸 ✨ 🌸 ✨ 🌸</span>
              </div>
              <!-- Cake Stand -->
              <div class="w-68 h-3.5 bg-[#FD91E3]/60 rounded-full shadow-lg"></div>
              <div class="w-16 h-3.5 bg-[#EFDFDF] rounded-b-lg"></div>
            </div>
          </div>

          <!-- Wish Status Banner -->
          <div id="cake-wish-banner" class="bg-white/90 backdrop-blur-md rounded-2xl p-3 text-center shadow-sm border border-white">
            <span id="cake-state-title" class="text-[10px] font-bold text-[#963A85] uppercase tracking-wider" data-key="cake.stateLit">
              ${t('cake.stateLit', 'STATE: CANDLES LIT & FLICKERING')}
            </span>
            <p id="cake-state-prompt" class="font-heading text-[16px] font-bold text-[#362436] mt-0.5" data-key="cake.promptLit">
              Make a wish, ${recipient}!
            </p>
          </div>

          <!-- Bottom Action -->
          <div class="pt-2">
            <button id="cake-next-btn" class="w-full py-2.5 rounded-full bg-[#963A85] text-white font-bold text-[13px] shadow-md transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer">
              <span data-key="cake.continue">${t('cake.continue', 'Enter Grand Finale →')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const flames = container.querySelectorAll('.candle-flame');
  const smoke = container.querySelector('#candle-smoke');
  const bannerTitle = container.querySelector('#cake-state-title');
  const bannerPrompt = container.querySelector('#cake-state-prompt');
  const nextBtn = container.querySelector('#cake-next-btn');
  const candlesWrap = container.querySelector('#candles-container');
  const cakeWrap = container.querySelector('#cake-body-wrap');
  const micBadge = container.querySelector('#cake-mic-badge');

  function blowOutCandles() {
    if (isBlown) return;
    isBlown = true;

    flames.forEach(f => f.classList.add('hidden'));
    smoke.classList.remove('hidden');

    bannerTitle.innerText = t('cake.stateBlown', 'STATE: CANDLES BLOWN OUT! ✨');
    bannerPrompt.innerText = t('cake.promptBlown', 'Wish registered with the universe! Tap to see the grand finale!');

    playPopSound();
    playSuccessChime();
    triggerConfetti({ particleCount: 70, spread: 80 });

    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
    }
    if (micInterval) clearInterval(micInterval);
  }

  // Tap candles/cake to blow out
  candlesWrap.addEventListener('click', blowOutCandles);
  cakeWrap.addEventListener('click', blowOutCandles);
  micBadge.addEventListener('click', blowOutCandles);

  // Attempt Web Audio Microphone Blow Detection if supported and permitted
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        micStream = stream;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        micAudioCtx = new AudioContext();
        const source = micAudioCtx.createMediaStreamSource(stream);
        const micAnalyser = micAudioCtx.createAnalyser();
        micAnalyser.fftSize = 256;
        source.connect(micAnalyser);

        const dataArray = new Uint8Array(micAnalyser.frequencyBinCount);
        micInterval = setInterval(() => {
          if (isBlown) {
            clearInterval(micInterval);
            return;
          }
          micAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const averageVolume = sum / dataArray.length;

          // Sound threshold for strong breath/blow into mic
          if (averageVolume > 55) {
            blowOutCandles();
          }
        }, 150);
      })
      .catch(() => {
        // Microphone permission denied or unavailable - tap fallback is already active
      });
  }

  nextBtn.addEventListener('click', () => {
    if (!isBlown) blowOutCandles();
    setTimeout(() => {
      if (onNext) onNext();
    }, 400);
  });

  return () => {
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
    }
    if (micInterval) clearInterval(micInterval);
  };
}
