// Cloudflare Worker — sharon-todo-proxy
// Deploy at https://dash.cloudflare.com → Workers & Pages → sharon-todo-proxy → Edit code

// KV namespace binding name: TODO_KV
// Add via Worker settings → KV Namespace Bindings → Variable name: TODO_KV

// Owntracks HTTP mode config:
// Host: https://sharon-todo-proxy.sharon5234.workers.dev
// Path: /owntracks
// Identification → Username: sharon  Password: <your-passcode>

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Owntracks-*'
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // ── Existing: GET / — read all data ──
  if (method === 'GET' && (url.pathname === '/' || url.pathname === '')) {
    const data = await KV.get('todo_data', 'json') || {};
    return new Response(JSON.stringify({
      todos: data.todos || [],
      habits: data.habits || {},
      commute: data.commute || {}
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }

  // ── Existing: PUT / — write todos/habits ──
  if (method === 'PUT' && (url.pathname === '/' || url.pathname === '')) {
    const body = await request.json();
    const existing = await KV.get('todo_data', 'json') || {};
    const merged = { ...existing, ...body };
    await KV.put('todo_data', JSON.stringify(merged));
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }

  // ── New: POST /owntracks — accept Owntracks location pings ──
  if (method === 'POST' && url.pathname === '/owntracks') {
    // Basic auth check using query param `key` or passcode
    const key = url.searchParams.get('key');
    if (key !== 'sharonsantos') {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    let payload;
    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('json')) {
      payload = await request.json();
    } else {
      // Owntracks can send JSON body
      payload = await request.json();
    }

    // Only store location type
    if (payload._type === 'location') {
      const tst = payload.tst; // Unix timestamp from device
      const date = new Date(tst * 1000);
      const dateKey = `locations:${date.toISOString().split('T')[0]}`;

      const entry = {
        lat: payload.lat,
        lon: payload.lon,
        alt: payload.alt || 0,
        vel: payload.vel || 0,
        batt: payload.batt || 0,
        tst: tst,
        conn: payload.conn || 'w',
        acc: payload.acc || payload.vac || 0,
        tid: payload.tid || '',
        inregions: payload.inregions || [],
        inrids: payload.inrids || []
      };

      // Get existing points for this date, append
      const existingPoints = await KV.get(dateKey, 'json') || [];
      existingPoints.push(entry);
      await KV.put(dateKey, JSON.stringify(existingPoints));
    }

    // Also store waypoints/regions as geofences
    if (payload._type === 'waypoint' || payload._type === 'region') {
      const regionsKey = 'locations:regions';
      const existing = await KV.get(regionsKey, 'json') || [];
      const waypoint = {
        lat: payload.lat,
        lon: payload.lon,
        rad: payload.rad || 100,
        name: payload.desc || payload.tid || 'unknown',
        tst: payload.tst || Math.floor(Date.now() / 1000)
      };
      existing.push(waypoint);
      await KV.put(regionsKey, JSON.stringify(existing));
    }

    // Send the usual Owntracks response
    return new Response(JSON.stringify({ result: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // ── New: GET /api/locations — get location data for dashboard ──
  if (method === 'GET' && url.pathname === '/api/locations') {
    const key = url.searchParams.get('key');
    if (key !== 'sharonsantos') {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const dateParam = url.searchParams.get('date');
    const daysBack = parseInt(url.searchParams.get('days')) || 1;

    if (dateParam) {
      const data = await KV.get(`locations:${dateParam}`, 'json') || [];
      return new Response(JSON.stringify({ date: dateParam, points: data }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Return recent days
    const result = {};
    const now = new Date();
    for (let i = 0; i < daysBack; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `locations:${d.toISOString().split('T')[0]}`;
      const data = await KV.get(key, 'json') || [];
      if (data.length > 0) {
        result[key.replace('locations:', '')] = data;
      }
    }

    return new Response(JSON.stringify({ days: result }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}
