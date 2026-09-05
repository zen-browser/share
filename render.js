
export function renderSharePage(template, typeKey, item, meta, dataUrl) {
  const payload = { type: typeKey, item, meta, dataUrl };
  // <-escape so user data can never close the script tag.
  const data = JSON.stringify(payload).replaceAll('<', '\\u003c');
  return template.replace('{{data}}', () => data);
}
