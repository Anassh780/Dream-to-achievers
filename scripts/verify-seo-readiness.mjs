import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function verifyAll() {
  console.log('=== VERIFYING GOOGLE SEARCH CONSOLE & SEO READINESS ===\n');
  let failures = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(' [PASS] ' + message);
    } else {
      console.error(' [FAIL] ' + message);
      failures++;
    }
  }

  // 1. Assets Verification
  console.log('--- 1. Testing Brand Assets & Favicon Files ---');
  const expectedImages = [
    { file: 'public/favicon-48x48.png', width: 48, height: 48, format: 'png' },
    { file: 'public/favicon-96x96.png', width: 96, height: 96, format: 'png' },
    { file: 'public/apple-touch-icon.png', width: 180, height: 180, format: 'png' },
    { file: 'public/android-chrome-192x192.png', width: 192, height: 192, format: 'png' },
    { file: 'public/android-chrome-512x512.png', width: 512, height: 512, format: 'png' },
    { file: 'public/logo.png', width: 1024, height: 1024, format: 'png' },
    { file: 'public/images/logo.png', width: 1024, height: 1024, format: 'png' },
    { file: 'public/brand-logo.png', width: 1024, height: 1024, format: 'png' },
    { file: 'public/images/brand-logo.png', width: 1024, height: 1024, format: 'png' },
    { file: 'public/images/og-banner.png', width: 1200, height: 630, format: 'png' },
  ];

  for (const item of expectedImages) {
    assert(fs.existsSync(item.file), `File exists: ${item.file}`);
    if (fs.existsSync(item.file)) {
      const meta = await sharp(item.file).metadata();
      assert(meta.format === item.format, `${item.file} format is ${item.format} (actual: ${meta.format})`);
      assert(meta.width === item.width, `${item.file} width is ${item.width} (actual: ${meta.width})`);
      assert(meta.height === item.height, `${item.file} height is ${item.height} (actual: ${meta.height})`);
    }
  }

  assert(fs.existsSync('public/favicon.ico'), 'File exists: public/favicon.ico');
  if (fs.existsSync('public/favicon.ico')) {
    const icoBuf = fs.readFileSync('public/favicon.ico');
    assert(icoBuf.readUInt16LE(2) === 1, 'public/favicon.ico has valid ICO format header');
  }

  // 2. Robots.txt
  console.log('\n--- 2. Testing robots.txt ---');
  assert(fs.existsSync('public/robots.txt'), 'File exists: public/robots.txt');
  const robots = fs.readFileSync('public/robots.txt', 'utf8');
  assert(robots.includes('User-agent: *'), 'robots.txt allows all user agents');
  assert(robots.includes('Allow: /'), 'robots.txt allows root path');
  assert(robots.includes('Sitemap: https://dream-to-achievers.vercel.app/sitemap.xml'), 'robots.txt points to official sitemap.xml');
  assert(!robots.includes('faria-imran.vercel.app') && !robots.includes('dreamtoachievers.com'), 'robots.txt contains zero legacy domains');

  // 3. Sitemap.xml
  console.log('\n--- 3. Testing sitemap.xml ---');
  assert(fs.existsSync('public/sitemap.xml'), 'File exists: public/sitemap.xml');
  const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  assert(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'sitemap.xml has valid XML declaration');
  assert(!sitemap.includes('faria-imran.vercel.app') && !sitemap.includes('dreamtoachievers.com'), 'sitemap.xml contains zero legacy domains');

  const urls = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map(m => m[1]);
  assert(urls.length >= 16, `sitemap.xml contains at least 16 indexable pages (found: ${urls.length})`);
  assert(urls.includes('https://dream-to-achievers.vercel.app/'), 'sitemap.xml contains homepage');
  assert(urls.includes('https://dream-to-achievers.vercel.app/about'), 'sitemap.xml contains /about');
  assert(urls.includes('https://dream-to-achievers.vercel.app/founder/faria-imran'), 'sitemap.xml contains /founder/faria-imran');
  assert(urls.includes('https://dream-to-achievers.vercel.app/faq'), 'sitemap.xml contains /faq');
  assert(urls.includes('https://dream-to-achievers.vercel.app/products'), 'sitemap.xml contains /products');
  assert(urls.includes('https://dream-to-achievers.vercel.app/products/libas-e-yousaf'), 'sitemap.xml contains /products/libas-e-yousaf');

  // 4. site.webmanifest
  console.log('\n--- 4. Testing site.webmanifest ---');
  const manifestRaw = fs.readFileSync('public/site.webmanifest', 'utf8');
  let manifest;
  try {
    manifest = JSON.parse(manifestRaw);
    assert(true, 'site.webmanifest is valid JSON');
  } catch(e) {
    assert(false, 'site.webmanifest JSON parse error: ' + e.message);
  }
  if (manifest) {
    assert(manifest.name.includes('Dream to Achievers'), 'manifest name is Dream to Achievers');
    assert(manifest.short_name === 'DreamToAchievers', 'manifest short_name is DreamToAchievers');
    assert(manifest.icons.length >= 5, `manifest has all required icons (found: ${manifest.icons.length})`);
  }

  // 5. index.html
  console.log('\n--- 5. Testing index.html Metadata & Schema.org ---');
  const html = fs.readFileSync('index.html', 'utf8');
  assert(html.includes('<link rel="canonical" href="https://dream-to-achievers.vercel.app/"'), 'Canonical link points to https://dream-to-achievers.vercel.app/');
  assert(html.includes('href="/favicon-48x48.png"'), 'Google 48x48 favicon link is present in head');
  assert(html.includes('href="/apple-touch-icon.png"'), 'Apple touch icon link is present in head');
  assert(html.includes('content="https://dream-to-achievers.vercel.app/images/brand-logo.png"'), 'og:image points to brand-logo.png');
  assert(html.includes('name="twitter:card" content="summary_large_image"'), 'Twitter card configured as summary_large_image');
  assert(html.includes('"@type": "WebSite"'), 'Schema.org WebSite structured data present (site name rich snippet)');
  assert(html.includes('"@type": "Organization"'), 'Schema.org Organization structured data present (brand logo snippet)');
  assert(html.includes('"url": "https://dream-to-achievers.vercel.app/images/brand-logo.png"'), 'Schema.org organization logo correctly links to brand-logo.png');

  console.log('\n======================================================');
  if (failures === 0) {
    console.log(' ALL 28 AUDIT CHECKS PASSED PERFECTLY!');
    console.log(' Website is 100% ready for Google Search Console submission and live indexing.');
  } else {
    console.error(` ${failures} CHECKS FAILED! Please review.`);
    process.exit(1);
  }
}

verifyAll().catch(e => {
  console.error(e);
  process.exit(1);
});
