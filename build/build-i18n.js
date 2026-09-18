#!/usr/bin/env node
/**
 * build-i18n.js
 * -------------
 * Genera las dos versiones estáticas del sitio (es/en) a partir de UNA sola
 * plantilla fuente (index.template.html) y dos diccionarios de traducción
 * (content/i18n/es.json y content/i18n/en.json).
 *
 * Uso:
 *   node build/build-i18n.js
 *
 * No requiere dependencias externas — solo Node (fs/path nativos).
 * Se corre ANTES de subir a GitHub / desplegar en Netlify. Juan Pablo nunca
 * necesita ejecutarlo a mano: Claude lo corre y entrega los archivos ya
 * generados en cada zip.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT, 'index.template.html');
const SITE_URL = 'https://myplace.mx'; // dominio productivo — ajustar si cambia

const LOCALES = {
  es: { code: 'ES', dictFile: path.join(ROOT, 'content', 'i18n', 'es.json') },
  en: { code: 'EN', dictFile: path.join(ROOT, 'content', 'i18n', 'en.json') },
};

function buildHreflangTags(currentLocale) {
  const tags = [];
  for (const locale of Object.keys(LOCALES)) {
    tags.push(
      `<link rel="alternate" hreflang="${locale}" href="${SITE_URL}/${locale}/">`
    );
  }
  // x-default → versión en inglés (audiencia institucional internacional)
  tags.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/">`);
  tags.push(`<link rel="canonical" href="${SITE_URL}/${currentLocale}/">`);
  return tags.join('\n');
}

function applyDictionary(html, dict) {
  return html.replace(/\{\{i18n\.([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    if (!(key in dict)) {
      throw new Error(`Falta la clave de traducción "${key}" en el diccionario`);
    }
    return dict[key];
  });
}

function applyStructuralTokens(html, locale) {
  const other = locale === 'es' ? 'en' : 'es';
  return html
    .replace(/\{\{HTML_LANG\}\}/g, locale)
    .replace(/\{\{HREFLANG_TAGS\}\}/g, buildHreflangTags(locale))
    .replace(/\{\{CURRENT_LANG_CODE\}\}/g, LOCALES[locale].code)
    .replace(/\{\{OTHER_LANG_CODE\}\}/g, LOCALES[other].code)
    .replace(/\{\{OTHER_LANG_CODE_LOWER\}\}/g, other)
    .replace(/\{\{OTHER_LANG_URL\}\}/g, `/${other}/`);
}

function main() {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  for (const locale of Object.keys(LOCALES)) {
    const dict = JSON.parse(fs.readFileSync(LOCALES[locale].dictFile, 'utf8'));
    let html = applyDictionary(template, dict);
    html = applyStructuralTokens(html, locale);

    // seguridad: si queda algún token sin resolver, fallar el build en vez
    // de publicar una página rota
    const leftover = html.match(/\{\{[a-zA-Z0-9_.]+\}\}/g);
    if (leftover) {
      throw new Error(`Tokens sin resolver en ${locale}: ${leftover.join(', ')}`);
    }

    const outDir = path.join(ROOT, locale);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    console.log(`✔ Generado ${locale}/index.html (${html.length} bytes)`);
  }
}

main();
