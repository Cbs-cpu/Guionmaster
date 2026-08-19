# System Content Studio — panel para Premiere Pro

Panel CEP que lee los recursos generados en System Content Studio (animaciones,
subtítulos, infografías, imágenes de contexto) y los mete en tu proyecto de
Premiere sin salir de la app: importar al bin, o insertar directamente en el
timeline en la pista y el punto donde tengas el cursor.

También transcribe y genera subtítulos animados sin salir del panel: eliges
un archivo, marcas las palabras clave y el estilo, y el resultado (con canal
alfa, listo para una pista por encima del vídeo) aparece ahí mismo con
Importar/Insertar.

No duplica nada: lee del mismo sitio que la web (`/api/db/state`), así que lo
que generes con Claude Code aparece aquí solo, sin exportar ni sincronizar.

## Instalar

```bash
node scripts/instalar-panel-premiere.mjs
```

Esto:
1. Enlaza esta carpeta dentro de `%APPDATA%\Adobe\CEP\extensions` (o la
   copia, si el enlace simbólico falla).
2. Activa `PlayerDebugMode` en el registro — Premiere se niega a cargar
   paneles sin firmar si no está activo.

Luego:
1. Arranca el estudio: `npm run dev` (el panel necesita el servidor local
   corriendo en `localhost:3000`).
2. Cierra Premiere Pro del todo si estaba abierto (la clave del registro solo
   se lee al arrancar) y vuelve a abrirlo.
3. `Ventana → Extensiones → System Content Studio`.

Para quitarlo: `node scripts/instalar-panel-premiere.mjs --quitar`.

## Usar

Dos vistas, arriba del todo:

### Recursos

- Pestañas: categorías, igual que en `/recursos` de la web.
- **Importar**: mete el archivo en un bin del proyecto ("System Content
  Studio"), sin tocar el timeline.
- **Insertar**: importa y además lo coloca en la secuencia activa, en la
  pista que elijas del selector de arriba, en la posición del cursor de
  reproducción. Solo aparece para vídeo/imagen — un `.ass` no se inserta,
  Premiere ni siquiera lo importa como clip.
- ↻ vuelve a leer el estado del estudio (por si acabas de generar algo).

### Transcribir

1. **Usar el clip bajo el cursor** — la opción normal: coge el clip de vídeo
   que hay justo donde tengas el cursor de reproducción en la secuencia
   activa (mirando las pistas de abajo arriba, V1 primero). Si quieres
   transcribir otro clip, mueve el cursor sobre él y vuelve a pulsar. Al
   generar el subtítulo, **se inserta él solo una pista por encima del
   origen** — no hace falta arrastrarlo. Si no hay pista libre encima, se
   avisa en vez de tapar algo que ya estuviera ahí.
2. **O elegir un archivo…** — el selector nativo de Windows, para transcribir
   algo que no está en el timeline (hasta 25 MB, el límite de la API de
   transcripción; si el vídeo pesa más, extrae solo el audio antes con
   ffmpeg). Este camino no inserta solo — no viene de ningún sitio del
   timeline del que tenga sentido "una pista por encima" — así que el
   resultado se importa o inserta a mano con los botones de siempre.
3. **Palabras clave**: las que quieres que salgan resaltadas (color de
   acento, contorno o subrayado según el estilo — ningún estilo pinta ya una
   caja sólida sobre el vídeo, ver `remotion/scenes/subtitulos/estilos.ts`).
4. **Transcribir**: llama a Whisper y agrupa el resultado en líneas
   (`/api/ai/subtitulos/preparar`, JavaScript puro, no toca Remotion —
   responde en milisegundos). En cuanto termina aparece el bloque de
   **preview en vivo**.
5. **Preview en vivo**: el selector de **Estilo** (Modula, Minimal, Bloques,
   Glow) repinta el vídeo dentro del panel al instante — es
   `@remotion/player` corriendo en el propio navegador del panel
   (`/premiere-preview/subtitulos`), no una llamada al servidor. Prueba los
   cuatro estilos sin esperar nada; el fondo de ajedrez del preview solo
   representa el canal alfa, no forma parte del archivo real.
6. **Generar archivo final**: aquí sí se dispara el render de verdad
   (Chromium + ffmpeg) para el estilo que hayas dejado elegido — el `.mp4`
   de previsualización y el `.mov` con canal alfa se renderizan en paralelo,
   no en serie, así que tarda aproximadamente lo que tarda el más lento de
   los dos, no la suma. El archivo real que se monta o se inserta es el
   `.mov`, no el `.mp4` de la previsualización.

### Ajustes (⚙)

A qué servidor habla el panel: local (`npm run dev`, el caso normal) o el
desplegado en el servidor por Tailscale. Se recuerda entre sesiones.

## Si algo no funciona

- **El panel no aparece en el menú de Extensiones** → casi siempre
  `PlayerDebugMode`. Reinstala y asegúrate de cerrar Premiere del todo (que
  no quede el proceso en segundo plano) antes de reabrirlo.
- **"No se puede conectar con System Content Studio"** → el servidor
  (`npm run dev`) no está levantado, o está en un puerto distinto de 3000.
- **Consola del panel**: con Premiere abierto y el panel visible, entra en
  Chrome a `http://localhost:8092`. Ahí sale todo lo que falla en la
  petición de red (CORS, servidor caído) que dentro de Premiere no se ve.
- **"No hay ninguna secuencia activa"** al insertar → abre una secuencia en
  el timeline; sin eso Premiere no sabe dónde colocar el clip.
- **Falla al transcribir con "Falta GROQ_API_KEY o OPENAI_API_KEY"** → el
  servidor al que apunta el panel no tiene ninguna de las dos claves en su
  `.env.local` / `.env`.
- **El render tarda mucho o no responde** → normal para audio largo: bundlea
  Remotion y renderiza dos veces (previsualización + overlay con alfa) con
  Chromium por debajo. No hay barra de progreso todavía, solo el mensaje de
  abajo cambiando de "Transcribiendo…" a "Generando el vídeo…".

## Cómo está montado

```
premiere/
  CSXS/manifest.xml   — declara el panel ante Premiere (id, tamaño, versión mínima)
  client/
    index.html          — estructura del panel (vistas Recursos/Transcribir, ajustes)
    style.css            — tema oscuro de Premiere, acento amarillo Modula
    main.js               — lee /api/db/state y /api/system/paths, pinta la lista,
                             el flujo de Transcribir, llama al host
    lib/cep-bridge.js      — puente MÍNIMO con CEP (solo evalScript; no es el CSInterface.js oficial de Adobe, ver comentario en el archivo)
  host/index.jsx       — ExtendScript: lo único que puede tocar app.project. ES3, sin sintaxis moderna.
  .debug               — puerto de depuración remota (8092)
```

`main.js` traduce rutas relativas de `data/media` a rutas absolutas de disco
usando `/api/system/paths`, porque Premiere importa por ruta de archivo, no
por URL — la web sirve los mismos archivos por HTTP para el navegador, pero
eso no le sirve a ExtendScript. El flujo de Transcribir es la excepción: ahí
el panel manda la ruta local directamente a `/api/ai/subtitulos/transcribir`
(campo `localPath`), y es el SERVIDOR quien lee el archivo del disco — evita
tener que leer bytes de un archivo local desde dentro del panel.

## Verificado hasta dónde se puede sin abrir Premiere

Sintaxis de los tres archivos JS/ExtendScript comprobada, el HTML/CSS se ha
cargado en un navegador normal para confirmar que las dos vistas (Recursos,
Transcribir) y el panel de Ajustes pintan sin romperse, y el flujo completo
de transcripción→render se probó de punta a punta contra el servidor local
con una transcripción de prueba (dos líneas, corte en la pausa correcta,
palabras clave bien marcadas).

Lo que **no** se ha podido probar es la integración real con Premiere Pro
(`host/index.jsx`, evalScript de verdad, `File.openDialog()` nativo) — eso
necesita la app abierta. Si algo falla al instalarlo o al usarlo, dilo con
el mensaje exacto: la parte más frágil es el manifest.xml (versión de CSXS,
rango de versión del host) y las funciones de `host/index.jsx` (la API de
ExtendScript de Premiere no se puede probar sin la app abierta).
