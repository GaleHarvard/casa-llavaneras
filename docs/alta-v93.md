# Alta de nuevo vino (v93)

## Por qué desapareció la fototeca

En la v92 el paso de las dos fotos añadía la clase `scan-slots` al abrir el escáner (`showLabelSlots` en `casa-v92.js`). Esta regla de `styles.css` oculta la barra y el visor:

```css
.app.scan-slots #scan .scan-tools { display: none; }
.app.scan-slots #scan .scan-hud, .app.scan-slots #scan .viewfinder, .app.scan-slots #scan .scan-hint { display: none; }
```

El botón «Elegir de fotos» vive en `.scan-tools` y «Fototeca» vive en `.scan-hud`. Los dos quedaban fuera de la pantalla. El input `#scan-file-lib` seguía en el HTML, sin `capture`, pero ningún botón visible lo abría. Los huecos de etiqueta solo disparaban la cámara (`capture="environment"`).

El alta v93 no usa `scan-slots`. En cada paso (delantera y trasera) pinta dos botones: Cámara y Fototeca.

## Flujo

Módulo `casa-alta.js`. Pasos: Captura → Análisis IA → Ficha preliminar → Confirmación.

1. Cámara: `#scan-file-cam` con `accept="image/*"` y `capture="environment"`.
2. Fototeca: `#scan-file-lib` con `accept="image/*"` y sin atributo `capture`, para que iOS Safari ofrezca la fototeca.
3. Por defecto se piden la delantera y la trasera. «Seguir solo con la delantera» salta la segunda.
4. `frontLabelImage` es la portada. Se guarda en IndexedDB `casa-llavaneras-labels` (almacén `thumbs`) con la clave del vino y se copia a `labelThumb`.
5. `backLabelImage` usa la clave `back:` + id y el campo `backLabel`. Se ve en Contraetiqueta.
6. La migración copia `labelThumb` → `frontLabelImage` y `backLabel` → `backLabelImage` solo si el campo nuevo está vacío. No borra bytes. Antes, una sola vez, copia `vinoteca.pro.max.v3` en `vinoteca.pro.max.v3.antes-v93`. La clave de `vinoteca-jgc-provider` no se toca.

## Lectura

`analyzeAndEnrichWine(front, back)` manda las dos imágenes en base64 en una sola llamada `geminiGenerate` (fetch, cabecera `x-goog-api-key`, `responseSchema`). Modelos: `gemini-2.5-flash` y, si hace falta, `gemini-2.5-flash-lite`. Obligatorios: `name`, `vintage`, `region`, `winery`.

Si falta alguno, una segunda llamada `geminiGrounded` con `google_search`, sin `responseSchema`. Solo se copian datos con una fuente `https://`. Lo que no aparece queda vacío y no se muestra. Nunca se escribe «Sin dato».

Un 429 sigue el camino de cuota ya existente y no pasa a Tesseract. `shouldUseOfflineRead` (v92) solo declara sin conexión cuando `navigator.onLine === false` y el fallo es de red.

## Catálogo

`matchLocalAssets(region, winery)` pliega el texto (sin acentos, minúsculas), usa alias y exige coincidencia por palabras. La aguja más larga gana. Devuelve `regionAssetImage`, `wineryAssetImage` y enlaza la zona (`openZona`) y la bodega (`openBodega`).

Ejemplos: «DO Empordà» → `mapa-emporda.jpg`; «Perelada», «Castillo Perelada» y «Grup Peralada» → `bodega-perelada.jpg`.

Si la zona o la bodega no están en las 115 zonas ni en las 37 bodegas, una búsqueda con fuente rellena clima y suelo, o historia, fundación y ubicación.

## Borrador

La ficha nace en `DRAFT`: portada, contraetiqueta, foto de zona, foto de bodega y textos editables. `cellarLocation` (vinoteca y hueco) reutiliza las vinotecas y el mapa de huecos. «Confirmar alta definitiva» y «Guardar y añadir otra» permanecen deshabilitados hasta elegir la ubicación. Al confirmar, el vino queda `CONFIRMED` con imágenes y relaciones.

## Comprobación en iOS

En esta máquina no hay un iPhone. La comprobación es WebKit con el service worker bloqueado: los dos botones visibles, el input de cámara con `capture="environment"` y el de fototeca sin `capture`.
