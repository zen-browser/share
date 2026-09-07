import { ImageResponse } from 'workers-og';

const LABELS = { space: 'Space', folder: 'Folder', splitView: 'Split View' };

const FONT_BASE = 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files';
let fontsPromise;
function loadFonts() {
  fontsPromise ??= Promise.all([
    fetch(`${FONT_BASE}/inter-latin-800-normal.woff`).then((r) => r.arrayBuffer()),
    fetch(`${FONT_BASE}/inter-latin-600-normal.woff`).then((r) => r.arrayBuffer()),
  ]).then(([w800, w600]) => [
    { name: 'Inter', data: w800, weight: 800, style: 'normal' },
    { name: 'Inter', data: w600, weight: 600, style: 'normal' },
  ]);
  return fontsPromise;
}

function toRgb(c) {
  let [r, g, b] = c;
  if (r <= 1 && g <= 1 && b <= 1) [r, g, b] = [r * 255, g * 255, b * 255];
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return [cl(r), cl(g), cl(b)];
}
const css = (c) => `rgb(${toRgb(c).join(',')})`;
const mix = (c, amt) => {
  const [r, g, b] = toRgb(c);
  const m = (v) => Math.round(v * (1 - amt) + 255 * amt);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
};
const darken = (c, amt) => {
  const [r, g, b] = toRgb(c);
  const m = (v) => Math.round(v * (1 - amt));
  return `rgb(${m(r)},${m(g)},${m(b)})`;
};

const BRAND_GREEN = [52, 168, 83];

function countTabs(node) {
  let n = 0;
  const walk = (x) => {
    if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === 'object') {
      if (x.type === 'tab') n += 1;
      else {
        if (x.items) walk(x.items);
        if (x.tabs) walk(x.tabs);
      }
    }
  };
  walk(node);
  return n;
}

function iconFor(type, primary) {
  const a = css(primary);
  const light = mix(primary, 0.72);
  if (type === 'splitView') {
    return {
      width: 156,
      height: 126,
      svg: `<svg width="156" height="126" viewBox="0 0 64 52" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="8" width="52" height="36" rx="9" fill="${light}" stroke="${a}" stroke-width="4.5"/><line x1="32" y1="10" x2="32" y2="42" stroke="${a}" stroke-width="4.5"/></svg>`,
    };
  }
  if (type === 'folder') {
    return {
      width: 156,
      height: 130,
      svg: `<svg width="156" height="130" viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg"><path d="M1.44 3.87C1.21 2.64 2.16 1.5 3.41 1.5H7.81C8.41 1.5 8.97 1.76 9.35 2.22L9.4 2.28C9.78 2.74 10.34 3 10.94 3H15.32C16.29 3 17.12 3.7 17.29 4.66L19.1 15.16C19.31 16.38 18.37 17.5 17.13 17.5H5.66C4.7 17.5 3.87 16.81 3.69 15.87L1.44 3.87Z" fill="${a}"/><path d="M5.6 7.97C5.84 7.1 6.63 6.5 7.53 6.5H19.38C20.7 6.5 21.66 7.75 21.31 9.03L19.4 16.03C19.16 16.9 18.37 17.5 17.47 17.5H5.62C4.3 17.5 3.34 16.25 3.69 14.97L5.6 7.97Z" fill="white" stroke="${a}" stroke-width="1.4"/></svg>`,
    };
  }
  return {
    width: 140,
    height: 140,
    svg: `<svg width="140" height="140" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="14" width="30" height="40" rx="7" transform="rotate(-11 27 34)" fill="${light}" stroke="${a}" stroke-width="4.5"/><rect x="24" y="12" width="30" height="40" rx="7" fill="white" stroke="${a}" stroke-width="4.5"/></svg>`,
  };
}

function escapeHtml(v) {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function renderOg({ type, item, meta }) {
  const fonts = await loadFonts();
  const label = LABELS[type] || 'Share';
  const from = meta?.name ? `A ${label} from ${escapeHtml(meta.name)}` : `A shared ${label}`;
  const tabs = countTabs(item);
  const primary = BRAND_GREEN;
  const bg = `linear-gradient(135deg, ${mix(BRAND_GREEN, 0.88)}, ${mix(BRAND_GREEN, 0.74)})`;

  const ic = iconFor(type, primary);
  const iconUri = `data:image/svg+xml;base64,${btoa(ic.svg)}`;

  const html =
    `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:1200px;height:630px;background:${bg};font-family:Inter">` +
    `<img src="${iconUri}" width="${ic.width}" height="${ic.height}" style="margin-bottom:56px" />` +
    `<div style="display:flex;font-size:70px;font-weight:800;letter-spacing:-0.03em;color:${darken(primary, 0.66)}">${from}</div>` +
    `<div style="display:flex;font-size:40px;font-weight:600;color:rgba(30,27,52,0.42);margin-top:12px">${tabs} ${tabs === 1 ? 'tab' : 'tabs'}</div>` +
    `</div>`;

  return new ImageResponse(html, { width: 1200, height: 630, fonts });
}
