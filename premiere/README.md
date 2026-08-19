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

1. **Elegir archivo…** abre el selector nativo de Windows (audio o vídeo,
   hasta 25 MB — es el límite de la API de transcripción; si el vídeo pesa
   más, extrae solo el audio antes con ffmpeg).
2. **Palabras clave**: las que quieres que salgan resaltadas (el tratamiento
   depende del estilo — caja sólida, cambio de color, bloque…).
3. **Estilo**: Modula, Minimal, Bloques o Glow — mismo catálogo que
   `remotion/scenes/subtitulos/estilos.ts`.
4. **Transcribir y generar** hace las dos llamadas seguidas (transcribir,
   luego renderizar) y tarda: la transcripción es rápida, el render no —
   depende de cuánto dure el audio. El botón se reactiva solo al terminar.
5. El resultado se previsualiza ahí mismo (el `.mp4` con fondo) y se importa
   o inserta con los mismos botones de siempre; el archivo real que se monta
   es el `.mov` con canal alfa, no el de la previsualización.

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
