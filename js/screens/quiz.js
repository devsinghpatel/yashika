// /js/screens/quiz.js - Screen 04: Friendship Quiz (Inside-Joke BFF Check)

import { t, getContent } from '../content.js';
import { playSuccessChime, playWrongBuzzer } from '../ui/audio.js';
import { triggerConfetti } from '../ui/confetti.js';

export function renderQuiz(container, onNext) {
  const content = getContent();
  const quizData = content?.quiz || {};
  const questions = quizData.questions || [];
  let currentQIndex = 0;
  let correctCount = 0;

  function renderCurrentQuestion() {
    if (currentQIndex >= questions.length) {
      renderQuizResults();
      return;
    }

    const q = questions[currentQIndex];
    const totalQ = questions.length;
    const progressPercent = Math.round(((currentQIndex + 1) / totalQ) * 100);

    container.innerHTML = `
      <div class="w-full flex-1 flex flex-col items-center justify-center py-4 text-center select-none">
        <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
          <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

          <div id="quiz-phone-body" class="relative w-full h-full rounded-[2.5rem] bg-[#FFF0F0] overflow-hidden flex flex-col justify-between p-6 select-none transition-transform duration-300">
            <!-- Progress & Header -->
            <div class="pt-4 flex flex-col gap-1.5">
              <div class="flex justify-between items-center">
                <span class="text-[11px] font-bold text-[#963A85] uppercase tracking-wider" data-key="quiz.stepTag">
                  ${t('quiz.stepTag', 'BFF INTEL CHECK')}
                </span>
                <span class="px-2.5 py-0.5 rounded-full bg-[#EFDFDF] text-[#362436] text-[11px] font-bold">
                  Q ${currentQIndex + 1} OF ${totalQ}
                </span>
              </div>
              <div class="w-full h-1.5 bg-[#EFDFDF] rounded-full overflow-hidden">
                <div class="h-full bg-[#963A85] rounded-full transition-all duration-300" style="width: ${progressPercent}%;"></div>
              </div>
            </div>

            <!-- Question Card -->
            <div class="my-auto flex flex-col gap-3">
              <div class="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm text-left border border-white">
                <span class="text-[10px] font-bold text-[#4C454A] uppercase tracking-wider" data-key="quiz.caseFileTag">
                  ${t('quiz.caseFileTag', 'Case File #048')}
                </span>
                <h3 class="font-heading text-[20px] font-bold text-[#362436] mt-1 leading-snug" data-key="quiz.questions.${currentQIndex}.q">
                  ${q.q}
                </h3>
              </div>

              <!-- Options -->
              <div class="flex flex-col gap-2">
                ${q.options.map((opt, i) => `
                  <button
                    class="quiz-option-btn group p-3.5 rounded-xl bg-white/80 hover:bg-[#963A85] hover:text-white text-left text-[13px] font-medium text-[#362436] transition-all flex items-center justify-between shadow-sm border border-white cursor-pointer"
                    data-index="${i}"
                  >
                    <span data-key="quiz.questions.${currentQIndex}.options.${i}">${opt}</span>
                    <span class="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">favorite</span>
                  </button>
                `).join('')}
              </div>

              <div id="quiz-feedback" class="font-handwritten text-[20px] text-[#963A85] min-h-[30px] flex items-center justify-center text-center px-2"></div>
            </div>

            <div class="p-2.5 rounded-xl bg-[#EFDFDF] text-center text-[#4C454A] text-[11px] font-bold tracking-wider" data-key="quiz.scoreLabel">
              ${t('quiz.scoreLabel', 'Score: 100% Friend Telepathy')}
            </div>
          </div>
        </div>
      </div>
    `;

    const phoneBody = container.querySelector('#quiz-phone-body');
    const feedback = container.querySelector('#quiz-feedback');
    const optionBtns = container.querySelectorAll('.quiz-option-btn');

    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedIndex = parseInt(btn.getAttribute('data-index'), 10);
        const isRight = selectedIndex === q.answer;

        optionBtns.forEach(b => b.disabled = true);

        if (isRight) {
          correctCount++;
          btn.classList.add('bg-[#963A85]', 'text-white');
          feedback.innerText = q.rightMsg || "Iconic genius behavior! Telepathy score 100% 💖✨";
          feedback.className = 'font-handwritten text-[20px] text-[#963A85] flex items-center justify-center text-center px-2';
          playSuccessChime();
          triggerConfetti();

          setTimeout(() => {
            currentQIndex++;
            renderCurrentQuestion();
          }, 1800);
        } else {
          btn.classList.add('bg-[#FFDAD6]', 'text-[#93000A]');
          feedback.innerText = q.wrongMsg || "Excuse me?! Did you hit your head? Try again babe! 😂";
          feedback.className = 'font-handwritten text-[20px] text-[#BA1A1A] flex items-center justify-center text-center px-2';
          playWrongBuzzer();

          // Dramatic wobbly shake
          phoneBody.style.transform = 'translateX(-12px)';
          setTimeout(() => { phoneBody.style.transform = 'translateX(12px)'; }, 70);
          setTimeout(() => { phoneBody.style.transform = 'translateX(-8px)'; }, 140);
          setTimeout(() => { phoneBody.style.transform = 'translateX(8px)'; }, 210);
          setTimeout(() => { phoneBody.style.transform = 'translateX(0px)'; }, 280);

          setTimeout(() => {
            currentQIndex++;
            renderCurrentQuestion();
          }, 2000);
        }
      });
    });
  }

  function renderQuizResults() {
    const totalQ = questions.length;
    const ratio = totalQ > 0 ? correctCount / totalQ : 1;
    const finalMsgs = quizData.finalMessages || {};
    let finalMsg = finalMsgs.high || "Perfection! 100% Friend Telepathy verified. Soulmate status confirmed! 💖✨";
    if (ratio < 0.5) {
      finalMsg = finalMsgs.low || "Are we sure your sister didn't steal your phone?! Still tolerating you though! 😂";
    } else if (ratio < 0.8) {
      finalMsg = finalMsgs.mid || "Certified bestie status! A few questionable memories, but I still love you! 🥂";
    }

    container.innerHTML = `
      <div class="w-full flex-1 flex flex-col items-center justify-center py-4 text-center select-none">
        <div class="w-full max-w-[380px] h-[720px] rounded-[3rem] bg-[#362436] p-3 shadow-2xl relative flex flex-col overflow-hidden">
          <div class="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black/60 rounded-full z-30"></div>

          <div class="relative w-full h-full rounded-[2.5rem] bg-gradient-to-b from-[#FFF8F7] to-[#FBEAEA] overflow-hidden flex flex-col justify-between p-6 select-none">
            <div class="pt-4 flex justify-between items-center">
              <span class="text-[11px] font-bold text-[#963A85] uppercase tracking-wider">RESULT REPORT</span>
              <span class="px-2.5 py-0.5 rounded-full bg-[#FFD7F0] text-[#3A0033] text-[11px] font-bold">VERIFIED</span>
            </div>

            <div class="my-auto flex flex-col items-center gap-3">
              <div class="w-20 h-20 rounded-full bg-[#FD91E3]/30 flex items-center justify-center text-4xl shadow-md">
                🎉
              </div>
              <h3 class="font-heading text-[26px] font-bold text-[#362436]">
                ${correctCount} / ${totalQ} Correct!
              </h3>
              <p class="font-handwritten text-[22px] text-[#963A85] px-4 leading-relaxed">
                ${finalMsg}
              </p>
            </div>

            <div class="pb-4">
              <button id="quiz-finish-btn" class="w-full py-3.5 rounded-full bg-[#963A85] text-white font-bold text-[14px] shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer">
                <span>Unlock Memory Bubbles</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const btn = container.querySelector('#quiz-finish-btn');
    btn.addEventListener('click', () => {
      playSuccessChime();
      if (onNext) onNext();
    });
  }

  renderCurrentQuestion();
}
