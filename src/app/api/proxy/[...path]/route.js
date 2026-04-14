const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tiketapp-api.icydune-2fcf3dd1.germanywestcentral.azurecontainerapps.io';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(request, { params }) {
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(request, { params }) {
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(request, { params }) {
  return proxyRequest(request, params.path, 'DELETE');
}

export async function PATCH(request, { params }) {
  return proxyRequest(request, params.path, 'PATCH');
}

async function proxyRequest(request, pathSegments, method) {
  try {
    const path = '/' + (Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments);
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const backendUrl = `${BACKEND.replace(/\/$/, '')}${path}${query ? '?' + query : ''}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    const options = { method, headers, cache: 'no-store', signal: controller.signal };
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const body = await request.text();
        if (body) options.body = body;
      } catch (_) {}
    }

    const res = await fetch(backendUrl, options);
    clearTimeout(timeoutId);
    const data = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';

    return new Response(data, {
      status: res.status,
      statusText: res.statusText,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ message: err.message || 'Proxy request failed', error: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
