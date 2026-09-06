import { keysMatch, matchesAny } from './auth.js';
import { concatStreams, htmlResponse, HttpError, jsonResponse, readBody } from './http.js';
import { renderSharePage } from './render.js';
import { validateShare } from './validate.js';

const HOME_REDIRECT = 'https://zen-browser.app/download';
const NOT_FOUND_REDIRECT = 'https://zen-browser.app/404';

export const TYPE_SLUGS = {
  space: 'space',
  folder: 'folder',
  splitView: 'split',
};

const SLUG_TO_TYPE = {
  space: 'space',
  folder: 'folder',
  'split-view': 'splitView',
  split: 'splitView',
};

const MAX_NAME_LENGTH = 200;
const MAX_META_BYTES = 1000;

const ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ID_PATTERN = /^[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}$/;

const encoder = new TextEncoder();

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let id = '';
  for (let i = 0; i < bytes.length; i += 1) {
    if (i === 4 || i === 8 || i === 12) id += '-';
    id += ID_ALPHABET[bytes[i] & 31];
  }
  return id;
}

function normalizeId(value) {
  return ID_PATTERN.test(value) ? value.toUpperCase() : null;
}

export function createApp(options) {
  const {
    apiKey,
    secretKeys = [],
    storage,
    template,
    maxBodyBytes = 25 * 1024 * 1024,
    retentionDays = 30,
    rateLimit = null,
  } = options;

  if (!apiKey) throw new Error('apiKey is required');
  if (!storage) throw new Error('storage is required');
  if (!template) throw new Error('template is required');
  if (!Number.isFinite(maxBodyBytes) || maxBodyBytes <= 0) throw new Error('maxBodyBytes must be a positive number');
  if (!Number.isFinite(retentionDays) || retentionDays < 0) throw new Error('retentionDays must be a non-negative number');

  async function getLive(id, read) {
    const record = await read(id);
    if (!record) return null;
    const expiresAt = record.meta?.expiresAt;
    if (expiresAt != null && Date.parse(expiresAt) <= Date.now()) {
      if (record.stream) await record.stream.cancel().catch(() => {});
      await storage.remove(id);
      return null;
    }
    return record;
  }

  async function handleCreate(request, url, permanent) {
    const rawName = url.searchParams.get('name');
    const name = rawName == null ? null : rawName.trim() || null;
    if (name != null && name.length > MAX_NAME_LENGTH) {
      throw new HttpError(400, `name must be at most ${MAX_NAME_LENGTH} characters`);
    }

    const body = await readBody(request, maxBodyBytes);
    let data;
    try {
      data = JSON.parse(body.text);
    } catch {
      throw new HttpError(400, 'request body must be valid JSON');
    }
    const validationError = validateShare(data);
    if (validationError) throw new HttpError(422, validationError);

    const id = randomId();
    const now = new Date();
    const meta = {
      id,
      name,
      createdAt: now.toISOString(),
      expiresAt: permanent ? null : new Date(now.getTime() + retentionDays * 86_400_000).toISOString(),
      size: body.size,
    };
    if (encoder.encode(JSON.stringify(meta)).byteLength > MAX_META_BYTES) {
      throw new HttpError(400, 'name is too long to store');
    }

    await storage.write(id, body.text, meta, permanent ? null : Math.round(retentionDays * 86_400));

    const slug = TYPE_SLUGS[data.shared[0].type];
    return jsonResponse(201, {
      ...meta,
      url: `/api/shares/${id}`,
      webUrl: `/${slug}/${id}`,
      dataUrl: `/${slug}/${id}/data`,
    });
  }

  async function handleApiGet(id) {
    const record = await getLive(id, storage.readStream);
    if (!record) throw new HttpError(404, 'share not found');
    const meta = record.meta ?? {};
    const head =
      `{"id":${JSON.stringify(meta.id ?? id)},"name":${JSON.stringify(meta.name ?? null)},` +
      `"createdAt":${JSON.stringify(meta.createdAt ?? null)},"expiresAt":${JSON.stringify(meta.expiresAt ?? null)},` +
      `"size":${JSON.stringify(meta.size ?? null)},"data":`;
    return new Response(concatStreams([head, record.stream, '}']), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  function cacheControl(meta) {
    const cap = 3600;
    const remaining = meta?.expiresAt ? Math.floor((Date.parse(meta.expiresAt) - Date.now()) / 1000) : cap;
    return `public, max-age=${Math.max(0, Math.min(cap, remaining))}`;
  }

  async function handlePage(typeKey, id, slug) {
    const record = await getLive(id, storage.readText);
    if (!record) return Response.redirect(NOT_FOUND_REDIRECT, 302);
    let doc;
    try {
      doc = JSON.parse(record.text);
    } catch {
      return Response.redirect(NOT_FOUND_REDIRECT, 302);
    }
    const item = (doc.shared ?? []).find((entry) => entry?.type === typeKey);
    if (!item) return Response.redirect(NOT_FOUND_REDIRECT, 302);
    const res = htmlResponse(200, renderSharePage(template, typeKey, item, record.meta ?? {}, `/${slug}/${id}/data`));
    res.headers.set('cache-control', cacheControl(record.meta));
    return res;
  }

  async function handleData(id) {
    const record = await getLive(id, storage.readStream);
    if (!record) throw new HttpError(404, 'share not found');
    return new Response(record.stream, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'access-control-allow-origin': '*',
        'cache-control': cacheControl(record.meta),
      },
    });
  }

  return async function app(request) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/') return Response.redirect(HOME_REDIRECT, 302);
      if (request.method === 'GET' && url.pathname === '/health') return jsonResponse(200, { ok: true });

      const publicMatch = url.pathname.match(/^\/([a-z-]+)\/([0-9A-Za-z-]{4,64})(\/data)?$/);
      if (request.method === 'GET' && publicMatch && SLUG_TO_TYPE[publicMatch[1]]) {
        const id = normalizeId(publicMatch[2]);
        if (!id) {
          if (publicMatch[3]) throw new HttpError(404, 'share not found');
          return Response.redirect(NOT_FOUND_REDIRECT, 302);
        }
        if (publicMatch[3]) return await handleData(id);
        return await handlePage(SLUG_TO_TYPE[publicMatch[1]], id, publicMatch[1]);
      }

      if (!url.pathname.startsWith('/api/')) return Response.redirect(NOT_FOUND_REDIRECT, 302);

      const secretKey = request.headers.get('x-secret-key');
      let viaSecretKey = false;
      if (secretKey != null) {
        viaSecretKey = await matchesAny(secretKey, secretKeys);
        if (!viaSecretKey) throw new HttpError(403, 'invalid secret key');
      } else if (!(await keysMatch(request.headers.get('x-api-key'), apiKey))) {
        throw new HttpError(401, 'invalid or missing API key');
      }

      if (request.method === 'POST' && url.pathname === '/api/shares') {
        if (!viaSecretKey && rateLimit) {
          const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
          if (!(await rateLimit(`create:${ip}`))) {
            throw new HttpError(429, 'too many shares created, try again in a minute');
          }
        }
        return await handleCreate(request, url, viaSecretKey);
      }
      const match = url.pathname.match(/^\/api\/shares\/([^/]+)$/);
      const id = match ? normalizeId(match[1]) : null;
      if (id && request.method === 'GET') return await handleApiGet(id);
      throw new HttpError(404, 'not found');
    } catch (error) {
      if (error instanceof HttpError) return jsonResponse(error.status, { error: error.message });
      console.error(error);
      return jsonResponse(500, { error: 'internal server error' });
    }
  };
}
