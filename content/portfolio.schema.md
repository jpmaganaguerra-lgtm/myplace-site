# Forma de cada entrada en `content/portfolio.json`

El proyecto no usa TypeScript, así que esto documenta la forma esperada de
cada objeto (el equivalente a una interface):

```ts
type PortfolioProperty = {
  id: string;          // único, usado como key — ej. "casa-nakawe"
  name: string;         // nombre real de la propiedad
  location: string;     // ciudad / destino — ej. "Tulum, Quintana Roo"
  category: string;     // "Aparthotel" | "Villa" | "Boutique Hotel" | etc.
  image: string;        // ruta absoluta bajo /assets/portfolio/, .webp o .avif
  imageAlt: string;     // alt descriptivo — NO usar el nombre de archivo
  url: string;          // URL real y completa de la propiedad. Nunca inventada.
};
```

## Reglas

- **No se inventan URLs.** Si una propiedad del Rent Roll no tiene URL
  identificable, no se agrega a este archivo hasta confirmarlo.
- **No se usan imágenes genéricas de stock como relleno.** Si una propiedad
  no tiene imagen disponible, se deja fuera y se reporta como pendiente.
- El **orden del array = orden en la marquesina**. Reordenar aquí reordena
  visualmente, sin tocar el componente.
- `id` debe ser único y estable (no cambiarlo una vez publicado, por si en el
  futuro se linkea directo a una propiedad dentro de la marquesina).

## Cómo se llena

1. Recibo el archivo de Rent Roll.
2. Extraigo nombre + URL de cada propiedad.
3. Superviso el emparejamiento con las imágenes disponibles en
   `assets/portfolio/`.
4. Cualquier propiedad sin URL o sin imagen se reporta explícitamente — no se
   completa con datos inventados.
