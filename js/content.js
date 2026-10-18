// /js/content.js - Content loader, path resolver, and theme applicator

let appContent = null;
const listeners = new Set();

/**
 * Fetches content.json without caching
 */
export async function loadContent() {
  try {
    const res = await fetch('./content.json?v=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    appContent = await res.json();
  } catch (err) {
    console.warn('Failed to fetch content.json, using fallback cache if available', err);
    // If running in restricted environment or offline, try localStorage
    try {
      const cached = localStorage.getItem('bday_cached_content');
      if (cached) {
        appContent = JSON.parse(cached);
      }
    } catch {}
    if (!appContent) {
      throw err;
    }
  }

  // Cache in localStorage safely
  try {
    localStorage.setItem('bday_cached_content', JSON.stringify(appContent));
  } catch {}

  applyTheme(appContent.theme);
  applySiteMetadata(appContent);
  notifyListeners();
  return appContent;
}

/**
 * Accesses deep property via dot-notation path, e.g. t('quiz.questions.0.q')
 */
export function t(path, fallback = '') {
  if (!appContent || !path) return fallback;
  const parts = path.split('.');
  let current = appContent;

  for (const part of parts) {
    if (current === null || current === undefined) return fallback;
    current = current[part];
  }

  if (current === undefined || current === null) return fallback;
  return current;
}

/**
 * Mutates deep property via dot-notation path
 */
export function setT(path, value) {
  if (!appContent || !path) return false;
  const parts = path.split('.');
  let current = appContent;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = isNaN(Number(parts[i + 1])) ? {} : [];
    }
    current = current[part];
  }

  const lastKey = parts[parts.length - 1];
  current[lastKey] = value;
  applySiteMetadata(appContent);
  notifyListeners();
  return true;
}

/**
 * Returns full active content object
 */
export function getContent() {
  return appContent;
}

/**
 * Replaces full content object
 */
export function setContent(newContent) {
  appContent = newContent;
  if (appContent?.theme) {
    applyTheme(appContent.theme);
  }
  applySiteMetadata(appContent);
  notifyListeners();
}

/**
 * Subscribe to content changes
 */
export function onContentChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn(appContent);
    } catch (e) {
      console.error('Error in content listener', e);
    }
  });
}

/**
 * Injects CSS variables according to theme
 */
export function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;

  if (theme.surface) root.style.setProperty('--color-surface', theme.surface);
  if (theme.surfaceGlass) root.style.setProperty('--color-surface-glass', theme.surfaceGlass);
  if (theme.canvasBack) root.style.setProperty('--color-canvas-back', theme.canvasBack);
  if (theme.primary) root.style.setProperty('--color-primary', theme.primary);
  if (theme.secondary) root.style.setProperty('--color-secondary', theme.secondary);
  if (theme.secondaryContainer) root.style.setProperty('--color-secondary-container', theme.secondaryContainer);
  if (theme.secondaryFixed) root.style.setProperty('--color-secondary-fixed', theme.secondaryFixed);
  if (theme.accentVeil) root.style.setProperty('--color-accent-veil', theme.accentVeil);
  if (theme.highlightPop) root.style.setProperty('--color-highlight-pop', theme.highlightPop);
  if (theme.mutedShade) root.style.setProperty('--color-muted-shade', theme.mutedShade);

  if (Array.isArray(theme.auroraColors)) {
    theme.auroraColors.forEach((col, idx) => {
      root.style.setProperty(`--aurora-${idx + 1}`, col);
    });
  }

  if (theme.fontHeading) root.style.setProperty('--font-heading', `'${theme.fontHeading}', sans-serif`);
  if (theme.fontBody) root.style.setProperty('--font-body', `'${theme.fontBody}', sans-serif`);
  if (theme.fontHandwritten) root.style.setProperty('--font-handwritten', `'${theme.fontHandwritten}', cursive`);
}

function applySiteMetadata(content) {
  if (!content || typeof document === 'undefined') return;
  if (content.siteTitle) document.title = content.siteTitle;

  const description = content.siteDescription;
  if (!description) return;

  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  if (content.siteTitle) {
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', content.siteTitle);
  }
}
