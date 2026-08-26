// Genera portfolio/index.html: el shell estático de la página (nav real +
// intro + contenedor vacío de la marquesina + footer real). El contenido de
// la marquesina en sí se llena en el navegador vía fetch a
// /content/portfolio.json (ver assets/js/main.js) — así se puede agregar,
// quitar o reordenar propiedades sin volver a correr el build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INDEX_HTML = path.join(ROOT, 'index.html');
const OUTPUT_DIR = path.join(ROOT, 'portfolio');

function extractBlock(html, startMarker, endTag) {
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error(`No encontré el marcador: ${startMarker}`);

  const tagName = endTag.replace(/[</>]/g, '');
  const openRe = new RegExp(`<${tagName}[\\s>]`, 'g');

  let depth = 0;
  let cursor = start;
  let end = -1;
  while (true) {
    openRe.lastIndex = cursor;
    const nextOpen = openRe.exec(html);
    const nextClose = html.indexOf(endTag, cursor);
    if (nextClose === -1) break;
    if (nextOpen && nextOpen.index < nextClose) {
      depth += 1;
      cursor = nextOpen.index + nextOpen[0].length;
    } else {
      depth -= 1;
      cursor = nextClose + endTag.length;
      if (depth === 0) { end = cursor; break; }
    }
  }
  if (end === -1) throw new Error(`No encontré el cierre balanceado de: ${startMarker}`);

  let block = html.slice(start, end);
  block = block.replace(/(?<!\/)assets\//g, '/assets/');
  block = block.replace(/href="#"/g, 'href="/"');
  block = block.replace(/href="#(?!")/g, 'href="/#');
  block = block.replace(/onclick="closeMobileMenu\(\)"/g, '');
  return block;
}

function main() {
  const html = fs.readFileSync(INDEX_HTML, 'utf-8');
  const navHtml = extractBlock(html, '<nav id="main-nav">', '</nav>');
  const mobileMenuHtml = extractBlock(html, '<div class="mobile-menu" id="mobile-menu">', '</div>');
  const footerHtml = extractBlock(html, '<footer>', '</footer>');

  const body = `
<section class="pf-intro">
  <p class="pf-eyebrow reveal">Portfolio</p>
  <h1 class="pf-title reveal">Places We Operate</h1>
  <p class="pf-subtitle reveal">A curated collection of properties across Mexico's most distinctive hospitality markets.</p>
</section>

<section class="pf-marquee-section" aria-label="Property collection">
  <div class="pf-marquee" id="pf-marquee">
    <button class="pf-arrow pf-arrow-prev" id="pf-prev" aria-label="Previous property">&larr;</button>
    <div class="pf-track" id="pf-track" tabindex="0" aria-label="Property collection, use arrow keys or swipe to browse"></div>
    <button class="pf-arrow pf-arrow-next" id="pf-next" aria-label="Next property">&rarr;</button>
  </div>
  <div class="pf-dots" id="pf-dots"></div>
  <p class="pf-empty" id="pf-empty" style="display:none;">
    Nuestra colección está en curación. Vuelve pronto para explorar las propiedades que operamos.
  </p>
</section>
`;

  const pageHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio — MYPLACE</title>
<meta name="description" content="Explora la colección de propiedades operadas por MYPLACE — hoteles, aparthoteles y villas en los mercados de hospitalidad más importantes de México.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>

${navHtml}

${mobileMenuHtml}

<main>
${body}
</main>

${footerHtml}

<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), pageHtml, 'utf-8');
  console.log('✓ portfolio/index.html generado');
}

main();
