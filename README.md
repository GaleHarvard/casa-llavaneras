Casa Llavaneras

## Imágenes de bodega y de zona

Las ilustraciones van en la raíz del repositorio, con el nombre ya optimizado (no hace falta recomprimirlas):

- `bodega-<slug>.jpg` — bodega
- `mapa-<slug>.jpg` — mapa de la zona

Para enlazar una bodega, añade una línea en `WINERY_LIBRARY` dentro de `bodegas.js`:

```
{ name: "Marqués de Murrieta", file: "bodega-marques-de-murrieta.jpg", aliases: ["Castillo Ygay", "Ygay"] }
```

El nombre y los alias se comparan sin distinguir mayúsculas ni acentos. Un vino nuevo de la cava usa la misma lista. Si la bodega no tiene imagen, la ficha muestra `vinedo.jpg` (grabado genérico de viñedo, sin el nombre de otra casa) y el mapa de zona sigue en su propia pantalla.
