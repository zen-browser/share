import { createApp } from './app.js';
import { renderOg } from './og.js';
import template from './template.html';

const KV_VALUE_LIMIT = 25 * 1024 * 1024;
const MIN_KV_TTL_SECONDS = 60;

function kvStorage(kv) {
  const key = (id) => `share:${id}`;
  return {
    async readText(id) {
      const { value, metadata } = await kv.getWithMetadata(key(id), { type: 'text' });
      return value == null ? null : { text: value, meta: metadata ?? {} };
    },
    async write(id, text, meta, ttlSeconds) {
      const options = { metadata: meta };
      if (ttlSeconds != null) options.expirationTtl = Math.max(MIN_KV_TTL_SECONDS, ttlSeconds);
      await kv.put(key(id), text, options);
    },
    async remove(id) {
      await kv.delete(key(id));
    },
  };
}

let app;

export default {
  async fetch(request, env, ctx) {
    if (!env.API_KEY) {
      return new Response(JSON.stringify({ error: 'server misconfigured: set the API_KEY secret' }), {
        status: 500,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }
    app ??= createApp({
      apiKey: env.API_KEY,
      secretKeys: (env.SECRET_KEYS ?? '').split(',').map((key) => key.trim()).filter(Boolean),
      maxBodyBytes: Math.min(Number(env.MAX_BODY_BYTES ?? KV_VALUE_LIMIT), KV_VALUE_LIMIT),
      retentionDays: Number(env.RETENTION_DAYS ?? 30),
      storage: kvStorage(env.SHARES),
      template,
      renderOg,
      rateLimit: env.CREATE_LIMIT ? async (key) => (await env.CREATE_LIMIT.limit({ key })).success : null,
    });

    const cacheable = request.method === 'GET';
    const cache = caches.default;
    if (cacheable) {
      const hit = await cache.match(request);
      if (hit) return hit;
    }
    const response = await app(request);
    if (cacheable && response.status === 200 && /max-age=[1-9]/.test(response.headers.get('cache-control') ?? '')) {
      ctx.waitUntil(cache.put(request, response.clone()));
    }
    return response;
  },
};
