// Lee content/atelier/*.md, y genera:
//   1. atelier/{slug}/index.html — la página completa de cada artículo publicado
//   2. atelier/index.html        — archivo con todos los artículos publicados
//   3. content/atelier.json      — índice que el home usa para pintar las tarjetas
//
// Se corre con `npm run build` (o `npm run content:build` solo). No requiere
// ningún backend propio: Decap CMS escribe los .md directo al repositorio, y
// este script los convierte a HTML en cada build de Netlify.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'atelier');
const OUTPUT_DIR = path.join(ROOT, 'atelier');
const INDEX_HTML = path.join(ROOT, 'index.html');
const JSON_OUT = path.join(ROOT, 'content', 'atelier.json');

function readIndexHtml() {
  return fs.readFileSync(INDEX_HTML, 'utf-8');
}

// Extrae un bloque de index.html entre un marcador de apertura literal y un
// tag de cierre, y reescribe rutas relativas y anclas (#seccion) para que
// funcionen desde /atelier/{slug}/, dos niveles más abajo en el árbol.
function extractBlock(html, startMarker, endTag) {
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error(`No encontré el marcador: ${startMarker}`);
  const end = html.indexOf(endTag, start) + endTag.length;
  let block = html.slice(start, end);
  block = block.replace(/(?<!\/)assets\//g, '/assets/');
  block = block.replace(/href="#"/g, 'href="/"');
  block = block.replace(/href="#(?!")/g, 'href="/#');
  block = block.replace(/onclick="closeMobileMenu\(\)"/g, '');
  return block;
}

function loadArticles() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const articles = files.map(file => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
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

function formatDateEs(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function pageShell({ headerHtml, footerHtml, title, description, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="es">
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

function renderArticlePage({ headerHtml, footerHtml }, article) {
  const bodyMarkup = marked.parse(article.bodyMarkdown);
  const metaLine = `${article.tag} &middot; ${formatDateEs(article.date)}`;

  const topBlock = article.cover
    ? `
<section class="atelier-article-hero" style="background-image:url('${article.cover}')">
  <div class="atelier-article-hero-overlay"></div>
  <div class="atelier-article-hero-content">
    <a href="/#atelier" class="atelier-back">&larr; Atelier</a>
    <p class="atelier-article-meta">${metaLine}</p>
    <h1 class="atelier-article-title">${article.title}</h1>
  </div>
</section>`
    : `
<div class="atelier-article-plain">
  <a href="/#atelier" class="atelier-back atelier-back-dark">&larr; Atelier</a>
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

  return pageShell({
    headerHtml, footerHtml,
    title: article.title,
    description: article.excerpt,
    bodyHtml: body,
  });
}

function renderArchivePage({ headerHtml, footerHtml }, articles) {
  const cards = articles.map(a => `
    <a href="/atelier/${a.slug}/" class="atelier-card visible">
      <div class="atelier-card-image">
        <div class="atelier-card-image-bg" style="background-image:url('${a.cover}')"></div>
      </div>
      <p class="atelier-card-tag">${a.tag}</p>
      <p class="atelier-card-title">${a.title}</p>
      <p class="atelier-card-date">${formatDateEs(a.date)}</p>
    </a>`).join('\n');

  const body = `
<section class="atelier atelier-archive" style="padding-top:180px;">
  <div class="atelier-header">
    <div>
      <div class="section-label">Atelier</div>
      <h2 class="atelier-headline">Todos los Artículos</h2>
    </div>
  </div>
  <div class="atelier-grid">
    ${cards || '<p class="atelier-empty">Nuevo contenido próximamente.</p>'}
  </div>
</section>`;

  return pageShell({
    headerHtml, footerHtml,
    title: 'Atelier',
    description: 'Perspectiva institucional de MYPLACE sobre hospitalidad, tecnología y desempeño de activos.',
    bodyHtml: body,
  });
}

function main() {
  const html = readIndexHtml();
  const navHtml = extractBlock(html, '<nav id="main-nav">', '</nav>');
  const mobileMenuHtml = extractBlock(html, '<div class="mobile-menu" id="mobile-menu">', '</div>');
  const headerHtml = `${navHtml}\n\n${mobileMenuHtml}`;
  const footerHtml = extractBlock(html, '<footer>', '</footer>');

  const articles = loadArticles();

  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const article of articles) {
    const outDir = path.join(OUTPUT_DIR, article.slug);
    fs.mkdirSync(outDir, { recursive: true });
    const pageHtml = renderArticlePage({ headerHtml, footerHtml }, article);
    fs.writeFileSync(path.join(outDir, 'index.html'), pageHtml, 'utf-8');
  }

  const archiveHtml = renderArchivePage({ headerHtml, footerHtml }, articles);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), archiveHtml, 'utf-8');

  const jsonIndex = articles.map(({ bodyMarkdown, ...rest }) => rest);
  fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  fs.writeFileSync(JSON_OUT, JSON.stringify(jsonIndex, null, 2), 'utf-8');

  console.log(`✓ ${articles.length} artículo(s) publicados → atelier/*/index.html + atelier/index.html + content/atelier.json`);
}

main();
