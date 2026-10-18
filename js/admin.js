// /js/admin.js - Birthday CMS Studio & In-Situ Content Editor

import { getContent, setT, applyTheme } from './content.js';
import { showToast } from './ui/toast.js';

const ADMIN_PASSWORD = "123456";
let isAuthenticated = false;

// Check sessionStorage for existing login
try {
  if (sessionStorage.getItem('bday_admin_auth') === 'true') {
    isAuthenticated = true;
  }
} catch {}

export function initAdmin(onRefreshApp) {
  if (!window.location.search.includes('admin')) {
    return;
  }

  if (!isAuthenticated) {
    showPasswordPrompt(() => {
      isAuthenticated = true;
      try { sessionStorage.setItem('bday_admin_auth', 'true'); } catch {}
      mountAdminStudio(onRefreshApp);
    });
  } else {
    mountAdminStudio(onRefreshApp);
  }
}

function showPasswordPrompt(onSuccess) {
  const modal = document.createElement('div');
  modal.id = 'admin-password-modal';
  modal.className = 'fixed inset-0 z-50 bg-[#362436]/60 backdrop-blur-md flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative flex flex-col gap-4 text-center">
      <div class="w-12 h-12 rounded-full bg-[#FFD7F0] text-[#963A85] flex items-center justify-center mx-auto text-2xl">
        <span class="material-symbols-outlined text-[24px]">lock_reset</span>
      </div>
      <div>
        <h3 class="font-heading text-[20px] font-bold text-[#362436]">Master PIN Security</h3>
        <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Authorized Bestie Mode</span>
      </div>
      <p class="text-[13px] text-gray-600 leading-relaxed">
        Enter the Master PIN to edit copy, rearrange screens, or update media.
      </p>
      <div class="bg-[#FFF0F0] p-2.5 rounded-xl text-[12px] text-[#963A85] font-medium italic">
        "Default PIN: 123456"
      </div>
      <input
        id="admin-pin-input"
        type="password"
        maxlength="12"
        placeholder="Enter PIN"
        class="w-full text-center text-xl font-bold py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#963A85] tracking-widest"
      />
      <div class="flex items-center gap-2 pt-2">
        <button id="admin-pin-cancel" class="flex-1 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold text-[13px] border-none cursor-pointer">
          Cancel
        </button>
        <button id="admin-pin-submit" class="flex-1 py-2 rounded-full bg-[#963A85] text-white font-bold text-[13px] shadow-md border-none cursor-pointer">
          Unlock Editor
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = modal.querySelector('#admin-pin-input');
  const submitBtn = modal.querySelector('#admin-pin-submit');
  const cancelBtn = modal.querySelector('#admin-pin-cancel');

  const checkPin = () => {
    if (input.value.trim() === ADMIN_PASSWORD) {
      modal.remove();
      onSuccess();
    } else {
      input.classList.add('border-red-500');
      showToast('Incorrect PIN. Try 123456', 'error');
    }
  };

  submitBtn.addEventListener('click', checkPin);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPin();
  });
  cancelBtn.addEventListener('click', () => {
    modal.remove();
    // Redirect to normal view
    window.location.href = window.location.pathname;
  });

  setTimeout(() => input.focus(), 100);
}

function mountAdminStudio(onRefreshApp) {
  document.body.classList.add('admin-mode');
  showToast('🎛️ Admin CMS Active! <b>Right-click</b> any text to edit, <b>right-click again</b> to save.', 'success', 5000);

  // Attach Top Admin Sticky Bar
  const adminBar = document.createElement('div');
  adminBar.id = 'admin-sticky-bar';
  adminBar.className = 'fixed top-0 left-0 right-0 z-50 bg-[#362436] text-white px-4 py-2.5 shadow-lg flex flex-wrap items-center justify-between gap-3 text-[13px]';
  adminBar.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#963A85] text-white text-[11px] font-bold">
        <span class="material-symbols-outlined text-[15px] animate-pulse">tune</span>
        <span>LIVE ADMIN CMS</span>
      </div>
      <button id="admin-toggle-drawer" class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[12px] flex items-center gap-1 border-none cursor-pointer">
        <span class="material-symbols-outlined text-[16px]">side_navigation</span>
        <span>Studio Panels</span>
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button id="admin-discard-btn" class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[12px] border-none cursor-pointer flex items-center gap-1">
        <span class="material-symbols-outlined text-[15px]">undo</span>
        <span>Discard</span>
      </button>
      <button id="admin-save-btn" class="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF6FB5] to-[#BE5CA9] text-white font-bold text-[12px] shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 border-none cursor-pointer">
        <span class="material-symbols-outlined text-[16px]">cloud_upload</span>
        <span>Save & Publish</span>
      </button>
      <a href="${window.location.pathname}" class="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[12px] no-underline flex items-center gap-1">
        <span class="material-symbols-outlined text-[15px]">visibility</span>
        <span>Live Preview</span>
      </a>
      <button id="admin-logout-btn" class="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center border-none cursor-pointer" title="Exit Admin">
        <span class="material-symbols-outlined text-[16px]">logout</span>
      </button>
    </div>
  `;
  document.body.prepend(adminBar);

  // Enable right-click inline editing on all text elements
  initRightClickEditing();

  // Create Side Drawer Panel for Theme, Media Manager, Flow
  mountSideDrawer(onRefreshApp);

  // Save handler
  const saveBtn = adminBar.querySelector('#admin-save-btn');
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">sync</span><span>Saving...</span>`;

    try {
      const content = getContent();
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: ADMIN_PASSWORD,
          content
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      showToast(`<strong>Success!</strong> ${data.message || 'Saved successfully!'}`, 'success', 5000);
      try {
        localStorage.setItem('bday_cached_content', JSON.stringify(content));
      } catch {}
    } catch (err) {
      showToast(`Save Error: ${err.message}`, 'error', 6000);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">cloud_upload</span><span>Save & Publish</span>`;
    }
  });

  adminBar.querySelector('#admin-discard-btn').addEventListener('click', () => {
    if (confirm('Discard changes and reload original content?')) {
      window.location.reload();
    }
  });

  adminBar.querySelector('#admin-logout-btn').addEventListener('click', () => {
    try { sessionStorage.removeItem('bday_admin_auth'); } catch {}
    window.location.href = window.location.pathname;
  });
}

// ─── Right-Click Inline Editing System ───────────────────────────────
// Right-click on any text → enters edit mode
// Right-click again → saves to content.json
// Escape → cancels the edit

let activeEditEl = null;
let activeEditOriginalText = '';
let editBadge = null;

function initRightClickEditing() {
  document.addEventListener('contextmenu', handleRightClick);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeEditEl) {
      cancelEdit();
    }
  });
  // Save any active edit if user navigates away
  window.addEventListener('beforeunload', () => {
    if (activeEditEl) finishEdit();
  });
}

function handleRightClick(e) {
  if (!document.body.classList.contains('admin-mode')) return;

  const target = findClosestEditableText(e.target);
  if (!target) return; // Let default context menu appear for non-text areas

  e.preventDefault();

  if (target === activeEditEl) {
    // Second right-click → SAVE
    finishEdit();
  } else {
    // Save any previous edit first
    if (activeEditEl) finishEdit();
    // Enter edit mode on new target
    startEdit(target);
  }
}

function findClosestEditableText(el) {
  let current = el;
  while (current && current !== document.body) {
    const id = current.id || '';
    // Skip admin UI elements entirely
    if (['admin-sticky-bar', 'admin-side-drawer', 'toast-container',
         'admin-password-modal', 'rclick-edit-badge'].includes(id)) {
      return null;
    }

    const tag = current.tagName?.toLowerCase() || '';
    // Skip form elements (they have their own editing)
    if (['input', 'textarea', 'select'].includes(tag)) return null;

    // If it has data-key, that's our target
    if (current.hasAttribute?.('data-key')) return current;

    // For elements without data-key, try to find a matching JSON path
    if (current.nodeType === 1 && isEditableTextElement(current)) {
      const text = current.innerText?.trim();
      if (text && text.length > 1) {
        const path = findJsonPathByText(getContent(), text);
        if (path) {
          current.setAttribute('data-key', path);
          current.setAttribute('data-key-auto', 'true');
          return current;
        }
      }
    }

    current = current.parentElement;
  }
  return null;
}

function isEditableTextElement(el) {
  const tag = el.tagName.toLowerCase();
  const skipTags = ['script', 'style', 'svg', 'canvas', 'img', 'video',
                     'audio', 'input', 'textarea', 'select'];
  if (skipTags.includes(tag)) return false;
  if (el.classList?.contains('material-symbols-outlined')) return false;

  const text = el.innerText?.trim();
  if (!text || text.length === 0) return false;

  // Only target leaf-ish text elements (no complex children)
  const children = el.children;
  for (let i = 0; i < children.length; i++) {
    const ct = children[i].tagName.toLowerCase();
    if (!['span', 'strong', 'em', 'b', 'i', 'br', 'small'].includes(ct) &&
        !children[i].classList?.contains('material-symbols-outlined')) {
      return false;
    }
  }
  return true;
}

function findJsonPathByText(obj, searchText, path = '') {
  if (!obj || typeof obj !== 'object') return null;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullPath = path ? `${path}.${key}` : key;

    if (typeof val === 'string') {
      const cleanVal = val.replace(/\\"/g, '"').trim();
      const cleanSearch = searchText.replace(/\\"/g, '"').trim();
      if (cleanVal === cleanSearch) {
        return fullPath;
      }
    } else if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        const itemPath = `${fullPath}.${i}`;
        if (typeof val[i] === 'string' && val[i].trim() === searchText) {
          return itemPath;
        } else if (typeof val[i] === 'object' && val[i] !== null) {
          const found = findJsonPathByText(val[i], searchText, itemPath);
          if (found) return found;
        }
      }
    } else if (typeof val === 'object' && val !== null) {
      const found = findJsonPathByText(val, searchText, fullPath);
      if (found) return found;
    }
  }
  return null;
}

function startEdit(el) {
  activeEditEl = el;
  activeEditOriginalText = el.innerText;

  el.contentEditable = 'true';
  el.spellcheck = false;
  el.classList.add('rclick-editing');
  el.focus();

  // Select all text for easy replacement
  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } catch {}

  showEditBadgeFn(el);
  showToast('✏️ <b>Editing</b> — type your text, then <b>right-click to save</b> or press <b>Esc</b> to cancel', 'info', 4000);
}

function finishEdit() {
  if (!activeEditEl) return;

  const el = activeEditEl;
  const key = el.getAttribute('data-key');
  const newText = el.innerText.trim();

  el.contentEditable = 'false';
  el.classList.remove('rclick-editing');
  removeEditBadgeFn();

  if (key && newText !== activeEditOriginalText.trim()) {
    // Flash green to confirm save
    el.classList.add('rclick-saved');
    setTimeout(() => el.classList.remove('rclick-saved'), 1000);

    setT(key, newText);
    autoSaveToFile();
    showToast(`✅ <b>Saved!</b> "${key}" updated & saved to content.json`, 'success', 3500);
  } else if (newText === activeEditOriginalText.trim()) {
    showToast('ℹ️ No changes made', 'info', 2000);
  } else {
    showToast('⚠️ Could not map this text to a JSON path — edit is visual only', 'error', 3500);
  }

  activeEditEl = null;
  activeEditOriginalText = '';
}

function cancelEdit() {
  if (!activeEditEl) return;
  activeEditEl.innerText = activeEditOriginalText;
  activeEditEl.contentEditable = 'false';
  activeEditEl.classList.remove('rclick-editing');
  removeEditBadgeFn();
  activeEditEl = null;
  activeEditOriginalText = '';
  showToast('❌ Edit cancelled', 'info', 2000);
}

function showEditBadgeFn(el) {
  removeEditBadgeFn();
  editBadge = document.createElement('div');
  editBadge.id = 'rclick-edit-badge';
  const key = el.getAttribute('data-key') || '?';
  editBadge.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">edit</span>
    <span><b>${key}</b> · Right-click to save · Esc to cancel</span>
  `;
  document.body.appendChild(editBadge);
  positionBadgeFn(el);

  const reposition = () => positionBadgeFn(el);
  window.addEventListener('scroll', reposition, { passive: true });
  editBadge._cleanupScroll = () => window.removeEventListener('scroll', reposition);
}

function positionBadgeFn(el) {
  if (!editBadge) return;
  const rect = el.getBoundingClientRect();
  const badgeH = 30;
  let top = rect.top + window.scrollY - badgeH - 8;
  let left = rect.left + window.scrollX;

  // If badge would be above viewport, place it below the element
  if (top < window.scrollY + 50) {
    top = rect.bottom + window.scrollY + 6;
  }
  if (left < 8) left = 8;

  editBadge.style.position = 'absolute';
  editBadge.style.top = `${top}px`;
  editBadge.style.left = `${left}px`;
  editBadge.style.zIndex = '10000';
}

function removeEditBadgeFn() {
  if (editBadge) {
    if (editBadge._cleanupScroll) editBadge._cleanupScroll();
    editBadge.remove();
    editBadge = null;
  }
}

async function autoSaveToFile() {
  try {
    const content = getContent();
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, content })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
    try { localStorage.setItem('bday_cached_content', JSON.stringify(content)); } catch {}
  } catch (err) {
    console.warn('Auto-save to file failed:', err.message);
    showToast(`⚠️ Auto-save failed: ${err.message}. Use Save & Publish button.`, 'error', 4000);
  }
}

const knownScreens = [
  'intro', 'gift', 'nameReveal', 'quiz', 'bubbles', 'gallery',
  'videos', 'game', 'scratch', 'voice', 'letter', 'cake', 'finale'
];

function humanizeKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getValueAtPath(object, path) {
  return path.split('.').reduce((value, part) => value?.[part], object);
}

function createButton(label, className, onClick, title = label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.title = title;
  button.setAttribute('aria-label', title);
  button.addEventListener('click', onClick);
  return button;
}

function emptyArrayItem(path) {
  if (path === 'gallery.items') {
    return { id: `photo-${Date.now()}`, type: 'image', src: '', title: '', caption: '', date: '', chapter: '' };
  }
  if (path === 'videos.items') {
    return { id: `video-${Date.now()}`, src: '', title: '', caption: '', date: '' };
  }
  if (path === 'voice.tracks') return { title: '', src: '' };
  if (path === 'quiz.questions') return { q: '', options: ['', '', '', ''], answer: 0, rightMsg: '', wrongMsg: '' };
  if (path === 'bubbles.items') return { id: Date.now(), icon: '', label: '', memory: '' };
  if (path === 'game.items') return { emoji: '', name: '', pts: 0, isGood: true };
  if (path === 'scratch.cards') return { id: Date.now(), title: '', tag: '', text: '' };
  if (path === 'voice.speechBubbles') return { emoji: '', text: '' };
  if (path === 'finale.envelopes') return { id: '', emoji: '', tag: '', title: '', subtitle: '', body: '' };
  if (path.endsWith('.options') || path.endsWith('.taunts') || path.endsWith('.wishLines') ||
      path.endsWith('.paragraphs') || path.endsWith('.auroraColors')) return '';
  return {};
}

function makeEditorNode(key, value, path, onChange, onStructureChange, depth = 0) {
  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === 'object';

  if (isArray) {
    const details = document.createElement('details');
    details.className = 'editor-group editor-array';
    details.dataset.search = `${humanizeKey(key)} ${path}`.toLowerCase();
    details.open = depth === 0;
    const summary = document.createElement('summary');
    summary.className = 'editor-group__summary';
    summary.textContent = `${humanizeKey(key)} (${value.length})`;
    details.append(summary);

    const children = document.createElement('div');
    children.className = 'editor-group__children';

    value.forEach((item, index) => {
      const itemPath = `${path}.${index}`;
      const itemDetails = document.createElement('details');
      itemDetails.className = 'editor-item';
      itemDetails.dataset.search = `${humanizeKey(key)} ${index + 1} ${path}`.toLowerCase();
      const itemSummary = document.createElement('summary');
      itemSummary.className = 'editor-item__summary';
      const itemLabel = typeof item === 'object' && item !== null
        ? (item.title || item.label || item.name || item.id || `${humanizeKey(key)} ${index + 1}`)
        : `${humanizeKey(key)} ${index + 1}`;
      itemSummary.textContent = String(itemLabel);

      const actions = document.createElement('span');
      actions.className = 'editor-item__actions';
      actions.append(
        createButton('↑', 'editor-icon-button', (event) => {
          event.stopPropagation();
          if (index > 0) {
            const next = [...getValueAtPath(getContent(), path)];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            setT(path, next);
            onStructureChange();
          }
        }, `Move ${itemLabel} up`),
        createButton('↓', 'editor-icon-button', (event) => {
          event.stopPropagation();
          const next = [...getValueAtPath(getContent(), path)];
          if (index < next.length - 1) {
            [next[index + 1], next[index]] = [next[index], next[index + 1]];
            setT(path, next);
            onStructureChange();
          }
        }, `Move ${itemLabel} down`),
        createButton('Remove', 'editor-remove-button', (event) => {
          event.stopPropagation();
          if (!confirm(`Remove ${itemLabel}?`)) return;
          const next = [...getValueAtPath(getContent(), path)];
          next.splice(index, 1);
          setT(path, next);
          onStructureChange();
        }, `Remove ${itemLabel}`)
      );
      itemSummary.append(actions);
      itemDetails.append(itemSummary);

      const itemContent = document.createElement('div');
      itemContent.className = 'editor-group__children';
      itemContent.append(makeEditorNode(`${humanizeKey(key)} ${index + 1}`, item, itemPath, onChange, onStructureChange, depth + 1));
      itemDetails.append(itemContent);
      children.append(itemDetails);
    });

    children.append(createButton(
      `Add ${humanizeKey(key).replace(/s$/, '')}`,
      'editor-add-button',
      () => {
        const next = [...getValueAtPath(getContent(), path), emptyArrayItem(path)];
        setT(path, next);
        onStructureChange();
      }
    ));
    details.append(children);
    return details;
  }

  if (isObject) {
    const details = document.createElement('details');
    details.className = 'editor-group';
    details.dataset.search = `${humanizeKey(key)} ${path}`.toLowerCase();
    details.open = depth === 0 && ['profile', 'common'].includes(key);
    const summary = document.createElement('summary');
    summary.className = 'editor-group__summary';
    summary.textContent = humanizeKey(key);
    details.append(summary);

    const children = document.createElement('div');
    children.className = 'editor-group__children';
    Object.entries(value).forEach(([childKey, childValue]) => {
      const childPath = path ? `${path}.${childKey}` : childKey;
      children.append(makeEditorNode(childKey, childValue, childPath, onChange, onStructureChange, depth + 1));
    });
    const addProperty = document.createElement('div');
    addProperty.className = 'editor-add-property';
    const addPropertyButton = createButton('Add custom setting', 'editor-add-button', () => {
      addPropertyButton.hidden = true;
      propertyForm.hidden = false;
      propertyName.focus();
    });
    const propertyForm = document.createElement('div');
    propertyForm.className = 'editor-add-property__form';
    propertyForm.hidden = true;
    const propertyName = document.createElement('input');
    propertyName.className = 'editor-input';
    propertyName.type = 'text';
    propertyName.placeholder = 'Setting name';
    const propertyValue = document.createElement('input');
    propertyValue.className = 'editor-input';
    propertyValue.type = 'text';
    propertyValue.placeholder = 'Setting value';
    const addPropertyError = document.createElement('span');
    addPropertyError.className = 'editor-field__path';
    const saveProperty = createButton('Add setting', 'editor-add-button', () => {
      const name = propertyName.value.trim();
      if (!name || name.includes('.') || ['__proto__', 'prototype', 'constructor'].includes(name) || Object.hasOwn(value, name)) {
        addPropertyError.textContent = 'Enter a unique name without dots.';
        return;
      }
      const propertyPath = path ? `${path}.${name}` : name;
      setT(propertyPath, propertyValue.value);
      onStructureChange();
    });
    propertyForm.append(propertyName, propertyValue, addPropertyError, saveProperty);
    addProperty.append(addPropertyButton, propertyForm);
    children.append(addProperty);
    details.append(children);
    return details;
  }

  const field = document.createElement('label');
  field.className = 'editor-field';
  field.dataset.search = `${humanizeKey(key)} ${path}`.toLowerCase();

  const label = document.createElement('span');
  label.className = 'editor-field__label';
  label.textContent = humanizeKey(key);
  const pathLabel = document.createElement('code');
  pathLabel.className = 'editor-field__path';
  pathLabel.textContent = path;
  field.append(label, pathLabel);

  if (typeof value === 'boolean') {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value;
    input.className = 'editor-checkbox';
    input.addEventListener('change', () => onChange(path, input.checked));
    field.append(input);
    return field;
  }

  if (typeof value === 'number') {
    const input = document.createElement('input');
    input.type = 'number';
    input.step = Number.isInteger(value) ? '1' : 'any';
    input.value = String(value);
    input.className = 'editor-input';
    input.addEventListener('change', () => {
      if (input.value.trim() !== '' && Number.isFinite(input.valueAsNumber)) {
        onChange(path, input.valueAsNumber);
      }
    });
    field.append(input);
    return field;
  }

  const text = String(value ?? '');
  const input = text.length > 100 || text.includes('\n')
    ? document.createElement('textarea')
    : document.createElement('input');
  if (input instanceof HTMLInputElement) input.type = 'text';
  input.value = text;
  input.className = input instanceof HTMLTextAreaElement ? 'editor-input editor-textarea' : 'editor-input';
  input.spellcheck = true;
  input.addEventListener('change', () => onChange(path, input.value));
  field.append(input);
  return field;
}

function mountSideDrawer(onRefreshApp) {
  const drawer = document.createElement('div');
  drawer.id = 'admin-side-drawer';
  drawer.className = 'admin-drawer fixed top-12 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-40 transform translate-x-full transition-transform duration-300 flex flex-col border-l border-gray-200 overflow-hidden';

  drawer.innerHTML = `
    <div class="admin-drawer__header">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined">dashboard_customize</span>
        <div>
          <h3>Celebration Studio</h3>
          <p>Edit copy, settings, flow, and every media path.</p>
        </div>
      </div>
      <button id="drawer-close-btn" type="button" class="admin-drawer__close" aria-label="Close Celebration Studio">×</button>
    </div>
    <div class="admin-drawer__tabs" role="tablist" aria-label="Studio panels">
      <button class="drawer-tab is-active" data-tab="content" role="tab" aria-selected="true">Content</button>
      <button class="drawer-tab" data-tab="media" role="tab" aria-selected="false">Media</button>
      <button class="drawer-tab" data-tab="theme" role="tab" aria-selected="false">Theme</button>
      <button class="drawer-tab" data-tab="flow" role="tab" aria-selected="false">Flow</button>
      <button class="drawer-tab" data-tab="json" role="tab" aria-selected="false">JSON</button>
    </div>
    <div class="admin-drawer__body">
      <section id="tab-content" class="drawer-tab-content" role="tabpanel">
        <p class="admin-drawer__hint">Every editable setting in content.json is shown here. Expand a section, change a value, then use Save & Publish.</p>
        <label class="editor-search-label">Find a setting
          <input id="content-search" class="editor-input" type="search" placeholder="Search by text or setting path">
        </label>
        <div id="content-editor" class="editor-tree"></div>
      </section>
      <section id="tab-media" class="drawer-tab-content" role="tabpanel" hidden>
        <p class="admin-drawer__hint">Update file paths or links, names, captions, and reorder or remove entries. Use local paths such as media/photos/photo.jpg or a complete URL.</p>
        <div id="media-editor" class="editor-tree"></div>
      </section>
      <section id="tab-theme" class="drawer-tab-content" role="tabpanel" hidden>
        <p class="admin-drawer__hint">Change palette colors here, or edit any other theme setting in the Content panel.</p>
        <div id="theme-pickers" class="theme-picker-grid"></div>
      </section>
      <section id="tab-flow" class="drawer-tab-content" role="tabpanel" hidden>
        <h4 class="admin-section-title">Birthday journey</h4>
        <p class="admin-drawer__hint">Turn screens on or off and reorder the active journey.</p>
        <div id="flow-list-container" class="flow-editor"></div>
      </section>
      <section id="tab-json" class="drawer-tab-content" role="tabpanel" hidden>
        <div class="admin-json-heading">
          <h4 class="admin-section-title">Content manifest</h4>
          <button id="btn-copy-manifest" type="button" class="editor-add-button">Copy JSON</button>
        </div>
        <textarea id="manifest-textarea" class="editor-json" readonly aria-label="Current content JSON"></textarea>
      </section>
    </div>
  `;
  document.body.appendChild(drawer);

  const syncManifest = () => {
    drawer.querySelector('#manifest-textarea').value = JSON.stringify(getContent(), null, 2);
  };
  const refreshPreview = () => {
    if (onRefreshApp) onRefreshApp();
    syncManifest();
  };
  const updateValue = (path, value) => {
    setT(path, value);
    if (path.startsWith('theme.')) applyTheme(getContent().theme);
    refreshPreview();
  };

  const contentEditor = drawer.querySelector('#content-editor');
  const searchInput = drawer.querySelector('#content-search');
  const rebuildContent = () => {
    contentEditor.replaceChildren(makeEditorNode('Birthday content', getContent(), '', updateValue, handleStructureChange, -1));
    const root = contentEditor.firstElementChild;
    if (root) {
      root.open = true;
      root.classList.add('editor-root');
      const summary = root.querySelector(':scope > summary');
      if (summary) summary.hidden = true;
    }
  };

  const mediaEditor = drawer.querySelector('#media-editor');
  const rebuildMedia = () => {
    const activeTab = drawer.querySelector('.drawer-tab.is-active')?.dataset.tab;
    const roots = [
      ['gallery', 'Photo gallery'],
      ['videos', 'Video gallery'],
      ['voice', 'Audio tracks']
    ];
    mediaEditor.replaceChildren();
    roots.forEach(([key, title]) => {
      const section = document.createElement('details');
      section.className = 'editor-group';
      section.open = activeTab === 'media' && key === 'gallery';
      const summary = document.createElement('summary');
      summary.className = 'editor-group__summary';
      summary.textContent = title;
      section.append(summary);
      const child = document.createElement('div');
      child.className = 'editor-group__children';
      const value = getContent()[key];
      if (value) child.append(makeEditorNode(key, value, key, updateValue, handleStructureChange, 1));
      section.append(child);
      mediaEditor.append(section);
    });
  };

  const flowEditor = drawer.querySelector('#flow-list-container');
  const rebuildFlow = () => {
    const flow = getContent().flow || [];
    flowEditor.replaceChildren();
    knownScreens.forEach((screenId) => {
      const activeIndex = flow.indexOf(screenId);
      const active = activeIndex !== -1;
      const row = document.createElement('div');
      row.className = 'flow-editor__row';
      const label = document.createElement('label');
      label.className = 'flow-editor__label';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = active;
      checkbox.disabled = active && flow.length === 1;
      checkbox.addEventListener('change', () => {
        const next = [...(getContent().flow || [])];
        if (checkbox.checked && !next.includes(screenId)) next.push(screenId);
        else if (!checkbox.checked) next.splice(next.indexOf(screenId), 1);
        setT('flow', next);
        rebuildAll();
        refreshPreview();
      });
      const name = document.createElement('span');
      name.textContent = humanizeKey(screenId);
      label.append(checkbox, name);
      row.append(label);
      if (active) {
        row.append(
          createButton('↑', 'editor-icon-button', () => {
            const next = [...getContent().flow];
            if (activeIndex > 0) {
              [next[activeIndex - 1], next[activeIndex]] = [next[activeIndex], next[activeIndex - 1]];
              setT('flow', next);
              rebuildAll();
              refreshPreview();
            }
          }, `Move ${humanizeKey(screenId)} earlier`),
          createButton('↓', 'editor-icon-button', () => {
            const next = [...getContent().flow];
            if (activeIndex < next.length - 1) {
              [next[activeIndex + 1], next[activeIndex]] = [next[activeIndex], next[activeIndex + 1]];
              setT('flow', next);
              rebuildAll();
              refreshPreview();
            }
          }, `Move ${humanizeKey(screenId)} later`)
        );
        const order = document.createElement('span');
        order.className = 'flow-editor__order';
        order.textContent = String(activeIndex + 1);
        row.append(order);
      }
      flowEditor.append(row);
    });
  };

  const rebuildThemePickers = () => {
    const theme = getContent().theme || {};
    const pickerRoot = drawer.querySelector('#theme-pickers');
    pickerRoot.replaceChildren();
    [
      ['Primary color', 'primary'],
      ['Secondary color', 'secondary'],
      ['Highlight color', 'highlightPop'],
      ['Page background', 'canvasBack'],
      ['Surface color', 'surface'],
      ['Accent color', 'accentVeil']
    ].forEach(([labelText, key]) => {
      const label = document.createElement('label');
      label.className = 'theme-picker';
      const text = document.createElement('span');
      text.textContent = labelText;
      const input = document.createElement('input');
      input.type = 'color';
      input.value = /^#[0-9a-f]{6}$/i.test(theme[key] || '') ? theme[key] : '#4D3A4D';
      input.addEventListener('input', () => updateValue(`theme.${key}`, input.value));
      label.append(text, input);
      pickerRoot.append(label);
    });
  };

  function rebuildAll() {
    rebuildContent();
    rebuildMedia();
    rebuildFlow();
    rebuildThemePickers();
    syncManifest();
  }

  function handleStructureChange() {
    rebuildAll();
    refreshPreview();
  }

  rebuildAll();
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    contentEditor.querySelectorAll('[data-search]').forEach((node) => {
      const ownMatch = node.dataset.search.includes(query);
      const descendantMatch = node.querySelector(`[data-search*="${CSS.escape(query)}"]`);
      node.hidden = Boolean(query) && !ownMatch && !descendantMatch;
      if (query && descendantMatch && node instanceof HTMLDetailsElement) node.open = true;
    });
  });

  drawer.querySelector('#btn-copy-manifest').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(getContent(), null, 2));
      showToast('Manifest JSON copied to clipboard!', 'success');
    } catch (error) {
      showToast(`Could not copy manifest: ${error.message}`, 'error');
    }
  });

  const toggleBtn = document.getElementById('admin-toggle-drawer');
  const closeBtn = drawer.querySelector('#drawer-close-btn');
  toggleBtn.addEventListener('click', () => drawer.classList.toggle('translate-x-full'));
  closeBtn.addEventListener('click', () => drawer.classList.add('translate-x-full'));

  drawer.querySelectorAll('.drawer-tab').forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      drawer.querySelectorAll('.drawer-tab').forEach((button) => {
        const selected = button === tabButton;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-selected', String(selected));
      });
      drawer.querySelectorAll('.drawer-tab-content').forEach((panel) => {
        panel.hidden = panel.id !== `tab-${tabButton.dataset.tab}`;
      });
    });
  });
}
