const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../img/features');
const outputDir = path.join(__dirname, '../docs/img/features');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all PNG files
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));

console.log(`Found ${files.length} images to optimize\n`);

let totalOriginal = 0;
let totalOptimized = 0;

async function optimizeImages() {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    const originalSize = fs.statSync(inputPath).size;
    totalOriginal += originalSize;

    try {
      await sharp(inputPath)
        .resize(280, 280, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(outputPath);

      const optimizedSize = fs.statSync(outputPath).size;
      totalOptimized += optimizedSize;

      const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
      console.log(`[${i + 1}/${files.length}] ${file}: ${(originalSize / 1024 / 1024).toFixed(1)}MB -> ${(optimizedSize / 1024).toFixed(0)}KB (${reduction}% reduction)`);
    } catch (err) {
      console.error(`Error optimizing ${file}:`, err.message);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total original size: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total optimized size: ${(totalOptimized / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total reduction: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
  console.log(`\nOptimized images saved to: ${outputDir}`);
}

optimizeImages();
