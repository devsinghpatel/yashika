// /js/screens/gallery.js - Screen 06: 3D Liquid Polaroid Scrapbook (Three.js + Ripple Shader)

import { t, getContent } from '../content.js';
import { playPopSound, playSuccessChime } from '../ui/audio.js';
import { triggerHeartBurst } from '../ui/confetti.js';

let renderer = null;
let animationFrameId = null;

export function renderGallery(container, onNext) {
  const content = getContent();
  const galleryData = content?.gallery || {};
  const items = galleryData.items || [];
  const chapters = galleryData.chapters || ["Chapter 1: How We Met", "Chapter 2: The Chaos Years", "Chapter 3: Lately"];
  const minRequired = galleryData.minimumViewedRequired || 4;

  let activeChapter = chapters[0];
  let focusedItem = items[0] || null;
  const viewedItems = new Set([items[0]?.id]);

  container.innerHTML = `
    <div class="w-full flex-1 flex flex-col items-center justify-center py-4 select-none">
      <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
        <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

        <div class="relative w-full h-full rounded-[2.5rem] bg-[#FFF0F0] overflow-hidden flex flex-col justify-between p-4 select-none">
          <!-- Top Chapter & Status -->
          <div class="pt-4 flex justify-between items-center px-1">
            <span class="px-2.5 py-0.5 rounded-full bg-[#FFD7F0] text-[#7A206C] text-[10px] font-bold uppercase tracking-wider" data-key="gallery.stepTag">
              ${t('gallery.stepTag', 'THE SCRAPBOOK')}
            </span>
            <div class="flex items-center gap-1.5" id="chapter-dots">
              ${chapters.map((ch, idx) => `
                <button
                  class="chapter-pill-btn px-2 py-0.5 rounded-full text-[9px] font-bold transition-all border-none cursor-pointer ${
                    ch === activeChapter ? 'bg-[#963A85] text-white' : 'bg-white/80 text-gray-600'
                  }"
                  data-chapter="${ch}"
                >Ch.${idx + 1}</button>
              `).join('')}
            </div>
          </div>

          <!-- 3D WebGL Canvas or 2D Interactive Polaroid Viewer -->
          <div class="relative w-full h-[410px] my-auto overflow-hidden rounded-2xl flex flex-col items-center justify-center">
            <!-- 3D Three.js Container -->
            <div id="three-gallery-canvas" class="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"></div>

            <!-- Focused Polaroid Card Overlay -->
            <div id="polaroid-focus-card" class="relative z-10 w-[270px] bg-white rounded-2xl p-3 shadow-2xl transform transition-all duration-300 -rotate-2 hover:rotate-0 hover:scale-[1.02]">
              <div class="w-full h-52 rounded-xl overflow-hidden bg-gray-100 relative shadow-inner">
                ${focusedItem?.type === 'video' ? `
                  <video id="card-video" src="${focusedItem.src}" poster="${focusedItem.poster || ''}" playsinline loop muted autoplay class="w-full h-full object-cover"></video>
                ` : `
                  <img id="card-image" src="${focusedItem?.src || ''}" alt="${focusedItem?.title || ''}" class="w-full h-full object-cover">
                `}
                <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white rounded-full text-[9px] backdrop-blur-sm">
                  <span id="card-date">${focusedItem?.date || 'JULY 2022'}</span>
                </div>
              </div>

              <div class="pt-2.5 pb-1 flex flex-col text-left">
                <div class="flex items-center justify-between">
                  <h4 id="card-title" class="font-heading text-[13px] font-bold text-[#362436] truncate max-w-[170px]">
                    ${focusedItem?.title || 'Our Memory'}
                  </h4>
                  <span class="text-[9px] font-bold text-[#963A85]">UNFILTERED</span>
                </div>
                <p id="card-caption" class="font-handwritten text-[18px] text-[#362436] mt-1 leading-snug min-h-[44px]">
                  ${focusedItem?.caption || '“The exact day you convinced me bad decisions make good stories.”'}
                </p>
              </div>
            </div>

            <!-- Swipe helper overlay -->
            <div class="absolute bottom-1 inset-x-0 text-center pointer-events-none z-20">
              <span class="text-[10px] font-semibold text-gray-500 bg-white/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
                Swipe / Tap card to shuffle memories
              </span>
            </div>
          </div>

          <!-- Bottom Emoji Reaction Bar & Continue Button -->
          <div class="flex flex-col gap-2 pb-1">
            <div class="flex items-center justify-around bg-white/90 backdrop-blur-md py-2 px-3 rounded-full shadow-sm">
              <button id="rx-heart" class="rx-btn flex items-center gap-1 text-[#963A85] text-[12px] font-bold border-none bg-transparent cursor-pointer hover:scale-125 transition-transform">
                <span class="material-symbols-outlined text-[18px]">favorite</span>
                <span id="rx-count-heart">${focusedItem?.likes || 24}</span>
              </button>
              <button id="rx-laugh" class="rx-btn flex items-center gap-1 text-[#362436] text-[12px] font-bold border-none bg-transparent cursor-pointer hover:scale-125 transition-transform">
                <span class="material-symbols-outlined text-[18px]">sentiment_very_satisfied</span>
                <span id="rx-count-laugh">${focusedItem?.laughs || 18}</span>
              </button>
              <button id="rx-fire" class="rx-btn flex items-center gap-1 text-[#362436] text-[12px] font-bold border-none bg-transparent cursor-pointer hover:scale-125 transition-transform">
                <span class="material-symbols-outlined text-[18px]">local_fire_department</span>
                <span id="rx-count-fire">${focusedItem?.fires || 31}</span>
              </button>
              <button id="rx-sparkle" class="rx-btn flex items-center gap-1 text-[#BE5CA9] text-[12px] font-bold border-none bg-transparent cursor-pointer hover:scale-125 transition-transform">
                <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
              </button>
            </div>

            <div class="flex items-center justify-between px-1">
              <span id="gallery-counter-label" class="text-[11px] font-bold text-[#4C454A]">
                Viewed: ${viewedItems.size} / ${minRequired} min
              </span>
              <button id="gallery-continue-btn" class="px-4 py-2 rounded-full bg-[#963A85] text-white text-[12px] font-bold shadow-md transition-all flex items-center gap-1 border-none cursor-pointer ${viewedItems.size >= minRequired ? '' : 'opacity-60'}">
                <span data-key="gallery.continueButton">${t('gallery.continueButton', 'Continue to Game →')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const canvasContainer = container.querySelector('#three-gallery-canvas');
  const card = container.querySelector('#polaroid-focus-card');
  const cardTitle = container.querySelector('#card-title');
  const cardCaption = container.querySelector('#card-caption');
  const cardDate = container.querySelector('#card-date');
  const counterLabel = container.querySelector('#gallery-counter-label');
  const continueBtn = container.querySelector('#gallery-continue-btn');

  let currentItemIndex = 0;

  function setFocusedItem(idx) {
    if (items.length === 0) return;
    currentItemIndex = (idx + items.length) % items.length;
    focusedItem = items[currentItemIndex];
    viewedItems.add(focusedItem.id);

    // Update Card UI
    cardTitle.innerText = focusedItem.title;
    cardCaption.innerText = focusedItem.caption;
    cardDate.innerText = focusedItem.date;

    const mediaWrap = card.querySelector('.w-full.h-52');
    if (focusedItem.type === 'video') {
      mediaWrap.innerHTML = `
        <video src="${focusedItem.src}" poster="${focusedItem.poster || ''}" playsinline loop muted autoplay class="w-full h-full object-cover"></video>
        <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white rounded-full text-[9px] backdrop-blur-sm">
          <span>${focusedItem.date}</span>
        </div>
      `;
    } else {
      mediaWrap.innerHTML = `
        <img src="${focusedItem.src}" alt="${focusedItem.title}" class="w-full h-full object-cover">
        <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white rounded-full text-[9px] backdrop-blur-sm">
          <span>${focusedItem.date}</span>
        </div>
      `;
    }

    container.querySelector('#rx-count-heart').innerText = focusedItem.likes || 24;
    container.querySelector('#rx-count-laugh').innerText = focusedItem.laughs || 18;
    container.querySelector('#rx-count-fire').innerText = focusedItem.fires || 31;

    counterLabel.innerText = `Viewed: ${viewedItems.size} / ${minRequired} min`;
    if (viewedItems.size >= minRequired) {
      continueBtn.classList.remove('opacity-60');
    }

    playPopSound();
  }

  // Card click cycles to next item
  card.addEventListener('click', () => {
    setFocusedItem(currentItemIndex + 1);
  });

  // Chapter buttons filter
  container.querySelectorAll('.chapter-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ch = btn.getAttribute('data-chapter');
      activeChapter = ch;
      container.querySelectorAll('.chapter-pill-btn').forEach(b => {
        if (b.getAttribute('data-chapter') === ch) {
          b.className = 'chapter-pill-btn px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#963A85] text-white border-none cursor-pointer';
        } else {
          b.className = 'chapter-pill-btn px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/80 text-gray-600 border-none cursor-pointer';
        }
      });
      const firstInChapter = items.findIndex(it => it.chapter === ch);
      if (firstInChapter !== -1) {
        setFocusedItem(firstInChapter);
      }
    });
  });

  // Reactions
  container.querySelector('#rx-heart').addEventListener('click', (e) => {
    e.stopPropagation();
    focusedItem.likes = (focusedItem.likes || 24) + 1;
    container.querySelector('#rx-count-heart').innerText = focusedItem.likes;
    triggerHeartBurst(0.5, 0.6);
  });
  container.querySelector('#rx-laugh').addEventListener('click', (e) => {
    e.stopPropagation();
    focusedItem.laughs = (focusedItem.laughs || 18) + 1;
    container.querySelector('#rx-count-laugh').innerText = focusedItem.laughs;
    playPopSound();
  });
  container.querySelector('#rx-fire').addEventListener('click', (e) => {
    e.stopPropagation();
    focusedItem.fires = (focusedItem.fires || 31) + 1;
    container.querySelector('#rx-count-fire').innerText = focusedItem.fires;
    playSuccessChime();
  });
  container.querySelector('#rx-sparkle').addEventListener('click', (e) => {
    e.stopPropagation();
    triggerHeartBurst(0.5, 0.5);
  });

  // Continue
  continueBtn.addEventListener('click', () => {
    playSuccessChime();
    if (onNext) onNext();
  });

  // Initialize Three.js 3D Floating Particles & Orbiting Plane mesh
  if (typeof window.THREE !== 'undefined' && canvasContainer) {
    try {
      const width = canvasContainer.clientWidth || 300;
      const height = canvasContainer.clientHeight || 400;

      const scene = new window.THREE.Scene();
      const camera = new window.THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 5;

      renderer = new window.THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      canvasContainer.appendChild(renderer.domElement);

      // Ambient floating particles
      const particleGeo = new window.THREE.BufferGeometry();
      const count = 40;
      const posArray = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 6;
      }
      particleGeo.setAttribute('position', new window.THREE.BufferAttribute(posArray, 3));
      const particleMat = new window.THREE.PointsMaterial({
        size: 0.08,
        color: 0xFD91E3,
        transparent: true,
        opacity: 0.6
      });
      const particleMesh = new window.THREE.Points(particleGeo, particleMat);
      scene.add(particleMesh);

      // Subtle touch drag rotation
      let isDragging = false;
      let prevX = 0;
      canvasContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevX = e.clientX;
      });
      window.addEventListener('mouseup', () => { isDragging = false; });
      canvasContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevX;
        particleMesh.rotation.y += deltaX * 0.005;
        prevX = e.clientX;
      });

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        particleMesh.rotation.y += 0.002;
        particleMesh.rotation.x += 0.001;
        renderer.render(scene, camera);
      };
      animate();
    } catch (e) {
      console.warn('Three.js initialization notice:', e);
    }
  }

  return () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
  };
}
