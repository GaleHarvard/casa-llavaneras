# Causas del alta vacía y del título repetido (v89)

Caso real, iPhone, versión v88, clave de Gemini de José. Foto nítida de la contraetiqueta de Juvé & Camps «Reserva de la Familia» Gran Reserva 2018, Brut Nature, Cava, 75 cl, 12 % vol, EAN 8424487600188.

La pantalla de alta salió en ámbar, con el vino, la DO, las uvas, la añada, el tipo, el grado y el volumen vacíos. Solo se rellenó Bodega, con el texto legal del embotellador: «Juvé & Camps B. Propietat d'Espiells S.A.U. / Juvé & Ca…». Al guardar, la ficha mostró «Juvé & Camps S.A.U. / » repetido decenas de veces y ocupó toda la pantalla.

## Causa exacta

No hay en el código un bucle que concatene la bodega con « / ». Se buscó en `casa-*.js` y no existe ni `.join(" / ")` ni una suma con `" / "`. La barra ya está impresa en la contraetiqueta, en la razón social, y el modelo la repitió dentro de un solo texto.

Lo que hizo la v88, en este orden:

1. `visionOnce` (`casa-v88.js`) pedía a Gemini un JSON con ocho campos y un tope de **800 tokens** de salida. El enunciado decía «Léelas juntas y combina los datos», así que el modelo tendía a unir líneas con « / ».
2. `geminiGenerateRun` (`casa-gemini.js`, hacia las líneas 2222-2228) daba la respuesta por buena en cuanto el JSON tenía algún campo con texto, **aunque Gemini avisara `finishReason: MAX_TOKENS`**. El reintento que sube el tope a 1024 solo se hace si el JSON no parece útil. Un productor enorme ya parece útil, así que el reintento no llega a ejecutarse.
3. «Juvé & Camps S.A.U. / » ocupa unos diez tokens. Con 800 tokens de salida caben decenas de repeticiones dentro de la cadena de la bodega. `repairJsonObject` cierra la comilla si el JSON viene cortado, y `bagFromParsed` se queda con esa cadena entera. El resto de campos no llega: el formulario los pinta vacíos y en ámbar. El recuadro de Bodega solo enseña el principio.
4. Al guardar, `wineForIntake` usa ese productor como nombre de la ficha si el vino viene vacío (si no, el título de respaldo es «Vino»). En `casa-ficha.js` el título se insertaba sin escapar: `<h1 class="wine-producer">${w.producer}</h1>`, a 30 px y con salto en cualquier carácter. Por eso la repetición llenaba la pantalla.

La prueba que reproduce el fallo está en `tests/v89-alta.test.js`: un objeto con `finish: "MAX_TOKENS"` y el productor repetido cuarenta veces. La v88 lo habría guardado. La v89 lo tira y avisa.

## Otras causas, distintas de la repetición

- **Tamaño de la foto.** `ingestLabelImage` comprimía a 720 px y calidad 0.72 antes de Gemini. El texto grande se leía; el EAN y el «12 %» quedaban pequeños. No es lo que vació el formulario (la bodega sí se rellenó, luego la imagen sí llegó), pero empeora la lectura.
- **HEIC.** `compressDataUrl` (`casa-gemini.js`), si el lienzo no puede dibujar la foto, devolvía el original. Un HEIC del iPhone podía salir hacia Gemini como `image/heic` y recibir un HTTP 400. En el caso de José la foto sí se descodificó.
- **Respaldo en silencio.** `readBothLabels`, si Gemini no devolvía nada y el teléfono tenía red, llamaba igual a Tesseract y no explicaba el fallo. Si Gemini devolvía solo la bodega, Tesseract ni siquiera se usaba y no había ningún aviso. Por eso José veía campos vacíos sin una frase que dijera por qué.

## Qué hace la v89

Una sola petición, fotos en JPEG a unos 1600 px, esquema estricto y 2048 tokens. Si la respuesta viene cortada, se descarta. La razón social se normaliza (se quitan S.A.U., S.L., «B.» y «Propietat d'…»), no se concatenan trozos y el nombre queda en 80 caracteres. El EAN se lee del código de barras y se busca en Open Food Facts y en el catálogo. Si Gemini falla con red, cuota o clave, la pantalla lo dice. Tesseract solo actúa sin conexión. No se puede guardar sin vino y bodega válidos. Las fichas ya guardadas con el título repetido se recortan y el original queda en las notas.
