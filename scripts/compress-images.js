/**
 * One-off script to compress oversized scenario images.
 * Uses sharp (already in devDependencies).
 *
 * Usage: node scripts/compress-images.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TARGETS = [
  {
    input: path.join(__dirname, '..', 'assets', 'images', 'scenario_images', 'Office_morning.jpg'),
    maxWidth: 1280,
    quality: 75,
  },
  {
    input: path.join(__dirname, '..', 'assets', 'images', 'scenario_images', 'scene.jpg'),
    maxWidth: 1280,
    quality: 80,
  },
];

async function compress({ input, maxWidth, quality }) {
  if (!fs.existsSync(input)) {
    console.log(`⏭  Skipped (not found): ${path.basename(input)}`);
    return;
  }

  const sizeBefore = fs.statSync(input).size;
  const meta = await sharp(input).metadata();

  let pipeline = sharp(input);

  // Only resize if wider than maxWidth
  if (meta.width && meta.width > maxWidth) {
    pipeline = pipeline.resize(maxWidth);
  }

  pipeline = pipeline.jpeg({ quality, mozjpeg: true });

  const buffer = await pipeline.toBuffer();

  // Only overwrite if we actually made it smaller
  if (buffer.length < sizeBefore) {
    // Write to temp file then rename to avoid OneDrive file locks
    const tmpPath = input + '.tmp';
    fs.writeFileSync(tmpPath, buffer);
    fs.unlinkSync(input);
    fs.renameSync(tmpPath, input);
    const sizeAfter = buffer.length;
    console.log(
      `✅ ${path.basename(input)}: ${(sizeBefore / 1024 / 1024).toFixed(2)} MB → ${(sizeAfter / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - sizeAfter / sizeBefore) * 100)}% smaller)`
    );
  } else {
    console.log(`⏭  ${path.basename(input)}: already optimized (${(sizeBefore / 1024 / 1024).toFixed(2)} MB)`);
  }
}

(async () => {
  console.log('🖼  Compressing scenario images...\n');
  for (const target of TARGETS) {
    await compress(target);
  }
  console.log('\nDone!');
})();
