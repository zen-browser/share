
import { createApp } from './app.js';

const KV_VALUE_LIMIT = 25 * 1024 * 1024; // KV's hard cap per value
const MIN_KV_TTL_SECONDS = 60; // KV rejects TTLs under a minute

function kvStorage(kv) {
  const key = (id) => `share:${id}`;
  return {
    async readText(id) {
      const { value, metadata } = await kv.getWithMetadata(key(id), { type: 'text' });
      return value == null ? null : { text: value, meta: metadata ?? {} };
    },
    async readStream(id) {
      const { value, metadata } = await kv.getWithMetadata(key(id), { type: 'stream' });
      return value == null ? null : { stream: value, meta: metadata ?? {} };
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
  fetch(request, env) {
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
      rateLimit: env.CREATE_LIMIT ? async (key) => (await env.CREATE_LIMIT.limit({ key })).success : null,
    });
    return app(request);
  },
};
