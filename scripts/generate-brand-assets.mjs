import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const imagesDir = path.resolve('public/images');
const brandLogoPath = path.join(imagesDir, 'brand-logo.png');

async function buildBrandAssets() {
  console.log('--- Generating Official Brand Assets & Favicon Suite ---');

  if (!fs.existsSync(brandLogoPath)) {
    throw new Error('Base brand logo not found at ' + brandLogoPath);
  }

  // 1. Ensure public/logo.png & public/images/logo.png are TRUE 1024x1024 PNGs
  console.log('1. Converting full brand logo to authentic 1024x1024 PNG...');
  const brandFileBuffer = fs.readFileSync(brandLogoPath);
  const fullBrandBuffer = await sharp(brandFileBuffer)
    .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'logo.png'), fullBrandBuffer);
  fs.writeFileSync(path.join(imagesDir, 'logo.png'), fullBrandBuffer);
  fs.writeFileSync(path.join(imagesDir, 'brand-logo.png'), fullBrandBuffer);
  console.log('  -> Updated public/logo.png & public/images/logo.png (True PNG)');

  // 2. Crop the Emblem Mark for square icons and favicons
  // Bounding box of emblem: minX: 269, maxX: 809, minY: 159, maxY: 718 (w: 540, h: 559)
  console.log('2. Extracting emblem mark for Google Favicon suite...');
  const emblemCrop = await sharp(brandFileBuffer)
    .extract({ left: 240, top: 130, width: 600, height: 600 })
    .toBuffer();

  // Create a beautifully padded square icon on white background
  const createPaddedIcon = async (size) => {
    const innerSize = Math.round(size * 0.88);
    const resizedEmblem = await sharp(emblemCrop)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: resizedEmblem, gravity: 'center' }])
      .png({ quality: 100, compressionLevel: 9 })
      .toBuffer();
  };

  // Google Favicon Standards: 48x48 and 96x96
  const fav48 = await createPaddedIcon(48);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), fav48);
  console.log('  -> Generated public/favicon-48x48.png (48x48 true PNG for Google Search Snippets)');

  const fav96 = await createPaddedIcon(96);
  fs.writeFileSync(path.join(publicDir, 'favicon-96x96.png'), fav96);
  console.log('  -> Generated public/favicon-96x96.png (96x96 true PNG)');

  const fav32 = await createPaddedIcon(32);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), fav32);

  const fav16 = await createPaddedIcon(16);
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), fav16);

  // Favicon.png fallback
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), fav96);

  // Apple Touch Icon standard: 180x180
  const appleTouch = await createPaddedIcon(180);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);
  console.log('  -> Generated public/apple-touch-icon.png (180x180 true PNG)');

  // Android Chrome PWA icons: 192x192 & 512x512
  const pwa192 = await createPaddedIcon(192);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), pwa192);
  console.log('  -> Generated public/android-chrome-192x192.png (192x192 true PNG)');

  const pwa512 = await createPaddedIcon(512);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), pwa512);
  console.log('  -> Generated public/android-chrome-512x512.png (512x512 true PNG)');

  // 3. Generate a standard multi-size favicon.ico
  console.log('3. Generating root favicon.ico...');
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // ICO format
  icoHeader.writeUInt16LE(3, 4); // 3 images: 16, 32, 48

  const icons = [
    { size: 16, buf: fav16 },
    { size: 32, buf: fav32 },
    { size: 48, buf: fav48 }
  ];

  let offset = 6 + 16 * icons.length;
  const dirEntries = [];
  const imageBuffers = [];

  for (const item of icons) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size, 0);
    entry.writeUInt8(item.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(item.buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    imageBuffers.push(item.buf);
    offset += item.buf.length;
  }

  const icoBuffer = Buffer.concat([icoHeader, ...dirEntries, ...imageBuffers]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('  -> Generated public/favicon.ico');

  // 4. Generate SVG Favicon
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="28" fill="#142238"/>
  <path d="M30 25H60C78 25 88 38 88 60C88 82 78 95 60 95H30V25Z" fill="#1B3B6F" opacity="0.4"/>
  <path d="M42 88L72 38L85 52L52 95L42 88Z" fill="#C9983A"/>
  <path d="M58 35L88 32L85 62L76 53L70 42L58 35Z" fill="#2E66B8"/>
  <circle cx="90" cy="30" r="7" fill="#C9983A"/>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
  console.log('  -> Updated public/favicon.svg');

  // 5. Generate 1200x630 OpenGraph / Social Share Preview Banner
  console.log('4. Generating 1200x630 OpenGraph Share Banner (og-banner.png)...');
  const ogCardSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0B1320"/>
        <stop offset="50%" stop-color="#111B2C"/>
        <stop offset="100%" stop-color="#080D17"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#F3E5AB"/>
      </linearGradient>
    </defs>

    <rect width="1200" height="630" fill="url(#bgGrad)"/>
    <circle cx="1050" cy="150" r="300" fill="#2563EB" opacity="0.12" filter="blur(80px)"/>
    <circle cx="150" cy="500" r="260" fill="#D4AF37" opacity="0.08" filter="blur(90px)"/>

    <g transform="translate(90, 110)">
      <rect width="320" height="42" rx="21" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
      <circle cx="26" cy="21" r="7" fill="#10B981"/>
      <text x="44" y="27" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" letter-spacing="0.5">
        VERIFIED B2B COMMERCE
      </text>

      <text x="0" y="115" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" letter-spacing="-0.5">
        Dream to Achievers
      </text>

      <text x="0" y="175" fill="url(#goldGrad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700">
        Wholesale Distribution &amp; Reseller Network
      </text>

      <text x="0" y="235" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400">
        Source verified consumer inventory at direct trade rates.
      </text>
      <text x="0" y="268" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400">
        Sell nationwide with COD dispatch and cash milestone rewards.
      </text>

      <g transform="translate(0, 340)">
        <rect width="280" height="48" rx="12" fill="#1E293B" stroke="#D4AF37" stroke-width="1.2"/>
        <text x="24" y="30" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" letter-spacing="1">
          dreamtoachievers.com
        </text>
      </g>
    </g>

    <rect x="740" y="105" width="370" height="420" rx="28" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  </svg>
  `;

  const logoInCard = await sharp(brandFileBuffer)
    .resize(320, 320, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  const ogCardBase = await sharp(Buffer.from(ogCardSvg))
    .composite([
      {
        input: logoInCard,
        left: 765,
        top: 155
      }
    ])
    .png({ quality: 95 })
    .toBuffer();

  fs.writeFileSync(path.join(imagesDir, 'og-banner.png'), ogCardBase);
  fs.writeFileSync(path.join(publicDir, 'og-banner.png'), ogCardBase);
  console.log('  -> Generated public/images/og-banner.png and public/og-banner.png (1200x630)');

  console.log('--- All brand assets and Google Favicons generated successfully! ---');
}

buildBrandAssets().catch(err => {
  console.error(err);
  process.exit(1);
});
