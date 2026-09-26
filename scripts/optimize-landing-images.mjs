import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.resolve('public/images/landing');
const files = fs.readdirSync(inputDir);

async function optimizeImages() {
  console.log('Optimizing landing images with sharp...');
  
  for (const file of files) {
    if (!file.endsWith('.jpg') && !file.endsWith('.jpeg') && !file.endsWith('.png')) continue;
    
    const filePath = path.join(inputDir, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);
    const webpPath = path.join(inputDir, `${baseName}.webp`);

    let maxWidth = 1600;
    if (file.startsWith('reseller-')) {
      maxWidth = 400;
    } else if (file.startsWith('cat-') || file.startsWith('step-')) {
      maxWidth = 900;
    }

    try {
      const statsBefore = fs.statSync(filePath);
      
      await sharp(filePath)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toFile(webpPath);
      
      const statsAfter = fs.statSync(webpPath);
      const savings = ((1 - statsAfter.size / statsBefore.size) * 100).toFixed(1);
      console.log(`✓ ${file} (${(statsBefore.size / 1024).toFixed(0)}KB) -> ${baseName}.webp (${(statsAfter.size / 1024).toFixed(0)}KB) [-${savings}%]`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  console.log('Optimization complete!');
}

optimizeImages();
