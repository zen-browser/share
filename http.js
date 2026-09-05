const encoder = new TextEncoder();

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function htmlResponse(status, markup) {
  return new Response(markup, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy':
        "default-src 'none'; script-src 'self' https://cdn.tailwindcss.com; img-src https: http: data:; style-src 'unsafe-inline'; connect-src https://api.microlink.io",
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
    },
  });
}

export function concatStreams(parts) {
  let index = 0;
  let reader = null;
  return new ReadableStream({
    async pull(controller) {
      for (;;) {
        if (reader) {
          const { done, value } = await reader.read();
          if (!done) {
            controller.enqueue(value);
            return;
          }
          reader = null;
          continue;
        }
        if (index >= parts.length) {
          controller.close();
          return;
        }
        const part = parts[index];
        index += 1;
        if (typeof part === 'string') {
          controller.enqueue(encoder.encode(part));
          return;
        }
        reader = part.getReader();
      }
    },
    cancel(reason) {
      return reader?.cancel(reason);
    },
  });
}

export async function readBody(request, maxBodyBytes) {
  const tooLarge = new HttpError(413, `share data exceeds the ${maxBodyBytes} byte limit`);
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBodyBytes) throw tooLarge;
  if (!request.body) return { text: '', size: 0 };

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
      await reader.cancel().catch(() => {});
      throw tooLarge;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { text: new TextDecoder().decode(bytes), size };
}
