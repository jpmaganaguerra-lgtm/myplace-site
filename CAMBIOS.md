# Cambios en este paquete

## Qué se agregó

- **Selector de idioma en el nav** (`.lang-switcher`, junto a Contact/Contacto en desktop y mobile). Muestra el idioma actual (EN/ES) y revela la otra opción con mouse-over en desktop; en mobile/touch funciona con el mismo clic que ya usa el dropdown de Portfolio (mismo componente, cero JS nuevo de apertura/cierre).
- **Sitio completo en dos versiones estáticas y reales para SEO**: `/es/index.html` y `/en/index.html`, generadas desde una sola plantilla fuente (`index.template.html`) + dos diccionarios de traducción (`content/i18n/es.json`, `content/i18n/en.json`). Cada una trae su propio `<title>`, meta description, `hreflang` cruzado y `canonical`.
- **Geo-redirect en el edge** (`netlify/edge-functions/geo-lang-redirect.js` + `netlify.toml`): la raíz `/` redirige a `/es/` si el visitante viene de Latinoamérica o España, y a `/en/` en cualquier otro caso. Si el visitante ya usó el switcher, esa preferencia (cookie `myplace_lang`) gana siempre sobre la geolocalización.
- **Brands por idioma**: `content/brands.es.json` y `content/brands.en.json` (antes solo existía en inglés). `main.js` ahora pide el archivo correcto según `<html lang>`.
- **Portfolio**: no se duplicó `portfolio.json` (son datos reales de 69 propiedades, no copy). Solo se traduce en pantalla la categoría y la ciudad vía una tablita chica en `main.js` — cero riesgo de desincronizar el Rent Roll.

## ⚠️ Pendiente de tu lado — no lo puedo confirmar yo

- **No encontré un `netlify.toml` previo en este chat.** Si ya existe uno en el repo con `build command` / `publish directory` / headers propios, hay que **fusionar** ambos, no reemplazar. Si no existe ninguno, el que entrego aquí es autosuficiente.
- **Dominio de producción**: dejé `https://myplace.mx` fijo en `build/build-i18n.js` (línea `SITE_URL`) para las etiquetas `hreflang`/`canonical`. Confírmame si es el dominio final una vez resuelto el tema de DNS/correo que traíamos abierto.
- La raíz del repo ya **no** tiene un `index.html` suelto — ahora vive en `/es/` y `/en/`. Si tu Netlify actual apunta a un `index.html` de raíz por config manual (no por `netlify.toml`), avísame para ajustarlo.

## Lo que NO se tradujo todavía (fuera de alcance de este pedido)

- Los 3 artículos de Atelier (`content/atelier/*.md`) siguen solo en español. Si quieres, en la siguiente ronda armo la versión en inglés de cada uno y ajusto `main.js` para que el blog también respete `/es/atelier/` y `/en/atelier/`.
- Las imágenes de marcas (`assets/images/brands/`) siguen pendientes de subir — no relacionado con este cambio, ya estaba en el radar.

## Cómo regenerar si cambias texto

1. Edita `content/i18n/es.json` y/o `content/i18n/en.json` (o `index.template.html` si el cambio es estructural).
2. Corre `node build/build-i18n.js` desde la raíz del proyecto.
3. Sube `/es/index.html` y `/en/index.html` junto con lo demás — como siempre, yo lo corro y te entrego el zip ya listo; no necesitas tocar Node.
