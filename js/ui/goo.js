// /js/ui/goo.js - SVG Gooey Metaball Filter Injection

export function initGooFilter() {
  if (document.getElementById('svg-goo-filter')) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'svg-goo-filter';
  svg.style.position = 'absolute';
  svg.style.top = '-9999px';
  svg.style.left = '-9999px';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.setAttribute('aria-hidden', 'true');

  svg.innerHTML = `
    <defs>
      <filter id="goo-filter">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 19 -9" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
      <filter id="goo-filter-heavy">
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 25 -12" result="goo" />
        <feBlend in="SourceGraphic" in2="goo" />
      </filter>
    </defs>
  `;

  document.body.appendChild(svg);
}
