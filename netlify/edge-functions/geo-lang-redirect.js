// netlify/edge-functions/geo-lang-redirect.js
//
// Solo corre sobre "/" (raíz del sitio) — ver `config.path` abajo.
// Cualquier visita directa a /es/... o /en/... nunca se toca aquí: ya
// eligieron idioma (por link, por buscador, o porque ya lo visitaron).
//
// Regla:
//   1. Si existe la cookie "myplace_lang" (la escribe el switcher del nav
//      al usarse manualmente), esa preferencia GANA siempre.
//   2. Si no existe, se decide por país: Latinoamérica + España -> /es/,
//      cualquier otro país -> /en/.
//   3. Si Netlify no puede geolocalizar, se cae a /en/ por default.

const SPANISH_SPEAKING_COUNTRIES = new Set([
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GT', 'HN',
  'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE', 'ES',
]);

export default async (request, context) => {
  const url = new URL(request.url);

  if (url.pathname !== '/') {
    return context.next();
  }

  const cookieLang = context.cookies.get('myplace_lang');
  let lang;

  if (cookieLang === 'es' || cookieLang === 'en') {
    lang = cookieLang;
  } else {
    const country = context.geo?.country?.code;
    lang = country && SPANISH_SPEAKING_COUNTRIES.has(country) ? 'es' : 'en';
  }

  url.pathname = `/${lang}/`;
  return Response.redirect(url, 302);
};

export const config = { path: '/' };
