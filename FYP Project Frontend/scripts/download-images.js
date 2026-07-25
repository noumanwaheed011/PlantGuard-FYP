/**
 * Downloads all Unsplash images used in the app to public/images.
 * Run: node scripts/download-images.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

const IMAGES = [
  { url: 'https://images.unsplash.com/photo-1633174131292-22df811e983d?auto=format&fit=crop&w=1400', file: 'bg-leaves-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1648953707047-295e096064b9?auto=format&fit=crop&w=1400', file: 'bg-hero.jpg' },
  { url: 'https://images.unsplash.com/photo-1688114946903-ee71b676f2dc?auto=format&fit=crop&w=1400', file: 'bg-signup.jpg' },
  { url: 'https://images.unsplash.com/photo-1692369584496-3216a88f94c1?auto=format&fit=crop&w=1200&q=80', file: 'card-farming.jpg' },
  { url: 'https://images.unsplash.com/photo-1719512840617-0c378ad1baec?auto=format&fit=crop&w=800', file: 'feature-instant.jpg' },
  { url: 'https://images.unsplash.com/photo-1692369584496-3216a88f94c1?auto=format&fit=crop&w=800', file: 'feature-treatment.jpg' },
  { url: 'https://images.unsplash.com/photo-1536630596251-b12ba0d9f7d4?auto=format&fit=crop&w=800', file: 'feature-harvest.jpg' },
  { url: 'https://images.unsplash.com/photo-1536630596251-b12ba0d9f7d4?auto=format&fit=crop&w=800', file: 'about-mission.jpg' },
];

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
  for (const { url, file } of IMAGES) {
    const filePath = path.join(IMAGES_DIR, file);
    try {
      console.log('Downloading', file, '...');
      const buf = await download(url);
      fs.writeFileSync(filePath, buf);
      console.log('  ->', filePath);
    } catch (err) {
      console.error('  Failed:', err.message);
    }
  }
  console.log('Done.');
}

main();
