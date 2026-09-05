// The share page template — deliberately minimal, edit away.
//
// renderSharePage(typeKey, item, meta, dataUrl) receives:
//   typeKey  'space' | 'folder' | 'splitView'
//   item     the matched item from the share document (see schema.json)
//   meta     { id, name, createdAt, expiresAt, size } — name is the sharer's name
//   dataUrl  path to the raw JSON of this share
// and must return a full HTML page as a string.
//
// Keep escapeHtml()/safeHttpUrl() around whatever you build: these pages are
// public and render user-supplied data. Pages ship with a strict CSP (no
// scripts) set in app.js — loosen it there if your template needs JS.

const TYPE_LABELS = { space: 'Space', folder: 'Folder', splitView: 'Split View' };

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeHttpUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {
    /* not a URL */
  }
  return null;
}

// Tabs become links, folders become nested lists.
function itemsHtml(items) {
  const rows = (items ?? []).map((item) => {
    if (item?.type === 'folder') {
      const icon = item.icon?.trim() ? escapeHtml(item.icon.trim()) : '&#128193;';
      return `<li class="folder">${icon} ${escapeHtml(item.name)}${itemsHtml(item.items)}</li>`;
    }
    const label = escapeHtml(item.label?.trim() || item.url);
    const href = safeHttpUrl(item.url);
    return `<li>${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a>` : label}</li>`;
  });
  return rows.length ? `<ul>${rows.join('')}</ul>` : '<p class="empty">Nothing in here.</p>';
}

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body{font-family:system-ui,sans-serif;background:#f5f3fa;color:#1c1b22;margin:0;display:flex;justify-content:center;padding:48px 16px}
main{background:#fff;border-radius:12px;box-shadow:0 4px 24px rgb(0 0 0 / .08);padding:32px 40px;max-width:640px;width:100%}
h1{margin:0;font-size:22px}
.from{margin:4px 0 20px;color:#777;font-size:14px}
ul{list-style:none;padding-left:0;margin:0}
ul ul{padding-left:22px;margin-top:6px}
li{margin:6px 0;font-weight:500;overflow-wrap:anywhere}
li.folder{font-weight:600}
a{color:#3634e0;text-decoration:none}
a:hover{text-decoration:underline}
.empty{color:#999;font-size:14px}
.foot{margin-top:24px;font-size:13px}
.foot a{color:#999}
</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function renderSharePage(typeKey, item, meta, dataUrl) {
  const label = TYPE_LABELS[typeKey] ?? 'Share';
  const title = item.name?.trim() || label;
  const from = meta.name ? `A ${label} from ${escapeHtml(meta.name)}` : `A shared ${label}`;
  const items = typeKey === 'splitView' ? item.tabs : item.items;
  return page(
    title,
    `<main>
  <h1>${escapeHtml(title)}</h1>
  <p class="from">${from}</p>
  ${itemsHtml(items)}
  <p class="foot"><a href="${escapeHtml(dataUrl)}">raw JSON</a></p>
</main>`,
  );
}
