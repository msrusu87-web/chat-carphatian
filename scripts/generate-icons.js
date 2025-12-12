/**
 * Generate PWA Icons
 * 
 * Generates PNG icons from SVG using Sharp.
 * 
 * Built by Carphatian
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const iconsDir = path.join(__dirname, '../public/icons')
const svgPath = path.join(iconsDir, 'icon.svg')

async function generateIcons() {
  // Ensure directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  const svgBuffer = fs.readFileSync(svgPath)

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }

  // Generate favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'))
  console.log('Generated favicon.png')

  // Generate Apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'))
  console.log('Generated apple-touch-icon.png')

  console.log('Done!')
}

generateIcons().catch(console.error)
