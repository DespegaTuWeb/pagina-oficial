import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '../public/imgs/hero-fallback.webp');

// Verificar tamaño actual
const meta = await sharp(inputPath).metadata();
console.log(`📐 Original: ${meta.width}x${meta.height}px — ~${Math.round((meta.size || 0) / 1024)} KB`);

// Redimensionar a 640px de ancho máximo (suficiente para móvil + OG image)
// El height se calcula automáticamente manteniendo la proporción
await sharp(inputPath)
  .resize({
    width: 640,
    withoutEnlargement: true,  // no agranda si ya es más pequeña
  })
  .webp({ quality: 80 })
  .toFile(inputPath + '.tmp.webp');

// Reemplazar el archivo original con el comprimido
import { rename, unlink } from 'fs/promises';
import { existsSync } from 'fs';

// Backup del original por si acaso
await rename(inputPath, inputPath + '.original.bak');
await rename(inputPath + '.tmp.webp', inputPath);

// Verificar resultado
const metaNew = await sharp(inputPath).metadata();
const sizeNew = (await import('fs')).statSync(inputPath).size;
const sizeOld = (await import('fs')).statSync(inputPath + '.original.bak').size;

console.log(`✅ Nuevo:    ${metaNew.width}x${metaNew.height}px — ${Math.round(sizeNew / 1024)} KB`);
console.log(`💾 Ahorro:  ${Math.round((sizeOld - sizeNew) / 1024)} KB (${Math.round((1 - sizeNew/sizeOld) * 100)}% menos)`);
console.log('');
console.log('⚠️  Backup guardado en: hero-fallback.webp.original.bak');
console.log('    Si algo se ve mal, puedes restaurarlo.');
