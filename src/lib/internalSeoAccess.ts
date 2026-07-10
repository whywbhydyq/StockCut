export function internalSeoEnabled() {
  return process.env.ENABLE_INTERNAL_SEO_ENDPOINTS === '1';
}

export function internalSeoUnavailable() {
  return Response.json(
    { error: 'Not found' },
    {
      status: 410,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow, noarchive'
      }
    }
  );
}
