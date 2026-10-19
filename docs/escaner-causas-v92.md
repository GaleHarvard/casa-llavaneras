# Escáner v92: causa del falso «Sin conexión»

José fotografió la contraetiqueta de Perelada 3 Finques (DO Empordà, tinto) con el iPhone en wifi. La pantalla Confirmar vino mostró el aviso exacto «Sin conexión: lectura de respaldo. Revisa los campos.» y rellenó la ficha con una lectura de Tesseract: el lote `L2023` como añada 2023, el tipo «Generoso» y el código de barras, sin bodega.

Ese aviso es la cadena `alta.offline`. Solo se pinta cuando la lectura trae `_offline`. En el código que de verdad corre (`casa-v89.js`, `readBothLabels`) ese indicador se ponía así:

```js
const online = typeof navigator === "undefined" || navigator.onLine !== false;
if (!online) {
  const ocr = await readLabelsOffline(front, back);
  ...
}
bag._offline = !online;
```

Con `navigator.onLine === false` no se llamaba a Gemini: se iba directo a Tesseract. No fue un 429, ni una clave rechazada, ni un corte de respuesta, ni un fallo CORS de `generativelanguage.googleapis.com`. Esos caminos dejan `_failure` y enseñan otro texto (`alta.network`, `alta.quota`, `alta.needKey`, `alta.cut`). El service worker tampoco intercepta el POST de Gemini: solo responde «Sin conexión» si falla una petición de la propia app.

En un iPhone, una PWA abierta desde la caché del service worker puede informar `navigator.onLine === false` aunque el wifi esté activo, hasta que una petición real tiene éxito. El escáner se fiaba de esa bandera y ni siquiera intentaba la red.

El tipo «Generoso» salía del respaldo. `wineTypeFromText` probaba `fino` sin límite de palabra, así que un texto como «Finques» podía colar, y `vi negre` no contaba como tinto. `yearFromText` se quedaba con el primer `2023`, el del lote `L2023`.

## Qué hace v92

- Gemini se intenta siempre que hay clave. El modo sin conexión solo entra si `navigator.onLine === false` y además la petición falla de verdad (`fetch`). Un tiempo agotado, un 429 o una clave mal puesta se dicen con su motivo y con «Reintentar».
- La primera foto no se da por etiqueta. Se distingue etiqueta delantera y contraetiqueta, se leen juntas y salen en una sola ficha. Si solo hay contraetiqueta, se avisa y se ofrece fotografiar la etiqueta.
- La contraetiqueta se guarda en su apartado. La imagen principal es la etiqueta; si no hay, queda la ilustración. Una ficha ya guardada solo se migra cuando el texto o un código de barras demuestran que la foto es la contraetiqueta. Si hay duda, no se toca.
- «Completar ficha» edita añada, bodega, uvas, grado, tipo y el resto. El botón amarillo «—» ya no se pinta. Si falta la bodega se puede guardar como pendiente, y si el texto menciona Perelada se propone la ficha del catálogo (Castillo Perelada, Grup Peralada).
