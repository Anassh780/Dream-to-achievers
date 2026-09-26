import { SITE_URL, escapeXml, getActiveProducts, send } from '../server/seo-utils.js';

const STATIC_PAGES = [
  ['/', 'daily', '1.0'],
  ['/products', 'daily', '0.9'],
  ['/how-it-works', 'weekly', '0.9'],
  ['/about', 'monthly', '0.8'],
  ['/founder/faria-imran', 'monthly', '0.8'],
  ['/ranks', 'weekly', '0.8'],
  ['/services', 'weekly', '0.8'],
  ['/faq', 'weekly', '0.8'],
  ['/contact', 'monthly', '0.6'],
  ['/terms', 'yearly', '0.3'],
  ['/privacy', 'yearly', '0.3'],
  ['/disclaimer', 'yearly', '0.3'],
];

function entry(path, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export default async function handler(_req, res) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const products = await getActiveProducts();
    const staticEntries = STATIC_PAGES.map(([path, frequency, priority]) =>
      entry(path, today, frequency, priority)
    );
    const productEntries = products.map((product) => {
      const modified = String(product.updatedAt || product.createdAt || product.updateTime || today).slice(0, 10);
      return entry(`/products/${encodeURIComponent(product.slug)}`, modified, 'weekly', '0.8');
    });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...productEntries].join('\n')}\n</urlset>\n`;
    send(res, 200, 'application/xml; charset=utf-8', xml, 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  } catch (error) {
    send(res, 503, 'text/plain; charset=utf-8', `Sitemap temporarily unavailable: ${error.message}`, 'no-store');
  }
}
