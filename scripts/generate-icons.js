import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8C4A3C"/>
      <stop offset="100%" stop-color="#73392E"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3D6CB"/>
      <stop offset="100%" stop-color="#EEF3EA"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="170" fill="#FBF3EF" opacity="0.15"/>
  <!-- Gentle stylized mother & baby silhouette / heart embrace -->
  <path d="M256 160 C 220 120, 160 140, 160 195 C 160 250, 256 320, 256 320 C 256 320, 352 250, 352 195 C 352 140, 292 120, 256 160 Z" fill="url(#leaf)"/>
  <circle cx="256" cy="190" r="28" fill="#8C4A3C" opacity="0.85"/>
  <path d="M256 226 C 240 226, 226 244, 226 264 C 226 280, 240 292, 256 292 C 272 292, 286 280, 286 264 C 286 244, 272 226, 256 226 Z" fill="#8C4A3C" opacity="0.75"/>
  <!-- Leaf detail -->
  <path d="M305 130 C 330 115, 360 125, 365 155 C 340 160, 315 150, 305 130 Z" fill="#6F7F62"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

// Function to generate raw RGBA PNG file
function createPng(width, height, isMaskable = false) {
  // Buffer for scanlines
  // Each scanline begins with 1 filter byte (0 = None), followed by width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.38 : 0.44);

  // Terracotta #8C4A3C = (140, 74, 60)
  // Rosé #F3D6CB = (243, 214, 203)
  // Cream #FBF3EF = (251, 243, 239)

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable) {
        // Full bleed terracotta background
        if (dist <= radius) {
          // Inside inner badge
          rawData[pxOffset] = 243;     // R
          rawData[pxOffset + 1] = 214; // G
          rawData[pxOffset + 2] = 203; // B
          rawData[pxOffset + 3] = 255; // A
        } else {
          rawData[pxOffset] = 140;
          rawData[pxOffset + 1] = 74;
          rawData[pxOffset + 2] = 60;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Rounded or circular icon
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (dist <= radius + 2) {
          // Gradient from top left
          const t = (x + y) / (width + height);
          const r = Math.round(140 + t * (115 - 140));
          const g = Math.round(74 + t * (57 - 74));
          const b = Math.round(60 + t * (46 - 60));

          // Inner emblem
          if (dist <= radius * 0.55) {
            rawData[pxOffset] = 251;
            rawData[pxOffset + 1] = 243;
            rawData[pxOffset + 2] = 239;
            rawData[pxOffset + 3] = 255;
          } else {
            rawData[pxOffset] = r;
            rawData[pxOffset + 1] = g;
            rawData[pxOffset + 2] = b;
            rawData[pxOffset + 3] = 255;
          }
        } else {
          // Transparent outside
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
        }
      }
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);

  // Helper to make chunk
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    // CRC32 of type + data
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // CRC32 table
  function crc32(buf) {
    let table = crc32.table;
    if (!table) {
      table = crc32.table = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
          if (c & 1) c = 0xedb88320 ^ (c >>> 1);
          else c = c >>> 1;
        }
        table[n] = c;
      }
    }
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, false));

console.log('Icons generated successfully in public/');
