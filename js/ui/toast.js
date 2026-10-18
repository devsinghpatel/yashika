// /js/ui/toast.js - Liquid Toast Notification Helper

let toastContainer = null;

export function showToast(message, type = 'info', duration = 3000) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '24px';
    toastContainer.style.left = '50%';
    toastContainer.style.transform = 'translateX(-50%)';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.gap = '8px';
    toastContainer.style.pointerEvents = 'none';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'glass-pill';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '9999px';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '600';
  toast.style.color = '#362436';
  toast.style.boxShadow = '0 8px 24px rgba(150, 58, 133, 0.2)';
  toast.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(15px) scale(0.95)';
  toast.style.pointerEvents = 'auto';

  if (type === 'error') {
    toast.style.backgroundColor = '#FFDAD6';
    toast.style.color = '#93000A';
  } else if (type === 'success') {
    toast.style.backgroundColor = '#FFD7F0';
    toast.style.color = '#7A206C';
  } else {
    toast.style.backgroundColor = '#FFF8F7';
    toast.style.color = '#4D3A4D';
  }

  toast.innerHTML = message;
  toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px) scale(0.95)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }, duration);
}
