const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
const SOURCE = path.join(ASSETS_DIR, 'icon.png');

async function generateIcons() {
  if (!fs.existsSync(SOURCE)) {
    console.error('Source image not found: assets/icon.png');
    process.exit(1);
  }

  console.log('Generating app icons from source...');

  // Read source into buffer so we can write back to the same path
  const sourceBuffer = fs.readFileSync(SOURCE);
  const image = () => sharp(sourceBuffer);

  // 1. Main icon.png (1024x1024 for iOS)
  await image()
    .resize(1024, 1024, { fit: 'cover', position: 'center' })
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon.png'));
  console.log('✓ icon.png (1024x1024)');

  // 2. Splash icon — tall aspect ratio for mobile screens
  const splashWidth = 1080;
  const splashHeight = 1920;
  const splashIconSize = Math.round(splashWidth * 0.45);
  const splashPadH = Math.round((splashWidth - splashIconSize) / 2);
  const splashPadV = Math.round((splashHeight - splashIconSize) / 2);
  await image()
    .resize(splashIconSize, splashIconSize, { fit: 'cover', position: 'center' })
    .extend({
      top: splashPadV,
      bottom: splashPadV,
      left: splashPadH,
      right: splashPadH,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(ASSETS_DIR, 'splash-icon.png'));
  console.log('✓ splash-icon.png (1080x1920)');

  // 3. Android adaptive icon foreground (with transparent padding for safe zone)
  const fgSize = 1080;
  const iconSize = Math.round(fgSize * 0.75); // Use 75% for bigger appearance (safe zone is 66%)
  await image()
    .resize(iconSize, iconSize, { fit: 'cover', position: 'center' })
    .extend({
      top: Math.round((fgSize - iconSize) / 2),
      bottom: Math.round((fgSize - iconSize) / 2),
      left: Math.round((fgSize - iconSize) / 2),
      right: Math.round((fgSize - iconSize) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(ASSETS_DIR, 'android-icon-foreground.png'));
  console.log('✓ android-icon-foreground.png');

  // 4. Android adaptive icon background (solid dark purple)
  await sharp({
    create: {
      width: 1080,
      height: 1080,
      channels: 4,
      background: { r: 26, g: 16, b: 60, alpha: 1 } // #1A103C
    }
  })
    .png()
    .toFile(path.join(ASSETS_DIR, 'android-icon-background.png'));
  console.log('✓ android-icon-background.png');

  // 5. Monochrome version (thresholded silhouette)
  await image()
    .resize(1080, 1080, { fit: 'cover', position: 'center' })
    .greyscale()
    .threshold(128)
    .png()
    .toFile(path.join(ASSETS_DIR, 'android-icon-monochrome.png'));
  console.log('✓ android-icon-monochrome.png');

  // 6. Favicon (small)
  await image()
    .resize(64, 64, { fit: 'cover', position: 'center' })
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon.png'));
  console.log('✓ favicon.png');

  // Clean up double-extension file if it exists
  const badFile = path.join(ASSETS_DIR, 'splash-icon.png.png');
  if (fs.existsSync(badFile)) {
    fs.unlinkSync(badFile);
    console.log('✓ Removed splash-icon.png.png');
  }

  console.log('\nAll icons generated successfully! 🎉');
  console.log('Next: npx expo prebuild --clean');
}

generateIcons().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
