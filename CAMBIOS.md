# Cambios — reconstrucción completa del bilingüe sobre el repo real

Esta ronda reemplaza por completo el trabajo de idiomas anterior (que se
perdió en la limpieza del repo). Esta vez se construyó directo sobre
`github.com/jpmaganaguerra-lgtm/myplace-site` clonado, no sobre archivos
sueltos subidos al chat — así que refleja el sitio real: marcas reales
(The Gallery, Casa Filomeno, Casa Mexico), el pipeline de build con Atelier
y Portfolio generados, y el admin de Decap CMS.

## Qué cambia

- **Home bilingüe**: `/es/index.html` y `/en/index.html`, generados desde
  `index.template.html` + `content/i18n/{es,en}.json` vía `node build/build-i18n.js`.
  El `index.html` suelto de la raíz se eliminó — era exactamente la causa del
  problema anterior (una copia que se queda vieja sin que nadie lo note).
  `index.template.html` es ahora la única fuente de verdad del home.
- **Selector de idioma** en el nav (desktop + mobile), junto a Contact/Contacto,
  con el mismo comportamiento que ya conocías (hover en desktop, clic en mobile,
  mismo componente `.nav-item-dropdown` que Portfolio).
- **Atelier bilingüe de verdad**: los 3 artículos existentes se tradujeron al
  inglés (traducción real del contenido, no relleno). `content/atelier/es/` y
  `content/atelier/en/` reemplazan la carpeta plana anterior.
  `scripts/build-atelier.mjs` ahora genera `/es/atelier/*` y `/en/atelier/*`
  extrayendo el nav/footer YA TRADUCIDO del home de cada idioma.
- **Portfolio bilingüe**: `scripts/build-portfolio.mjs` genera
  `/es/portfolio/` y `/en/portfolio/`. Los datos (`content/portfolio.json`)
  se quedan en un solo archivo — solo se traduce en pantalla la categoría y
  la ciudad (tabla chica en `main.js`), para no duplicar 69 propiedades reales.
- **Brands por idioma**: `content/brands.es.json` / `content/brands.en.json`
  con los datos REALES (antes había datos de prueba equivocados en una ronda
  anterior). `content/brands.json` (el archivo único viejo) se eliminó — ya
  no lo usa nada.
- **Rutas de assets corregidas**: todo lo que antes era relativo
  (`assets/video/...`) ahora es absoluto (`/assets/video/...`) en las páginas
  generadas — si no, videos e imágenes se habrían roto en `/es/` y `/en/` por
  estar un nivel más abajo que la raíz.
- **`netlify.toml` + Edge Function** (`geo-lang-redirect.js`) recreados desde
  cero — no existían en el repo real. `/` redirige a `/es/` (Latinoamérica +
  España) o `/en/` (resto del mundo); el switcher del nav guarda una cookie
  que gana siempre sobre la geolocalización.
- **`admin/config.yml`**: ahora tiene dos colecciones — *Atelier (Español)*
  y *Atelier (English)* — apuntando a `content/atelier/es` y
  `content/atelier/en` respectivamente. Publicar un artículo en un idioma no
  publica automáticamente el otro: son independientes a propósito.
- **`package.json` nuevo** (no existía): `npm run build` corre, en orden,
  `build:i18n` → `build:atelier` → `build:portfolio`. Netlify lo detecta solo
  (`netlify.toml` ya trae `command = "npm run build"`, `publish = "."`).

## Lo que NO cambió a propósito

- El marquee de "Our Brands" (`bm-track`) sigue exactamente igual a como está
  en producción hoy — **incluyendo que hoy no muestra tarjetas**. Revisé el
  `main.js` real y sí tiene el código de fetch/render de marcas (a diferencia
  de una versión huérfana que encontré suelta en la raíz del repo, que
  borré por no ser la que usa `index.html`). Si en producción no las ves,
  puede ser un tema de `content/brands.*.json` sirviéndose bien o de caché —
  avísame si quieres que lo revise, pero no lo toqué porque no era parte de
  este pedido ("todo idéntico, solo en otro idioma").

## Cómo aplicar esto

Con GitHub Desktop (como ya vimos): clona el repo, reemplaza todo el
contenido con lo que trae este zip, revisa el panel de cambios, commit y
push. Netlify va a instalar dependencias y correr `npm run build` solo en
el próximo deploy.

## Pendiente / a confirmar

- Verificar en Netlify: Site configuration → Identity y Git Gateway siguen
  activos después del reemplazo (no deberían verse afectados, pero vale la
  pena confirmarlo ya que se tocó `admin/config.yml`).
- Si agregas una marca o un artículo nuevo desde `/admin`, recuerda que
  ahora hay que elegir la colección correcta (ES o EN) — o publicar en
  ambas si quieres el artículo en los dos idiomas.
