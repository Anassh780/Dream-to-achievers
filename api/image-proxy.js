export default async function handler(req, res) {
  const rawUrl = String(req.query.url || '').trim();
  if (!rawUrl) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Missing url parameter');
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Invalid url parameter');
    return;
  }

  try {
    // Spoof same-origin Referer and omit Origin header so anti-hotlink CDNs
    // (such as img.sanishtech.com, cdn.phototourl.com, etc.) serve the real image bytes
    const upstream = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Referer: `${parsedUrl.origin}/`,
      },
      redirect: 'follow',
    });

    if (!upstream.ok) {
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`Upstream image returned ${upstream.status}`);
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(buffer);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Failed to proxy image: ${err.message || 'Unknown error'}`);
  }
}
