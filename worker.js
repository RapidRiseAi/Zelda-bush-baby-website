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

      const endpoint = env.PUBLIC_ENQUIRY_ENDPOINT;
      if (!endpoint) {
        return json({ ok: false, error: 'Enquiry endpoint is not configured' }, 500);
      }

      let payload;
      try {
        payload = await request.json();
      } catch {
        return json({ ok: false, error: 'Invalid JSON body' }, 400);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          secret: env.ENQUIRY_WEBHOOK_SECRET || ''
        })
      });

      return new Response(await response.text(), {
        status: response.status,
        headers: JSON_HEADERS
      });
    }

    return env.ASSETS.fetch(request);
  }
};
