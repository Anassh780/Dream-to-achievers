import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imagesDir = path.resolve('public/images');
const publicDir = path.resolve('public');

async function optimizeImages() {
  console.log('Optimizing images...');
  const files = fs.readdirSync(imagesDir);

  for (const file of files) {
    const fullPath = path.join(imagesDir, file);
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const stats = fs.statSync(fullPath);
      console.log(`Processing ${file} (${(stats.size / 1024).toFixed(1)} KB)...`);

      const img = sharp(fullPath);
      const metadata = await img.metadata();

      // Optimize for web: max width 1200px
      const resizeOptions = metadata.width && metadata.width > 1200 ? { width: 1200, withoutEnlargement: true } : {};

      // 1. Generate optimized WebP
      const webpPath = path.join(imagesDir, `${baseName}.webp`);
      await sharp(fullPath)
        .resize(resizeOptions)
        .webp({ quality: 82, effort: 6 })
        .toFile(webpPath);

      const webpStats = fs.statSync(webpPath);
      console.log(`  -> Created ${baseName}.webp: ${(webpStats.size / 1024).toFixed(1)} KB (-${((1 - webpStats.size / stats.size) * 100).toFixed(0)}%)`);

      // 2. Also optimize original JPG/PNG in-place with lower compression footprint
      if (ext === '.jpg' || ext === '.jpeg') {
        const tempJpg = path.join(imagesDir, `${baseName}_temp.jpg`);
        await sharp(fullPath)
          .resize(resizeOptions)
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(tempJpg);
        fs.renameSync(tempJpg, fullPath);
      } else if (ext === '.png') {
        const tempPng = path.join(imagesDir, `${baseName}_temp.png`);
        await sharp(fullPath)
          .resize(resizeOptions)
          .png({ quality: 85, compressionLevel: 9, palette: true })
          .toFile(tempPng);
        fs.renameSync(tempPng, fullPath);
      }
    }
  }
}

async function generateFavicons() {
  console.log('\nGenerating Google Favicon suite...');
  const svgPath = path.join(publicDir, 'favicon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. favicon-48x48.png (Google search standard)
  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon-48x48.png'));
  console.log('Created favicon-48x48.png');

  // 2. favicon-96x96.png
  await sharp(svgBuffer).resize(96, 96).png().toFile(path.join(publicDir, 'favicon-96x96.png'));
  console.log('Created favicon-96x96.png');

  // 3. apple-touch-icon.png (180x180)
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. android-chrome-192x192.png
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'android-chrome-192x192.png'));
  console.log('Created android-chrome-192x192.png');

  // 5. android-chrome-512x512.png
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'android-chrome-512x512.png'));
  console.log('Created android-chrome-512x512.png');

  // 6. site logo for structured data (512x512)
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(imagesDir, 'logo.png'));
  console.log('Created public/images/logo.png');

  // 7. site.webmanifest
  const manifest = {
    name: 'Dream to Achievers — B2B Wholesale Commerce & Reseller Network',
    short_name: 'DreamToAchievers',
    description: 'Official platform of Dream to Achievers. Source verified wholesale inventory, distribute nationwide with COD, and earn structured milestone rewards.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7EF',
    theme_color: '#0B1320',
    icons: [
      {
        src: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png'
      },
      {
        src: '/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('Created site.webmanifest');
}

async function run() {
  await optimizeImages();
  console.log('\nAll asset optimization completed successfully!');
}

run().catch(console.error);
