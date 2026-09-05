const share = JSON.parse(document.getElementById('share-data').textContent);

const LABELS = { space: 'Space', folder: 'Folder', splitView: 'Split View' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function httpUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {}
  return null;
}

function renderItems(items, nested) {
  const list = el('ul', nested ? 'mt-1 list-none pl-5' : 'mt-6 list-none');
  for (const item of items ?? []) {
    if (item?.type === 'folder') {
      const row = el('li', 'mt-2 font-semibold', `${item.icon?.trim() || '\u{1F4C1}'} ${item.name}`);
      row.append(renderItems(item.items, true));
      list.append(row);
      continue;
    }
    const row = el('li', 'mt-1.5');
    const label = item.label?.trim() || item.url;
    const href = httpUrl(item.url);
    if (href) {
      const link = el('a', 'font-medium break-words text-indigo-600 hover:underline', label);
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      row.append(link);
    } else {
      row.textContent = label;
    }
    list.append(row);
  }
  return list;
}

const label = LABELS[share.type] ?? 'Share';
const title = share.item.name?.trim() || label;
const items = share.type === 'splitView' ? share.item.tabs : share.item.items;

document.title = title;
const app = document.getElementById('app');
app.append(el('h1', 'text-2xl font-bold', title));
app.append(el('p', 'mt-1 text-sm text-zinc-500', share.meta.name ? `A ${label} from ${share.meta.name}` : `A shared ${label}`));
app.append(items?.length ? renderItems(items) : el('p', 'mt-6 text-sm text-zinc-400', 'Nothing in here.'));
const foot = el('p', 'mt-10 text-xs');
const raw = el('a', 'text-zinc-400 hover:underline', 'raw JSON');
raw.href = share.dataUrl;
foot.append(raw);
app.append(foot);
