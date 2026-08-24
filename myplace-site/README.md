# MYPLACE — Sitio institucional + Atelier

Este proyecto reemplaza el `MYPLACE_dc.html` suelto por una estructura de
carpetas con build automático, siguiendo el mismo patrón operativo del sitio
de referencia (Accueil by Andiani): Node + Decap CMS + generación estática de
artículos.

## Estructura

```
index.html              → home (nav, hero, secciones, footer)
assets/css/styles.css   → todos los estilos del sitio
assets/js/main.js       → scroll-reveal, menú móvil, fetch de Atelier, etc.
assets/video/           → hero.webm, hero.mp4
assets/images/          → poster.webp
assets/atelier/uploads/ → aquí caen las imágenes que subas desde el CMS
content/atelier/*.md    → artículos del blog (fuente, editable por CMS o a mano)
content/atelier.json    → índice generado — NO editar a mano
atelier/                → páginas de artículo generadas — NO editar a mano
admin/                  → panel de administración (Decap CMS)
scripts/build-atelier.mjs → genera atelier/*, atelier/index.html y content/atelier.json
```

## Cómo migrar de "subir HTML suelto" a este flujo

### 1. Crear el repositorio en GitHub
Sube el contenido de este `.zip` (sin la carpeta `node_modules` si existe) a
un repo nuevo en GitHub, por ejemplo `myplace-site`.

### 2. Conectar el repo a Netlify
En el dashboard de Netlify: **Add new site → Import an existing project →
GitHub** → selecciona el repo. Netlify va a detectar `netlify.toml`
automáticamente:
- Build command: `npm run build`
- Publish directory: `.`

Dale deploy. La primera vez Netlify instala dependencias y corre
`scripts/build-atelier.mjs`, que genera las páginas de artículo.

### 3. Activar Netlify Identity
En el sitio ya desplegado: **Site configuration → Identity → Enable Identity**.

### 4. Activar Git Gateway
Dentro de Identity: **Services → Git Gateway → Enable Git Gateway**.
Esto es lo que le permite a Decap CMS (en `/admin`) escribir artículos
directo al repo sin que tú tengas que tocar GitHub.

### 5. Invitarte a ti mismo como usuario del CMS
**Identity → Invite users** → tu correo. Vas a recibir un email para
poner contraseña. Con eso entras a `tudominio.netlify.app/admin`.

### 6. Publicar un artículo
Entra a `/admin`, inicia sesión, crea un artículo en la colección
**Atelier**, márcalo como **Publicado**, y guarda. Decap CMS hace commit
del `.md` al repo → Netlify detecta el push → corre el build → el
artículo aparece en `/atelier/` y en la home.

## Desarrollo local

```bash
npm install
npm run build     # genera atelier/* y content/atelier.json
python3 -m http.server 8080   # o cualquier servidor estático
```

## Notas

- El logo va embebido como base64 directo en `index.html` — no depende de
  ningún archivo externo, así que no hay riesgo de que se corrompa al subir.
- Los artículos sin imagen de portada (`cover` vacío) usan un layout de
  cabecera simple; con portada, usan un hero a todo lo ancho.
- Los 3 artículos incluidos son de ejemplo, sin foto de portada. Puedes
  editarlos o borrarlos desde `/admin` una vez que el flujo esté activo.
