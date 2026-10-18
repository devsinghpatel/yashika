// /js/screens/voice.js - Screen 09: Secret Audio Voice Note with Liquid Waveform

import { t, getContent } from '../content.js';
import { getAudioContext, playChime, playSuccessChime } from '../ui/audio.js';
import { triggerHeartBurst } from '../ui/confetti.js';

export function renderVoice(container, onNext) {
  const content = getContent();
  const voiceData = content?.voice || {};
  const bubbles = voiceData.speechBubbles || [];
  const friendName = content?.friendName || 'Chloe';

  let isPlaying = false;
  let playTimer = null;
  let currentSeconds = 84; // 01:24 initial state as in design
  const totalSeconds = 165; // 02:45

  function formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <div class="relative w-full h-full rounded-[2.5rem] bg-gradient-to-b from-[#FFF0F0] via-[#FFF8F7] to-[#FBEAEA] overflow-hidden flex flex-col justify-between p-4 select-none">
          <!-- Top Sender Card -->
          <div class="pt-4 flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-white">
            <div class="w-11 h-11 rounded-full bg-[#FFD7F0] flex items-center justify-center font-heading text-[18px] text-[#963A85] font-bold">
              ${friendName.charAt(0) || 'C'}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-heading text-[16px] font-bold text-[#362436] leading-tight" data-key="voice.author">${friendName}</div>
              <div class="text-[11px] text-gray-500 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-[#963A85] inline-block animate-pulse"></span>
                <span data-key="voice.memoMeta">${t('voice.memoMeta', 'Voice memo recorded at 2:14 AM')}</span>
              </div>
            </div>
            <span class="material-symbols-outlined text-[#963A85]">mic</span>
          </div>

          <!-- Floating Speech Bubbles -->
          <div class="relative w-full h-20 my-2">
            <div class="absolute top-1 left-2 bg-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1 -rotate-2 border border-white text-[12px] font-medium text-[#362436]">
              <span>${bubbles[0]?.emoji || '😭'}</span>
              <span>${bubbles[0]?.text || '"Wait, don\'t cry yet..."'}</span>
            </div>
            <div class="absolute bottom-1 right-2 bg-[#FFD7F0] text-[#362436] px-3 py-1 rounded-full shadow-sm flex items-center gap-1 rotate-3 text-[12px] font-semibold">
              <span>${bubbles[1]?.emoji || '✨'}</span>
              <span>${bubbles[1]?.text || '"Remember Paris 2023?!"'}</span>
            </div>
          </div>

          <!-- Central Pulsating Waveform Ring & Play Button -->
          <div class="flex flex-col items-center justify-center my-auto relative">
            <div class="absolute w-52 h-52 rounded-full bg-[#FD91E3]/25 blur-2xl animate-pulse"></div>

            <div class="relative w-44 h-44 flex items-center justify-center">
              <svg id="voice-spin-ring" class="absolute inset-0 w-full h-full animate-spin [animation-duration:14s]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#963A85" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.4" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#BE5CA9" stroke-width="2" stroke-dasharray="8 4" />
              </svg>

              <!-- Central Touch Orb Button -->
              <button id="voice-toggle-btn" class="w-24 h-24 rounded-full bg-[#963A85] text-white shadow-xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all z-10 border-none cursor-pointer">
                <span id="voice-play-icon" class="material-symbols-outlined text-[36px]">play_arrow</span>
                <span class="text-[9px] font-bold uppercase text-[#FFD7F0] tracking-wider mt-0.5">TAP ORB</span>
              </button>
            </div>

            <p class="text-[12px] text-gray-600 text-center mt-3 max-w-[220px]" data-key="voice.instruction">
              ${t('voice.instruction', '"Press & hold to hear a very confidential message from your favorite human"')}
            </p>
          </div>

          <!-- Bottom Audio Visualizer Scrubber & Time -->
          <div class="flex flex-col gap-2">
            <div class="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-white flex flex-col gap-1.5">
              <!-- Visualizer Bars -->
              <div id="voice-bars-container" class="flex items-end justify-between h-8 gap-1 px-1">
                <div class="w-1.5 bg-[#963A85] rounded-full h-3"></div>
                <div class="w-1.5 bg-[#963A85] rounded-full h-6"></div>
                <div class="w-1.5 bg-[#963A85] rounded-full h-8"></div>
                <div class="w-1.5 bg-[#963A85] rounded-full h-5"></div>
                <div class="w-1.5 bg-[#BE5CA9] rounded-full h-7 animate-pulse"></div>
                <div class="w-1.5 bg-[#BE5CA9] rounded-full h-8"></div>
                <div class="w-1.5 bg-[#963A85] rounded-full h-6"></div>
                <div class="w-1.5 bg-[#FD91E3] rounded-full h-4"></div>
                <div class="w-1.5 bg-gray-200 rounded-full h-5"></div>
                <div class="w-1.5 bg-gray-200 rounded-full h-3"></div>
                <div class="w-1.5 bg-gray-200 rounded-full h-6"></div>
                <div class="w-1.5 bg-gray-200 rounded-full h-2"></div>
              </div>

              <!-- Time display -->
              <div class="flex justify-between items-center text-[10px] font-bold text-gray-500">
                <span id="voice-current-time">${formatTime(currentSeconds)}</span>
                <span id="voice-status-pill" class="text-[#963A85]">PAUSED</span>
                <span>${formatTime(totalSeconds)}</span>
              </div>
            </div>

            <button id="voice-next-btn" class="w-full py-2.5 rounded-full bg-[#963A85] text-white font-bold text-[13px] shadow-md transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer">
              <span data-key="voice.continue">${t('voice.continue', 'Read Love Letter →')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const toggleBtn = container.querySelector('#voice-toggle-btn');
  const playIcon = container.querySelector('#voice-play-icon');
  const statusPill = container.querySelector('#voice-status-pill');
  const currentTimeLabel = container.querySelector('#voice-current-time');
  const barsContainer = container.querySelector('#voice-bars-container');
  const nextBtn = container.querySelector('#voice-next-btn');

  function togglePlay() {
    isPlaying = !isPlaying;
    getAudioContext();

    if (isPlaying) {
      playIcon.innerText = 'pause';
      statusPill.innerText = 'PLAYING';
      statusPill.className = 'text-[#963A85] font-bold animate-pulse';
      triggerHeartBurst(0.5, 0.5);

      // Play soothing harmonic chimes as synthetic voice simulation
      playTimer = setInterval(() => {
        currentSeconds = (currentSeconds + 1) % totalSeconds;
        currentTimeLabel.innerText = formatTime(currentSeconds);

        const notes = [440, 523.25, 659.25, 587.33];
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        playChime(randomNote, 'sine', 0.6);

        // Animate visualizer bars
        const bars = barsContainer.querySelectorAll('div');
        bars.forEach(bar => {
          const h = Math.floor(Math.random() * 24) + 6;
          bar.style.height = `${h}px`;
        });
      }, 1000);
    } else {
      playIcon.innerText = 'play_arrow';
      statusPill.innerText = 'PAUSED';
      statusPill.className = 'text-gray-500';
      clearInterval(playTimer);
    }
  }

  toggleBtn.addEventListener('click', togglePlay);

  nextBtn.addEventListener('click', () => {
    clearInterval(playTimer);
    playSuccessChime();
    if (onNext) onNext();
  });

  return () => {
    clearInterval(playTimer);
  };
}
