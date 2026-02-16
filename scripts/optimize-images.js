const fs = require('fs');
const path = require('path');

// Try to load sharp, install if not available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Installing sharp library...');
  require('child_process').execSync('npm install sharp', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  sharp = require('sharp');
}

// Configuration
const SOURCE_DIR = path.join(__dirname, '../img/animals');
const OUTPUT_DIR = path.join(__dirname, '../src/public/img/animals');
const TARGET_SIZE = 280; // pixels (2x display size for retina)

async function optimizeImages() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  // Get all PNG files
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} images to optimize\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sourcePath = path.join(SOURCE_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);

    const originalSize = fs.statSync(sourcePath).size;
    totalOriginalSize += originalSize;

    try {
      // Resize and optimize with sharp
      await sharp(sourcePath)
        .resize(TARGET_SIZE, TARGET_SIZE, {
          fit: 'cover',
          position: 'center'
        })
        .png({
          quality: 90,
          compressionLevel: 9
        })
        .toFile(outputPath);

      const optimizedSize = fs.statSync(outputPath).size;
      totalOptimizedSize += optimizedSize;

      const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
      console.log(
        `[${i + 1}/${files.length}] ${file}: ` +
        `${(originalSize / 1024 / 1024).toFixed(1)}MB -> ${(optimizedSize / 1024).toFixed(0)}KB ` +
        `(${reduction}% reduction)`
      );
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total reduction: ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log(`\nOptimized images saved to: ${OUTPUT_DIR}`);
}

optimizeImages().catch(console.error);
