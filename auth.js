
const encoder = new TextEncoder();

export async function keysMatch(candidate, expected) {
  if (candidate == null || expected == null) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(String(candidate))),
    crypto.subtle.digest('SHA-256', encoder.encode(String(expected))),
  ]);
  const bytesA = new Uint8Array(a);
  const bytesB = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < bytesA.length; i += 1) diff |= bytesA[i] ^ bytesB[i];
  return diff === 0;
}

export async function matchesAny(candidate, keys) {
  let matched = false;
  for (const key of keys) matched = (await keysMatch(candidate, key)) || matched;
  return matched;
}
