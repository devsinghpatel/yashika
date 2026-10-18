// /test/logic.test.ts - Unit tests for decoupled birthday experience logic
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveContentKey,
  evaluateQuizTier,
  calculateProgress,
  checkGameWin,
  isScratchComplete,
  filterActiveScreens
} from '../js/logic.js';

test('resolveContentKey resolves deep nested keys with fallback', () => {
  const sample = {
    theme: { primary: '#362436' },
    quiz: { questions: [{ q: 'Tacos?' }] }
  };

  assert.equal(resolveContentKey(sample, 'theme.primary'), '#362436');
  assert.equal(resolveContentKey(sample, 'quiz.questions.0.q'), 'Tacos?');
  assert.equal(resolveContentKey(sample, 'quiz.nonexistent', 'fallback'), 'fallback');
  assert.equal(resolveContentKey(null, 'any.key', 'def'), 'def');
});

test('evaluateQuizTier returns appropriate score band', () => {
  assert.equal(evaluateQuizTier(5, 5), 'high');
  assert.equal(evaluateQuizTier(4, 5), 'high'); // 80%
  assert.equal(evaluateQuizTier(3, 5), 'mid'); // 60%
  assert.equal(evaluateQuizTier(2, 5), 'low'); // 40%
  assert.equal(evaluateQuizTier(0, 5), 'low');
});

test('calculateProgress computes accurate integer percentages', () => {
  assert.equal(calculateProgress(0, 12), 8); // 1/12 ≈ 8%
  assert.equal(calculateProgress(5, 12), 50); // 6/12 = 50%
  assert.equal(calculateProgress(11, 12), 100); // 12/12 = 100%
  assert.equal(calculateProgress(0, 1), 100);
});

test('checkGameWin triggers at target threshold', () => {
  assert.equal(checkGameWin(500, 500), true);
  assert.equal(checkGameWin(550, 500), true);
  assert.equal(checkGameWin(450, 500), false);
});

test('isScratchComplete triggers at 60% threshold', () => {
  assert.equal(isScratchComplete(5, 8, 0.6), true); // 62.5%
  assert.equal(isScratchComplete(4, 8, 0.6), false); // 50%
  assert.equal(isScratchComplete(8, 8, 0.6), true);
});

test('filterActiveScreens preserves valid order and drops skipped screens', () => {
  const all = ['intro', 'gift', 'quiz', 'gallery'];
  const flow = ['gift', 'quiz'];
  assert.deepEqual(filterActiveScreens(all, flow), ['gift', 'quiz']);
});
