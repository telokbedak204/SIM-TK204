import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const logoSrc = path.resolve(process.cwd(), 'src/assets/images/sim_tk204_logo_1791739875608.jpg');
const shareSrc = path.resolve(process.cwd(), 'src/assets/images/sim_tk204_share_1791739895082.jpg');
const publicDir = path.resolve(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generate() {
  console.log('Generating PWA and Social Share assets...');

  // 1. pwa-192x192.png
  await sharp(logoSrc)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 2. pwa-512x512.png
  await sharp(logoSrc)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 3. apple-touch-icon.png (180x180)
  await sharp(logoSrc)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. pwa-maskable-512x512.png (512x512 with safe zone: 410px centered logo on #142B4A background)
  const resizedInner = await sharp(logoSrc)
    .resize(410, 410, { fit: 'contain' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 20, g: 43, b: 74, alpha: 1 }, // #142B4A
    },
  })
    .composite([{ input: resizedInner, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 5. og-image.png (1200x630)
  await sharp(shareSrc)
    .resize(1200, 630, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Created og-image.png');

  // Also create og-image.jpg
  await sharp(shareSrc)
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('Created og-image.jpg');

  // 6. favicon.png & favicon-32x32.png
  await sharp(logoSrc)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');

  // 7. Vector SVG icon: clean high-contrast SVG representation of SIM-TK204
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E1E34" />
      <stop offset="100%" stop-color="#142B4A" />
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA033" />
      <stop offset="100%" stop-color="#F28C28" />
    </linearGradient>
    <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFB347" />
      <stop offset="100%" stop-color="#E67300" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)" />
  <!-- Blueprint circle border -->
  <circle cx="256" cy="240" r="190" fill="none" stroke="#254A7B" stroke-width="6" stroke-dasharray="14 10" />
  <circle cx="256" cy="240" r="206" fill="none" stroke="#F28C28" stroke-width="4" opacity="0.6" />
  
  <!-- Hardhat base -->
  <path d="M128 290 Q256 120 384 290 Q394 304 380 306 L132 306 Q118 304 128 290 Z" fill="url(#helmetGrad)" stroke="#FFFFFF" stroke-width="4"/>
  <!-- Helmet ridge / crest -->
  <path d="M242 165 C242 165 256 150 270 165 L274 270 L238 270 Z" fill="#FFA033" opacity="0.9" />
  <!-- Helmet visor rim -->
  <path d="M96 304 Q256 324 416 304 Q426 316 410 326 Q256 348 102 326 Q86 316 96 304 Z" fill="#CC6600" stroke="#FFFFFF" stroke-width="3"/>

  <!-- Construction cranes / skyline in background -->
  <path d="M160 250 L160 210 L190 190 M160 220 L210 220" stroke="#F28C28" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
  <path d="M352 250 L352 200 L310 180 M352 215 L290 215" stroke="#F28C28" stroke-width="4" stroke-linecap="round" opacity="0.7"/>

  <!-- App Title Banner -->
  <rect x="86" y="360" width="340" height="74" rx="20" fill="#0C1B2E" stroke="#F28C28" stroke-width="4" />
  <text x="256" y="410" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="42" letter-spacing="3">SIM-TK204</text>
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
  console.log('Created icon.svg');

  console.log('All icons generated successfully!');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
