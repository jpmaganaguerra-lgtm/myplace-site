# Cómo agregar/editar una marca en "Our Brands"

El marquee de marcas en el home lee directo de `content/brands.json`. Para
agregar, quitar, reordenar o editar una marca, solo se edita ese archivo —
no hay que tocar HTML, CSS ni JS.

## Forma de cada entrada

```ts
type Brand = {
  id: string;          // único, usado internamente — ej. "casa-filomeno"
  name: string;         // nombre de la marca, como se muestra (MAYÚSCULAS o no, tal cual se quiera ver)
  tag: string;          // categoría corta arriba del nombre — ej. "Boutique Hospitality"
  description: string;  // 1-2 frases, texto breve
  image: string;        // ruta a la foto de fondo de la tarjeta, o "" si aún no hay
  url: string;          // a dónde lleva el botón "Explore" — puede ser una ancla (#contact) o un link real
};
```

## Imagen de fondo

- Si `image` tiene una ruta (ej. `/assets/images/brands/encuentro.jpg`), esa
  foto se usa como fondo de la tarjeta.
- Si `image` está vacío (`""`), la tarjeta usa automáticamente un degradado
  monocromático neutro — se ve intencional, no roto. No hace falta poner
  nada mientras no haya foto lista.
- Las fotos van en `assets/images/brands/`.

## Orden

El orden del array = el orden en el marquee. Reordenar el JSON reordena
las tarjetas, sin tocar código.

## Ejemplo: agregar una marca nueva

```json
{
  "id": "nueva-marca",
  "name": "NUEVA MARCA",
  "tag": "Categoría corta",
  "description": "Una o dos frases describiendo el concepto.",
  "image": "",
  "url": "#contact"
}
```

Se agrega como un objeto más dentro del array en `content/brands.json`.
