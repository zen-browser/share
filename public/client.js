const share = JSON.parse(document.getElementById('share-data').textContent);

const BRAND_PAGE = '#d7e9d9';
const BRAND_FRAME = '#eef6ef';

const DEFAULT_THEME_COLORS = [
  { c: [134, 213, 143], isPrimary: true },
  { c: [180, 226, 160] },
  { c: [110, 196, 150] },
];
const PILL_GREEN = '#2f9e44';

const STACK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="6.5" y="3.5" width="14" height="14" rx="2.5"/><path d="M17.5 20.5h-11a3 3 0 0 1-3-3v-11" stroke-linecap="round"/></svg>';
const GLOBE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5z"/></svg>';
const ARROW_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>';
const SPLIT_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M12 4.5v15"/></svg>';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function icon(markup, className) {
  const span = el('span', className);
  span.innerHTML = markup;
  return span;
}

let accentColor = 'rgb(52, 168, 83)';
let folderIconSeq = 0;
function folderIconEl(className, open = false) {
  const a = accentColor;
  const edge = `color-mix(in srgb, ${accentColor} 62%, black)`;
  let svg;
  if (open) {
    const gid = `fg${folderIconSeq++}`;
    const back =
      'M1.44411 3.86858C1.21333 2.63775 2.15758 1.5 3.40985 1.5H7.81325C8.40681 1.5 8.96971 1.76365 9.34969 2.21963L9.40031 2.28037C9.7803 2.73635 10.3432 3 10.9367 3H15.3153C16.2888 3 17.1208 3.70088 17.2862 4.66019L19.0966 15.1602C19.3073 16.3826 18.3661 17.5 17.1257 17.5H5.65985C4.69742 17.5 3.87147 16.8145 3.69411 15.8686L1.44411 3.86858Z';
    const front =
      'M5.59806 7.97376C5.83537 7.10364 6.62569 6.5 7.52759 6.5H19.3815C20.7002 6.5 21.658 7.75396 21.311 9.02623L19.4019 16.0262C19.1646 16.8964 18.3743 17.5 17.4724 17.5H5.6185C4.29975 17.5 3.34199 16.246 3.68897 14.9738L5.59806 7.97376Z';
    svg =
      `<svg viewBox="-3 0 30 19" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="${back}" fill="${a}"></path>` +
      `<path d="${back}" fill="white" fill-opacity="0.7"></path>` +
      `<path d="${back}" fill="url(#${gid}a)" fill-opacity="0.15"></path>` +
      `<path d="${back}" stroke="${edge}" stroke-width="1.5"></path>` +
      `<path d="${front}" fill="white"></path>` +
      `<path d="${front}" fill="url(#${gid}b)" fill-opacity="0.15"></path>` +
      `<path d="${front}" stroke="${edge}" stroke-width="1.5"></path>` +
      `<defs>` +
      `<linearGradient id="${gid}a" x1="13.5" y1="5.8125" x2="13.5" y2="17.5" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"></stop><stop offset="1" stop-color="black"></stop></linearGradient>` +
      `<linearGradient id="${gid}b" x1="12.5" y1="5.49404" x2="12.5" y2="17.5" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"></stop><stop offset="1" stop-color="black"></stop></linearGradient>` +
      `</defs>` +
      `</svg>`;
  } else {
    svg =
      `<svg viewBox="-5 0 30 19" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M1 3.5C1 2.39543 1.89543 1.5 3 1.5H8L10 3.5H15C16.1046 3.5 17 4.39543 17 5.5V15.5C17 16.6046 16.1046 17.5 15 17.5H3C1.89543 17.5 1 16.6046 1 15.5V3.5Z" fill="${a}" fill-opacity="0.55"></path>` +
      `<path d="M1 3.5C1 2.39543 1.89543 1.5 3 1.5H8L10 3.5H15C16.1046 3.5 17 4.39543 17 5.5V15.5C17 16.6046 16.1046 17.5 15 17.5H3C1.89543 17.5 1 16.6046 1 15.5V3.5Z" stroke="${edge}" stroke-width="1.5"></path>` +
      `<path d="M1 8.5C1 7.39543 1.89543 6.5 3 6.5H15C16.1046 6.5 17 7.39543 17 8.5V15.5C17 16.6046 16.1046 17.5 15 17.5H3C1.89543 17.5 1 16.6046 1 15.5V8.5Z" fill="white" fill-opacity="0.9" stroke="${edge}" stroke-width="1.5"></path>` +
      `</svg>`;
  }
  return icon(svg, className);
}

function httpUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {}
  return null;
}

function hostOf(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return '';
  }
}

function toRgb(c) {
  let [r, g, b] = c;
  if (r <= 1 && g <= 1 && b <= 1) {
    r *= 255;
    g *= 255;
    b *= 255;
  }
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return [clamp(r), clamp(g), clamp(b)];
}

function rgb(c, alpha = 1) {
  const [r, g, b] = toRgb(c);
  return alpha === 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${alpha})`;
}

function faviconEl(tab) {
  const image = typeof tab.image === 'string' && /^(https?:\/\/|data:image\/)/i.test(tab.image) ? tab.image : null;
  const host = hostOf(tab.url);
  const src = image ?? (host ? `https://icons.duckduckgo.com/ip3/${host}.ico` : null);
  if (!src) return icon(GLOBE_ICON, 'h-5 w-5 shrink-0 text-zinc-500');
  const img = el('img', 'h-5 w-5 shrink-0 rounded object-contain');
  img.src = src;
  img.alt = '';
  img.loading = 'lazy';
  return img;
}

const ROW = 'flex select-none items-center gap-3 rounded-xl p-2.5 my-1 text-xs leading-[1.15em] text-zinc-800 min-w-0';

function tabRow(tab, onOpen) {
  const href = httpUrl(tab.url);
  const row = el('div', `${ROW.replace('p-2.5', 'py-2.5 px-1.5')} group cursor-pointer font-medium hover:bg-white/25`);
  const fav = faviconEl(tab);
  fav.classList.add('ml-1');
  row.append(fav);
  row.append(el('span', 'min-w-0 flex-1 truncate', tab.label?.trim() || hostOf(tab.url) || tab.url));
  if (href) {
    const arrow = el('a', 'shrink-0 -my-2 rounded-lg p-2 text-zinc-500 opacity-0 hover:bg-black/10 group-hover:opacity-100');
    arrow.append(icon(ARROW_ICON, 'block h-[18px] w-[18px]'));
    arrow.href = href;
    arrow.target = '_blank';
    arrow.rel = 'noopener noreferrer';
    arrow.title = 'Open in a new tab';
    arrow.addEventListener('click', (event) => event.stopPropagation());
    row.append(arrow);
  }
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  const open = () => onOpen(tab, row);
  row.addEventListener('click', open);
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });
  return row;
}

function splitRow(split, onOpen) {
  const row = el('div', `${ROW} group cursor-pointer font-medium hover:bg-white/40`);
  const wrap = el('div', 'flex min-w-0 flex-1 items-center gap-2');
  (split.tabs ?? []).forEach((tab, i) => {
    if (i > 0) wrap.append(el('span', 'h-4 w-px shrink-0 self-center bg-black/15'));
    const chip = el('div', 'flex min-w-0 flex-1 items-center gap-2');
    chip.append(faviconEl(tab));
    chip.append(el('span', 'min-w-0 flex-1 truncate', tab.label?.trim() || hostOf(tab.url) || tab.url));
    wrap.append(chip);
  });
  row.append(wrap);
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  const open = () => onOpen(split, row);
  row.addEventListener('click', open);
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });
  return row;
}

function folderRow(folder, onOpen) {
  const details = el('details');
  const summary = el('summary', `${ROW} cursor-pointer list-none font-semibold hover:bg-white/40 [&::-webkit-details-marker]:hidden h-[40px]`);
  const emoji = folder.icon?.trim();
  const iconClass = 'h-[30px] w-[30px] shrink-0';
  let fico = emoji ? el('span', 'w-[30px] shrink-0 text-center text-2xl', emoji) : folderIconEl(iconClass, false);
  summary.append(fico);
  summary.append(el('span', 'truncate', folder.name));
  details.append(summary);
  const kids = el('div', 'pl-7');
  for (const item of folder.items ?? []) kids.append(itemRow(item, onOpen));
  details.append(kids);
  if (!emoji) {
    details.addEventListener('toggle', () => {
      const next = folderIconEl(iconClass, details.open);
      fico.replaceWith(next);
      fico = next;
    });
  }
  return details;
}

function itemRow(item, onOpen) {
  if (item?.type === 'folder') return folderRow(item, onOpen);
  if (item?.type === 'splitView') return splitRow(item, onOpen);
  return tabRow(item, onOpen);
}

async function fetchPreview(url) {
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    if (!res.ok) return {};
    const { status, data } = await res.json();
    if (status !== 'success' || !data) return {};
    return { host: hostOf(url), title: data.title, description: data.description, image: data.image?.url };
  } catch {
    return {};
  }
}

function siteCardEl(tab, rich = true) {
  const href = httpUrl(tab.url);
  const card = el(
    href ? 'a' : 'span',
    `block w-full ${rich ? 'max-w-[440px]' : 'max-w-[400px]'} overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/10 transition-transform duration-200 hover:scale-[1.02] active:scale-100`,
  );
  if (href) {
    card.href = href;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
  }

  let img;
  let imgWrap;
  if (rich) {
    imgWrap = el('div', 'hidden w-full bg-white');
    img = el('img', 'block max-h-[240px] w-full object-cover');
    img.alt = '';
    img.loading = 'lazy';
    imgWrap.append(img);
    card.append(imgWrap);
  }

  const pad = el('div', rich ? 'p-6' : 'px-7 py-6');
  pad.append(el('span', 'block truncate text-[15px] text-zinc-400', hostOf(tab.url) || 'unknown'));
  const title = el('span', 'mt-2 block text-xl font-semibold leading-snug', tab.label?.trim() || hostOf(tab.url) || tab.url);
  pad.append(title);
  const desc = rich ? el('p', 'mt-3 hidden text-[15px] leading-relaxed text-zinc-600') : null;
  if (desc) pad.append(desc);
  card.append(pad);

  if (rich && href) {
    fetchPreview(tab.url).then((p) => {
      if (p.title) title.textContent = p.title;
      if (p.description) {
        desc.textContent = p.description;
        desc.classList.remove('hidden');
      }
      if (p.image) {
        img.addEventListener('load', () => imgWrap.classList.remove('hidden'));
        img.src = p.image;
      }
    });
  }
  return card;
}

const CONTENT_SHADOW = 'rgba(0, 0, 0, 0.075) 0px 4px 8px';
const HEADER_SHADOW = '0px 3px 5px -2px rgba(0, 0, 0, 0.06)';

function tint(pct) {
  return `color-mix(in srgb, ${accentColor} ${pct}%, rgba(255, 255, 255, 0.8))`;
}

function openLinkEl(tab) {
  const href = httpUrl(tab?.url);
  const open = el(
    href ? 'a' : 'span',
    'group/open -mx-1 flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1 text-[15px] font-medium transition-colors hover:bg-black/[0.06]',
  );
  if (href) {
    open.href = href;
    open.target = '_blank';
    open.rel = 'noopener noreferrer';
  }
  if (tab) open.append(faviconEl(tab));
  open.append(el('span', 'truncate', 'Open this site in a new tab'));
  open.append(
    icon(ARROW_ICON, 'h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-200 group-hover/open:-translate-y-0.5 group-hover/open:translate-x-0.5'),
  );
  return open;
}

function tabHeaderEl(tab) {
  const bar = el('div', 'relative z-10 flex items-center px-4 py-3');
  bar.style.background = `color-mix(in srgb, ${accentColor} 3%, white)`;
  bar.style.boxShadow = HEADER_SHADOW;
  bar.append(openLinkEl(tab));
  return bar;
}

function webContentEl(tab) {
  const panel = el('div', 'flex flex-1 items-center justify-center overflow-hidden rounded-lg p-8');
  panel.style.background = tint(9);
  panel.style.boxShadow = CONTENT_SHADOW;
  if (tab) panel.append(siteCardEl(tab));
  return panel;
}

function emptyViewEl() {
  const inset = el('div', 'flex flex-1 flex-col p-2 pl-0');
  inset.append(webContentEl(null));
  return inset;
}

function splitViewEl(tabs, leftGap = false) {
  const panes = el('div', 'grid min-w-0 flex-1 gap-2 p-2' + (leftGap ? ' pl-0' : ''));
  panes.style.gridTemplateColumns = `repeat(${tabs.length || 1}, minmax(0, 1fr))`;
  for (const tab of tabs) {
    const pane = el('section', 'flex min-w-0 flex-col overflow-hidden rounded-xl');
    pane.style.background = tint(9);
    pane.style.boxShadow = CONTENT_SHADOW;
    pane.append(tabHeaderEl(tab));
    const body = el('div', 'flex flex-1 items-center justify-center p-10');
    body.append(siteCardEl(tab, false));
    pane.append(body);
    panes.append(pane);
  }
  return panes;
}

function makeInlineOpener(panel) {
  let active = null;
  return (entry, row) => {
    if (row && row === active) return;
    if (active) active.classList.remove('bg-white/50');
    if (row) {
      row.classList.add('bg-white/50');
      active = row;
    }
    if (entry.type === 'splitView') {
      panel.replaceChildren(splitViewEl(entry.tabs ?? [], true));
      return;
    }
    const header = tabHeaderEl(entry);
    header.classList.add('!absolute', 'left-0', 'top-0', 'w-full');
    const inset = el('div', 'flex flex-1 flex-col p-2 pl-0');
    inset.append(webContentEl(entry));
    panel.replaceChildren(header, inset);
  };
}

function ensureWinBgStyle() {
  if (document.getElementById('win-bg-style')) return;
  const style = document.createElement('style');
  style.id = 'win-bg-style';
  style.textContent =
    ".win-bg{position:relative}" +
    ".win-bg::before{content:'';position:absolute;inset:0;background:var(--win-bg);opacity:var(--win-op,1);z-index:0;pointer-events:none;outline:1px solid rgba(0,0,0,.2);outline-offset:-1px;border-radius:1rem;}" +
    ".win-bg>*{z-index:1}";
  document.head.append(style);
}

function sidebarFrame({ headerIcon, title, subtitle, sections, frameBackground, panel }) {
  ensureWinBgStyle();
  const frame = el('main', 'win-bg flex h-full overflow-hidden rounded-2xl shadow-2xl shadow-black/20');
  frame.style.setProperty('--win-bg', frameBackground);
  frame.style.setProperty('--win-op', '0.6');

  const side = el('aside', 'flex w-[280px] shrink-0 flex-col');
  const head = el('header', 'flex shrink-0 items-center gap-3 border-b border-black/10 px-[18px] pb-4 pt-5');
  head.append(headerIcon);
  const htext = el('div', 'min-w-0');
  htext.append(el('h1', 'truncate text-[15px] font-bold leading-tight', title));
  htext.append(el('p', 'mt-0.5 truncate text-xs text-muted', subtitle));
  head.append(htext);
  side.append(head);

  const list = el('div', 'min-h-0 flex-1 overflow-y-auto px-2.5 py-2.5');
  sections.filter((s) => s.length).forEach((section, i) => {
    if (i > 0) list.append(el('hr', '-mx-2.5 my-2.5 border-0 border-t border-black/10'));
    for (const row of section) list.append(row);
  });
  side.append(list);
  frame.append(side);
  frame.append(panel);
  return frame;
}

function renderSpace(item, meta) {
  const themed = (item.theme?.gradientColors ?? []).filter((entry) => Array.isArray(entry.c)).slice(0, 3);
  const colors = themed.length ? themed : DEFAULT_THEME_COLORS;
  const primary = colors.find((entry) => entry.isPrimary) ?? colors[0];
  const [c1, c2, c3] = colors;
  const soft = (c) => `color-mix(in srgb, ${rgb(c)} 42%, white)`;
  let frameBackground;
  if (colors.length === 1) {
    frameBackground = soft(c1.c);
  } else {
    const layers = [`linear-gradient(-5deg, ${soft(c1.c)} 10%, transparent 80%)`];
    if (c2) layers.push(`radial-gradient(circle at 0% 0%, ${soft(c2.c)} 10%, transparent 70%)`);
    if (c3) layers.push(`radial-gradient(circle at 95% 0%, ${soft(c3.c)} 0%, transparent 75%)`);
    frameBackground = layers.join(', ');
  }
  document.body.style.background = rgb(primary.c, 0.35);
  accentColor = rgb(primary.c);

  const items = item.items ?? [];
  const panel = el('section', 'flex min-w-0 flex-1 flex-col');
  panel.append(emptyViewEl());
  const openInline = makeInlineOpener(panel);
  const frame = sidebarFrame({
    headerIcon: icon(STACK_ICON, 'h-[22px] w-[22px] shrink-0 text-zinc-700'),
    title: item.name,
    subtitle: meta.name ? `A Space from ${meta.name}` : 'A shared Space',
    sections: [
      items.filter((i) => i?.type === 'folder').map((f) => folderRow(f, openInline)),
      items.filter((i) => i?.type !== 'folder').map((i) => itemRow(i, openInline)),
    ],
    frameBackground,
    panel,
  });
  const wrap = el('div', 'h-screen overflow-hidden p-[44px]');
  wrap.append(frame);
  const holder = document.createDocumentFragment();
  holder.append(wrap, downloadPillEl(`Open this Space in Zen`));
  return holder;
}

function renderFolder(item, meta) {
  document.body.style.background = BRAND_PAGE;
  const emoji = item.icon?.trim();
  const items = item.items ?? [];
  const panel = el('section', 'flex min-w-0 flex-1 flex-col');
  panel.append(emptyViewEl());
  const openInline = makeInlineOpener(panel);
  const frame = sidebarFrame({
    headerIcon: emoji ? el('span', 'shrink-0 text-4xl leading-none', emoji) : folderIconEl('h-[38px] w-[46px] shrink-0', true),
    title: item.name,
    subtitle: meta.name ? `A Folder from ${meta.name}` : 'A shared Folder',
    sections: [items.map((child) => itemRow(child, openInline))],
    frameBackground: BRAND_FRAME,
    panel,
  });
  const wrap = el('div', 'h-screen overflow-hidden p-[44px]');
  wrap.append(frame);
  const holder = document.createDocumentFragment();
  holder.append(wrap, downloadPillEl(`Open this Folder in Zen`));
  return holder;
}

function renderSplitView(item) {
  document.body.style.background = BRAND_PAGE;
  const tabs = item.tabs ?? [];

  const wrap = el('div', 'min-h-screen overflow-hidden p-[44px]');
  const frame = el('main', 'flex h-[calc(100vh-88px)] flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/20');
  frame.style.background = tint(10);
  frame.append(splitViewEl(tabs));
  wrap.append(frame);

  const holder = document.createDocumentFragment();
  holder.append(wrap, downloadPillEl('Open multiple tabs in one view'));
  return holder;
}

function downloadPillEl(message) {
  if (!document.getElementById('share-kf')) {
    const style = document.createElement('style');
    style.id = 'share-kf';
    style.textContent = '@keyframes tryZenIn{from{opacity:0;transform:translate(-50%,24px)}to{opacity:1;transform:translate(-50%,0)}}';
    document.head.append(style);
  }
  const themed = `color-mix(in srgb, ${accentColor} 80%, black)`;
  const pill = el('div', 'fixed bottom-5 left-1/2 z-50 flex items-center gap-3 rounded-2xl py-2 pl-5 pr-2.5 text-[15px] text-white shadow-xl');
  pill.style.background = themed;
  pill.style.animation = 'tryZenIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) 350ms both';
  pill.append(el('span', 'font-extrabold', 'share'));
  pill.append(el('span', 'opacity-60', '❯'));
  pill.append(el('span', '', message));
  const tryBtn = el('a', 'rounded-[10px] bg-white px-5 py-2 font-bold transition-transform duration-150 hover:scale-105 active:scale-95');
  tryBtn.style.color = themed;
  tryBtn.textContent = 'Try Zen';
  tryBtn.href = 'https://zen-browser.app';
  tryBtn.target = '_blank';
  tryBtn.rel = 'noopener noreferrer';
  pill.append(tryBtn);
  return pill;
}

const RENDERERS = { space: renderSpace, folder: renderFolder, splitView: renderSplitView };
const LABELS = { space: 'Space', folder: 'Folder', splitView: 'Split View' };

document.title = share.item.name?.trim() || LABELS[share.type] || 'share';
document.getElementById('app').append(RENDERERS[share.type](share.item, share.meta));
