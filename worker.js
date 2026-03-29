const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8'
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/enquiry') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            allow: 'POST, OPTIONS'
          }
        });
      }

      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed' }, 405);
      }

      const endpoint = String(env.PUBLIC_ENQUIRY_ENDPOINT || '').trim();
      if (!endpoint) {
        return json({ ok: false, error: 'Missing Cloudflare variable: PUBLIC_ENQUIRY_ENDPOINT' }, 500);
      }

      let payload;
      try {
        payload = await request.json();
      } catch {
        return json({ ok: false, error: 'Invalid JSON body' }, 400);
      }

      let upstreamResponse;
      try {
        upstreamResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            ...payload,
            secret: String(env.ENQUIRY_WEBHOOK_SECRET || '').trim()
          })
        });
      } catch (error) {
        return json(
          {
            ok: false,
            error: `Failed to reach Apps Script endpoint: ${error instanceof Error ? error.message : String(error)}`
          },
          502
        );
      }

      const rawBody = await upstreamResponse.text();
      let parsed;
      try {
        parsed = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        parsed = null;
      }

      if (!upstreamResponse.ok) {
        return json(
          {
            ok: false,
            error: parsed?.error || `Apps Script returned HTTP ${upstreamResponse.status}`,
            upstreamStatus: upstreamResponse.status
          },
          upstreamResponse.status
        );
      }

      if (!parsed || typeof parsed !== 'object') {
        return json({ ok: false, error: 'Apps Script returned a non-JSON success response' }, 502);
      }

      return json(parsed, 200);
    }

    return env.ASSETS.fetch(request);
  }
};
