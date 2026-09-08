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

const BRAND_GREEN = [130, 147, 100];

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
    const edge = darken(primary, 0.38);
    const back =
      'M1.44411 3.86858C1.21333 2.63775 2.15758 1.5 3.40985 1.5H7.81325C8.40681 1.5 8.96971 1.76365 9.34969 2.21963L9.40031 2.28037C9.7803 2.73635 10.3432 3 10.9367 3H15.3153C16.2888 3 17.1208 3.70088 17.2862 4.66019L19.0966 15.1602C19.3073 16.3826 18.3661 17.5 17.1257 17.5H5.65985C4.69742 17.5 3.87147 16.8145 3.69411 15.8686L1.44411 3.86858Z';
    const front =
      'M5.59806 7.97376C5.83537 7.10364 6.62569 6.5 7.52759 6.5H19.3815C20.7002 6.5 21.658 7.75396 21.311 9.02623L19.4019 16.0262C19.1646 16.8964 18.3743 17.5 17.4724 17.5H5.6185C4.29975 17.5 3.34199 16.246 3.68897 14.9738L5.59806 7.97376Z';
    return {
      width: 160,
      height: 101,
      svg: `<svg width="160" height="101" viewBox="-3 0 30 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${back}" fill="${a}"/><path d="${back}" stroke="${edge}" stroke-width="1.5"/><path d="${front}" fill="white"/><path d="${front}" stroke="${edge}" stroke-width="1.5"/></svg>`,
    };
  }
  return {
    width: 150,
    height: 150,
    svg: `<svg width="150" height="150" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><mask id="zog"><rect x="-10" y="-10" width="148" height="148" fill="white"/><rect x="41.998" y="31.25" width="70.04" height="89.36" rx="14" fill="black"/></mask></defs><g mask="url(#zog)"><rect transform="translate(51.28 61.69) rotate(-17.5) translate(-35.022 -44.68)" x="3.55" y="3.55" width="62.94" height="82.26" rx="10.45" fill="white" stroke="${a}" stroke-width="7.1"/></g><rect transform="translate(41.998 31.25)" x="3.55" y="3.55" width="62.94" height="82.26" rx="10.45" fill="none" stroke="${a}" stroke-width="7.1"/></svg>`,
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
