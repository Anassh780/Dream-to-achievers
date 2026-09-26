import { SITE_URL, escapeHtml, getActiveProducts, send } from '../server/seo-utils.js';

function replaceTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `${replacement}\n</head>`);
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || '').trim();
  if (!slug) return send(res, 404, 'text/plain; charset=utf-8', 'Product not found', 'no-store');

  try {
    const products = await getActiveProducts();
    const product = products.find((item) => item.slug === slug);
    if (!product) return send(res, 404, 'text/html; charset=utf-8', '<!doctype html><title>Product not found</title><h1>Product not found</h1>', 'no-store');

    const origin = `https://${req.headers.host}`;
    const shellResponse = await fetch(`${origin}/`);
    let html = await shellResponse.text();
    const name = escapeHtml(product.name || slug.replace(/-/g, ' '));
    const shortDescription = escapeHtml(product.shortDescription || product.description || 'Verified wholesale product for online resellers in Pakistan.');
    const canonical = `${SITE_URL}/products/${encodeURIComponent(slug)}`;
    const title = `${name} Wholesale Price Pakistan | Dream to Achievers`;
    const description = `${shortDescription} Buy at wholesale rates for online reselling in Pakistan with nationwide cash on delivery fulfillment.`.slice(0, 160);
    const image = escapeHtml(product.imageUrl || `${SITE_URL}/images/og-banner.png`);
    const price = Number(product.retailPrice || product.suggestedSellingPrice || 0);
    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name || slug,
      image: product.imageUrl ? [product.imageUrl] : undefined,
      description: product.description || product.shortDescription,
      sku: product.sku,
      brand: { '@type': 'Brand', name: 'Dream to Achievers' },
      offers: {
        '@type': 'Offer', url: canonical, priceCurrency: product.currency || 'PKR',
        price, availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'Dream to Achievers' },
      },
    }).replace(/</g, '\\u003c');

    html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    html = replaceTag(html, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${description}" />`);
    html = replaceTag(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" id="canonical-url" />`);
    html = replaceTag(html, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${title}" />`);
    html = replaceTag(html, /<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${description}" />`);
    html = replaceTag(html, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
    html = replaceTag(html, /<meta\s+property="og:type"[^>]*>/i, '<meta property="og:type" content="product" />');
    html = replaceTag(html, /<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${image}" />`);
    html = html.replace('</head>', `<script type="application/ld+json">${schema}</script>\n</head>`);
    html = html.replace('<div id="root"></div>', `<div id="root"><main><h1>${name}</h1><p>${shortDescription}</p><p>Wholesale products for resellers in Pakistan with nationwide COD fulfillment by <a href="${SITE_URL}/">Dream to Achievers</a>.</p><a href="${SITE_URL}/products">Browse the wholesale product catalog</a></main></div>`);

    send(res, 200, 'text/html; charset=utf-8', html, 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  } catch (error) {
    send(res, 503, 'text/plain; charset=utf-8', `Product page temporarily unavailable: ${error.message}`, 'no-store');
  }
}
