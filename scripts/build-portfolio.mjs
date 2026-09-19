// Genera {locale}/portfolio/index.html para cada idioma: el shell estático
// de la página (nav real + intro + contenedor vacío de la marquesina +
// footer real, todo en el idioma correspondiente). El contenido de la
// marquesina en sí se llena en el navegador vía fetch a /content/portfolio.json
// (mismo archivo para ambos idiomas — ver notas de categoría/ciudad en
// assets/js/main.js), así se puede agregar, quitar o reordenar propiedades
// sin volver a correr el build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const LOCALES = {
  es: {
    eyebrow: 'Portafolio',
    title: 'Lugares Donde Operamos',
    subtitle: 'Una colección curada de propiedades en los mercados de hospitalidad más distintivos de México.',
    prevAria: 'Propiedad anterior',
    nextAria: 'Siguiente propiedad',
    trackAria: 'Colección de propiedades, usa las flechas o desliza para navegar',
    empty: 'Nuestra colección está en curación. Vuelve pronto para explorar las propiedades que operamos.',
    metaTitle: 'Portafolio — MYPLACE',
    metaDesc: "Explora la colección de propiedades operadas por MYPLACE — hoteles, aparthoteles y villas en los mercados de hospitalidad más importantes de México.",
  },
  en: {
    eyebrow: 'Portfolio',
    title: 'Places We Operate',
    subtitle: "A curated collection of properties across Mexico's most distinctive hospitality markets.",
    prevAria: 'Previous property',
    nextAria: 'Next property',
    trackAria: 'Property collection, use arrow keys or swipe to browse',
    empty: 'Our collection is being curated. Check back soon to explore the properties we operate.',
    metaTitle: 'Portfolio — MYPLACE',
    metaDesc: "Explore the collection of properties operated by MYPLACE — hotels, aparthotels and villas across Mexico's most important hospitality markets.",
  },
};

let CURRENT_LOCALE = 'es';

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
  block = block.replace(/href="#(?!")/g, `href="/${CURRENT_LOCALE}/#`);
  block = block.replace(/onclick="closeMobileMenu\(\)"/g, '');
  return block;
}

function buildLocale(locale) {
  CURRENT_LOCALE = locale;
  const t = LOCALES[locale];
  const homePath = path.join(ROOT, locale, 'index.html');
  if (!fs.existsSync(homePath)) {
    throw new Error(`No existe ${locale}/index.html todavía — corre build-i18n.js primero.`);
  }
  const html = fs.readFileSync(homePath, 'utf-8');
  const navHtml = extractBlock(html, '<nav id="main-nav">', '</nav>');
  const mobileMenuHtml = extractBlock(html, '<div class="mobile-menu" id="mobile-menu">', '</div>');
  const footerHtml = extractBlock(html, '<footer>', '</footer>');

  const body = `
<section class="pf-intro">
  <p class="pf-eyebrow reveal">${t.eyebrow}</p>
  <h1 class="pf-title reveal">${t.title}</h1>
  <p class="pf-subtitle reveal">${t.subtitle}</p>
</section>

<section class="pf-marquee-section" aria-label="Property collection">
  <div class="pf-marquee" id="pf-marquee">
    <button class="pf-arrow pf-arrow-prev" id="pf-prev" aria-label="${t.prevAria}">&larr;</button>
    <div class="pf-track" id="pf-track" tabindex="0" aria-label="${t.trackAria}"></div>
    <button class="pf-arrow pf-arrow-next" id="pf-next" aria-label="${t.nextAria}">&rarr;</button>
  </div>
  <div class="pf-dots" id="pf-dots"></div>
  <p class="pf-empty" id="pf-empty" style="display:none;">
    ${t.empty}
  </p>
</section>
`;

  const pageHtml = `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.metaTitle}</title>
<meta name="description" content="${t.metaDesc}">
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

  const OUTPUT_DIR = path.join(ROOT, locale, 'portfolio');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), pageHtml, 'utf-8');
  console.log(`✓ [${locale}] ${locale}/portfolio/index.html generado`);
}

function main() {
  for (const locale of Object.keys(LOCALES)) buildLocale(locale);
}

main();
