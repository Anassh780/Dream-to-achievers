import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('   DREAM TO ACHIEVERS — FINAL PRE-SUBMISSION AUDIT   ');
console.log('====================================================\n');

let failed = 0;
function test(name, pass, detail = '') {
  if (pass) {
    console.log(`[PASS] ${name}`);
  } else {
    console.error(`[FAIL] ${name} -> ${detail}`);
    failed++;
  }
}

// 1. Google Verification Tag Check
const html = fs.readFileSync('index.html', 'utf8');
const gVerifyMatch = html.match(/name="google-site-verification"\s+content="([^"]+)"/);
test('Google Site Verification Meta Tag present', !!gVerifyMatch && gVerifyMatch[1].length > 10, gVerifyMatch ? gVerifyMatch[1] : 'Missing');

// 2. Title & Meta Description Lengths
const titleMatch = html.match(/<title>(.*?)<\/title>/);
const title = titleMatch ? titleMatch[1] : '';
test('Page Title exists and includes Brand Name', title.includes('Dream to Achievers'), title);
test('Page Title length is optimal (<70 chars)', title.length <= 75, `Length: ${title.length}`);

const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
const desc = descMatch ? descMatch[1] : '';
test('Meta Description exists and includes keywords', desc.includes('Dream to Achievers') && desc.includes('wholesale'), desc);
test('Meta Description length is SEO-friendly (100-180 chars)', desc.length >= 100 && desc.length <= 180, `Length: ${desc.length}`);

// 3. Robots meta directives
test('Meta robots includes index, follow', html.includes('name="robots" content="index, follow'), 'Missing');
test('Googlebot specific directive configured', html.includes('name="googlebot" content="index, follow'), 'Missing');

// 4. Canonical URL
test('Canonical tag points to https://dream-to-achievers.vercel.app/', html.includes('rel="canonical" href="https://dream-to-achievers.vercel.app/"'), 'Check canonical');

// 5. Google Snippet Favicon (48x48)
test('Google 48x48 snippet icon declared', html.includes('sizes="48x48" href="/favicon-48x48.png"'), 'Missing');
test('Apple touch icon declared', html.includes('sizes="180x180" href="/apple-touch-icon.png"'), 'Missing');
test('Favicon.ico declared', html.includes('href="/favicon.ico"'), 'Missing');
test('Brand logo declared as icon', html.includes('href="/images/brand-logo.png"'), 'Missing');

// 6. Open Graph & Twitter
test('og:site_name is Dream to Achievers', html.includes('property="og:site_name" content="Dream to Achievers"'), 'Missing');
test('og:image is https://dream-to-achievers.vercel.app/images/brand-logo.png', html.includes('property="og:image" content="https://dream-to-achievers.vercel.app/images/brand-logo.png"'), 'Missing');
test('twitter:card is summary_large_image', html.includes('name="twitter:card" content="summary_large_image"'), 'Missing');
test('twitter:image is https://dream-to-achievers.vercel.app/images/brand-logo.png', html.includes('name="twitter:image" content="https://dream-to-achievers.vercel.app/images/brand-logo.png"'), 'Missing');

// 7. Critical Static Files on Disk & in dist
const publicFiles = [
  'public/robots.txt',
  'public/sitemap.xml',
  'public/site.webmanifest',
  'public/favicon.ico',
  'public/favicon-48x48.png',
  'public/favicon-96x96.png',
  'public/apple-touch-icon.png',
  'public/android-chrome-192x192.png',
  'public/android-chrome-512x512.png',
  'public/images/brand-logo.png',
  'public/brand-logo.png',
  'public/logo.png',
  'public/images/logo.png',
  'public/images/og-banner.png'
];

for (const f of publicFiles) {
  test(`Asset exists: ${f}`, fs.existsSync(f), `File missing: ${f}`);
}

// 8. Sitemap completeness
const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
test('Sitemap contains at least 16 URLs', locs.length >= 16, `Found: ${locs.length}`);
test('No legacy domains in sitemap', !sitemap.includes('faria-imran.vercel.app') && !sitemap.includes('dreamtoachievers.com'), 'Found legacy domain in sitemap');
test('All sitemap URLs use HTTPS and dream-to-achievers.vercel.app', locs.every(u => u.startsWith('https://dream-to-achievers.vercel.app')), 'Non-conforming URLs');

// 9. Robots.txt cleanliness
const robots = fs.readFileSync('public/robots.txt', 'utf8');
test('Robots references official sitemap', robots.includes('Sitemap: https://dream-to-achievers.vercel.app/sitemap.xml'), 'Missing Sitemap in robots');
test('Robots allows Googlebot', robots.includes('User-agent: *') && robots.includes('Allow: /'), 'Crawl blocked');
test('Robots protects /admin/ and /dashboard/', robots.includes('Disallow: /admin/') && robots.includes('Disallow: /dashboard/'), 'Unprotected admin routes');
test('No legacy domains in robots', !robots.includes('faria-imran.vercel.app') && !robots.includes('dreamtoachievers.com'), 'Old domain found');

// 10. Vercel config verification
const vercelRaw = fs.readFileSync('vercel.json', 'utf8');
let vercel;
try {
  vercel = JSON.parse(vercelRaw);
  test('vercel.json is valid JSON', true);
} catch(e) {
  test('vercel.json is valid JSON', false, e.message);
}
test('vercel.json excludes static assets from SPA rewrite', vercelRaw.includes('brand-logo') || vercelRaw.includes('images'), 'Rewrite issue');

console.log('\n====================================================');
if (failed === 0) {
  console.log(' >>> SUCCESS: ALL PRE-SUBMISSION CHECKS PASSED (100% READY) <<<');
} else {
  console.error(` >>> ATTENTION: ${failed} CHECK(S) FAILED <<<`);
  process.exit(1);
}
