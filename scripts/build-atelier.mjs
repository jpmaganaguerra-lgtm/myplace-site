// Lee content/atelier/{locale}/*.md, y genera para CADA idioma:
//   1. {locale}/atelier/{slug}/index.html — la página completa de cada artículo
//   2. {locale}/atelier/index.html        — archivo con todos los artículos
//   3. content/atelier.{locale}.json      — índice que el home usa para pintar
//      las tarjetas (fetch por idioma, ver assets/js/main.js)
//
// El nav y el footer se extraen del index.html YA TRADUCIDO de ese mismo
// idioma (/es/index.html o /en/index.html) — así el header/footer de cada
// artículo queda automáticamente en el idioma correcto, sin duplicar texto
// a mano en este script.
//
// Se corre con `npm run build` (ver package.json), UNA VEZ POR IDIOMA.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const LOCALES = {
  es: { dateLocale: 'es-MX', backLabel: 'Atelier', allLabel: 'Todos los Artículos', emptyLabel: 'Nuevo contenido próximamente.', metaDesc: 'Perspectiva institucional de MYPLACE sobre hospitalidad, tecnología y desempeño de activos.' },
  en: { dateLocale: 'en-US', backLabel: 'Atelier', allLabel: 'All Articles', emptyLabel: 'New content coming soon.', metaDesc: "MYPLACE's institutional perspective on hospitality, technology and asset performance." },
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

function loadArticles(locale) {
  const dir = path.join(ROOT, 'content', 'atelier', locale);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const articles = files.map(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    return {
      title: data.title || 'Sin título',
      slug: data.slug || path.basename(file, '.md'),
      cover: data.cover || '',
      excerpt: data.excerpt || '',
      tag: data.tag || 'Atelier',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      published: data.published !== false,
      bodyMarkdown: content,
    };
  });
  return articles
    .filter(a => a.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function formatDate(iso, locale) {
  const d = new Date(iso);
  return d.toLocaleDateString(LOCALES[locale].dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function pageShell({ headerHtml, footerHtml, title, description, bodyHtml, locale }) {
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — MYPLACE</title>
<meta name="description" content="${(description || '').replace(/"/g, '&quot;')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>

${headerHtml}

${bodyHtml}

${footerHtml}

<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;
}

function renderArticlePage({ headerHtml, footerHtml }, article, locale) {
  const bodyMarkup = marked.parse(article.bodyMarkdown);
  const metaLine = `${article.tag} &middot; ${formatDate(article.date, locale)}`;
  const backHref = `/${locale}/#atelier`;

  const topBlock = article.cover
    ? `
<section class="atelier-article-hero" style="background-image:url('${article.cover}')">
  <div class="atelier-article-hero-overlay"></div>
  <div class="atelier-article-hero-content">
    <a href="${backHref}" class="atelier-back">&larr; ${LOCALES[locale].backLabel}</a>
    <p class="atelier-article-meta">${metaLine}</p>
    <h1 class="atelier-article-title">${article.title}</h1>
  </div>
</section>`
    : `
<div class="atelier-article-plain">
  <a href="${backHref}" class="atelier-back atelier-back-dark">&larr; ${LOCALES[locale].backLabel}</a>
  <p class="atelier-article-meta atelier-article-meta-dark">${metaLine}</p>
  <h1 class="atelier-article-title atelier-article-title-dark">${article.title}</h1>
</div>`;

  const body = `
${topBlock}
<article class="atelier-article-body ${article.cover ? '' : 'atelier-article-body-tight'}">
  <div class="atelier-article-content">
    ${bodyMarkup}
  </div>
</article>`;

  return pageShell({ headerHtml, footerHtml, title: article.title, description: article.excerpt, bodyHtml: body, locale });
}

function renderArchivePage({ headerHtml, footerHtml }, articles, locale) {
  const cards = articles.map(a => `
    <a href="/${locale}/atelier/${a.slug}/" class="atelier-card visible">
      <div class="atelier-card-image">
        <div class="atelier-card-image-bg" style="background-image:url('${a.cover}')"></div>
      </div>
      <p class="atelier-card-tag">${a.tag}</p>
      <p class="atelier-card-title">${a.title}</p>
      <p class="atelier-card-date">${formatDate(a.date, locale)}</p>
    </a>`).join('\n');

  const body = `
<section class="atelier atelier-archive" style="padding-top:180px;">
  <div class="atelier-header">
    <div>
      <div class="section-label">Atelier</div>
      <h2 class="atelier-headline">${LOCALES[locale].allLabel}</h2>
    </div>
  </div>
  <div class="atelier-grid">
    ${cards || `<p class="atelier-empty">${LOCALES[locale].emptyLabel}</p>`}
  </div>
</section>`;

  return pageShell({ headerHtml, footerHtml, title: 'Atelier', description: LOCALES[locale].metaDesc, bodyHtml: body, locale });
}

function buildLocale(locale) {
  CURRENT_LOCALE = locale;
  const homePath = path.join(ROOT, locale, 'index.html');
  if (!fs.existsSync(homePath)) {
    throw new Error(`No existe ${locale}/index.html todavía — corre build-i18n.js primero.`);
  }
  const html = fs.readFileSync(homePath, 'utf-8');
  const navHtml = extractBlock(html, '<nav id="main-nav">', '</nav>');
  const mobileMenuHtml = extractBlock(html, '<div class="mobile-menu" id="mobile-menu">', '</div>');
  const headerHtml = `${navHtml}\n\n${mobileMenuHtml}`;
  const footerHtml = extractBlock(html, '<footer>', '</footer>');

  const articles = loadArticles(locale);

  const OUTPUT_DIR = path.join(ROOT, locale, 'atelier');
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const article of articles) {
    const outDir = path.join(OUTPUT_DIR, article.slug);
    fs.mkdirSync(outDir, { recursive: true });
    const pageHtml = renderArticlePage({ headerHtml, footerHtml }, article, locale);
    fs.writeFileSync(path.join(outDir, 'index.html'), pageHtml, 'utf-8');
  }

  const archiveHtml = renderArchivePage({ headerHtml, footerHtml }, articles, locale);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), archiveHtml, 'utf-8');

  const jsonIndex = articles.map(({ bodyMarkdown, ...rest }) => rest);
  const jsonOut = path.join(ROOT, 'content', `atelier.${locale}.json`);
  fs.writeFileSync(jsonOut, JSON.stringify(jsonIndex, null, 2), 'utf-8');

  console.log(`✓ [${locale}] ${articles.length} artículo(s) → ${locale}/atelier/*/index.html + ${locale}/atelier/index.html + content/atelier.${locale}.json`);
}

function main() {
  for (const locale of Object.keys(LOCALES)) buildLocale(locale);
}

main();
