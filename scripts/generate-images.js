/**
 * Generates responsive WebP images for Lighthouse performance.
 * Run from project root: node scripts/generate-images.js
 * Requires: npm install (see package.json devDependencies)
 */
const fs = require("fs");
const path = require("path");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("Run: npm install");
  process.exit(1);
}

const root = path.resolve(__dirname, "..");

const hero = {
  input: path.join(root, "Filip_1.webp"),
  outputs: [
    { path: path.join(root, "Filip_1_420w.webp"), width: 420 },
    { path: path.join(root, "Filip_1_840w.webp"), width: 840 },
  ],
};

const collage = [
  { base: "absolwent_1", widths: [234, 468] },
  { base: "absolwent_2", widths: [300, 600] },
  { base: "absolwent_3", widths: [218, 436] },
];

const webpOptions = { quality: 82, effort: 4 };

async function generate() {
  if (!fs.existsSync(hero.input)) {
    console.warn("Skip hero: Filip_1.webp not found");
  } else {
    for (const { path: outPath, width } of hero.outputs) {
      await sharp(hero.input)
        .resize(width, null, { withoutEnlargement: true })
        .webp(webpOptions)
        .toFile(outPath);
      console.log("Wrote", path.relative(root, outPath));
    }
  }

  const imagesDir = path.join(root, "images");
  if (!fs.existsSync(imagesDir)) {
    console.warn("Skip collage: images/ not found");
    return;
  }

  for (const { base, widths } of collage) {
    const input = path.join(imagesDir, `${base}.webp`);
    if (!fs.existsSync(input)) {
      console.warn("Skip", input);
      continue;
    }
    for (const w of widths) {
      const outPath = path.join(imagesDir, `${base}_${w}w.webp`);
      await sharp(input)
        .resize(w, null, { withoutEnlargement: true })
        .webp(webpOptions)
        .toFile(outPath);
      console.log("Wrote", path.relative(root, outPath));
    }
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
