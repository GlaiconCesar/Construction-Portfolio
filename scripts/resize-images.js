#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const IMAGE_DIR = path.join(__dirname, '..', 'assets', 'img');

const galleryItems = [
  'hero-finished',
  'bar-feature',
  'wine-wall',
  'build-framing-arch',
  'build-finished-shell',
  'build-framing-curved-wall',
  'brand-wn-salon-prive'
];

const fullWidths = [480, 960, 1600];
const thumbWidths = [480, 960];
const thumbRatio = 4 / 3;

const jpgOptions = { quality: 80, progressive: true, mozjpeg: true };
const webpOptions = { quality: 78 };

function pickWidth(targetWidth, originalWidth) {
  return targetWidth <= originalWidth ? targetWidth : originalWidth;
}

async function ensureInputExists(inputPath) {
  try {
    await fs.access(inputPath);
  } catch {
    throw new Error(`Missing input file: ${path.relative(process.cwd(), inputPath)}`);
  }
}

async function buildFull(baseName, inputPath, metadata) {
  const tasks = [];

  for (const width of fullWidths) {
    const outputWidth = pickWidth(width, metadata.width);

    tasks.push(
      sharp(inputPath)
        .rotate()
        .resize({ width: outputWidth, withoutEnlargement: true })
        .jpeg(jpgOptions)
        .toFile(path.join(IMAGE_DIR, `${baseName}-full-${width}.jpg`))
    );

    tasks.push(
      sharp(inputPath)
        .rotate()
        .resize({ width: outputWidth, withoutEnlargement: true })
        .webp(webpOptions)
        .toFile(path.join(IMAGE_DIR, `${baseName}-full-${width}.webp`))
    );
  }

  await Promise.all(tasks);
}

function getThumbHeight(width) {
  return Math.round(width / thumbRatio);
}

async function buildThumbs(baseName, inputPath, metadata) {
  const tasks = [];

  for (const width of thumbWidths) {
    const outputWidth = pickWidth(width, metadata.width);
    const targetHeight = getThumbHeight(outputWidth);

    tasks.push(
      sharp(inputPath)
        .rotate()
        .resize({
          width: outputWidth,
          height: targetHeight,
          fit: 'cover',
          position: 'attention',
          withoutEnlargement: true
        })
        .jpeg(jpgOptions)
        .toFile(path.join(IMAGE_DIR, `${baseName}-thumb-${width}.jpg`))
    );

    tasks.push(
      sharp(inputPath)
        .rotate()
        .resize({
          width: outputWidth,
          height: targetHeight,
          fit: 'cover',
          position: 'attention',
          withoutEnlargement: true
        })
        .webp(webpOptions)
        .toFile(path.join(IMAGE_DIR, `${baseName}-thumb-${width}.webp`))
    );
  }

  await Promise.all(tasks);
}

async function run() {
  for (const baseName of galleryItems) {
    const inputPath = path.join(IMAGE_DIR, `${baseName}.jpg`);
    await ensureInputExists(inputPath);

    const metadata = await sharp(inputPath).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Could not read dimensions for ${baseName}.jpg`);
    }

    await buildFull(baseName, inputPath, metadata);
    await buildThumbs(baseName, inputPath, metadata);

    console.log(`Processed: ${baseName}.jpg (${metadata.width}x${metadata.height})`);
  }

  console.log('Image build complete.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
