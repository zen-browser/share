export function renderSharePage(template, typeKey, item, meta, ogTags = '') {
  const payload = { type: typeKey, item, meta };
  const data = JSON.stringify(payload).replaceAll('<', '\\u003c');
  return template.replace('{{data}}', () => data).replace('</head>', () => `${ogTags}</head>`);
}
