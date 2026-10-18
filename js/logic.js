// /js/logic.js - Pure decoupled business logic for birthday experience

export function resolveContentKey(content, path, fallback = '') {
  if (!content || !path) return fallback;
  const parts = path.split('.');
  let current = content;

  for (const part of parts) {
    if (current === null || current === undefined) return fallback;
    current = current[part];
  }

  if (current === undefined || current === null) return fallback;
  return current;
}

export function evaluateQuizTier(correctCount, totalCount) {
  if (totalCount <= 0) return 'high';
  const ratio = correctCount / totalCount;
  if (ratio >= 0.8) return 'high';
  if (ratio >= 0.5) return 'mid';
  return 'low';
}

export function calculateProgress(currentIndex, totalScreens) {
  if (totalScreens <= 1) return 100;
  const validIndex = Math.max(0, Math.min(currentIndex, totalScreens - 1));
  return Math.round(((validIndex + 1) / totalScreens) * 100);
}

export function checkGameWin(score, targetScore) {
  return score >= targetScore;
}

export function isScratchComplete(revealedCount, totalCount, threshold = 0.6) {
  if (totalCount <= 0) return true;
  return (revealedCount / totalCount) >= threshold;
}

export function filterActiveScreens(allScreens, flowList) {
  if (!Array.isArray(flowList)) return [];
  return flowList.filter(screenId => allScreens.includes(screenId));
}
