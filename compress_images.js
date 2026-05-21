import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import process from 'process';

const assetsDir = path.join(process.cwd(), 'public', 'assets');
const files = fs.readdirSync(assetsDir);

async function processImages() {
  for (const file of files) {
    if (file.endsWith('.png')) {
      const filePath = path.join(assetsDir, file);
      const webpPath = path.join(assetsDir, file.replace('.png', '.webp'));
      console.log(`Converting ${file} to WebP...`);
      await sharp(filePath)
        .webp({ quality: 75 })
        .toFile(webpPath);
      console.log(`Finished ${webpPath}`);
    }
  }
}

processImages().catch(console.error);
