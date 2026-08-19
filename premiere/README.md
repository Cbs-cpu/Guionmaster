# System Content Studio — panel para Premiere Pro

Panel CEP que lee los recursos generados en System Content Studio (animaciones,
subtítulos, infografías, imágenes de contexto) y los mete en tu proyecto de
Premiere sin salir de la app: importar al bin, o insertar directamente en el
timeline en la pista y el punto donde tengas el cursor.

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

- Pestañas arriba: categorías, igual que en `/recursos` de la web.
- **Importar**: mete el archivo en un bin del proyecto ("System Content
  Studio"), sin tocar el timeline.
- **Insertar**: importa y además lo coloca en la secuencia activa, en la
  pista que elijas del selector de arriba, en la posición del cursor de
  reproducción. Solo aparece para vídeo/imagen — un `.ass` no se inserta,
  Premiere ni siquiera lo importa como clip.
- ↻ vuelve a leer el estado del estudio (por si acabas de generar algo).

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

## Cómo está montado

```
premiere/
  CSXS/manifest.xml   — declara el panel ante Premiere (id, tamaño, versión mínima)
  client/
    index.html          — estructura del panel
    style.css            — tema oscuro de Premiere, acento amarillo Modula
    main.js               — lee /api/db/state y /api/system/paths, pinta la lista, llama al host
    lib/cep-bridge.js      — puente MÍNIMO con CEP (solo evalScript; no es el CSInterface.js oficial de Adobe, ver comentario en el archivo)
  host/index.jsx       — ExtendScript: lo único que puede tocar app.project. ES3, sin sintaxis moderna.
  .debug               — puerto de depuración remota (8092)
```

`main.js` traduce rutas relativas de `data/media` a rutas absolutas de disco
usando `/api/system/paths`, porque Premiere importa por ruta de archivo, no
por URL — la web sirve los mismos archivos por HTTP para el navegador, pero
eso no le sirve a ExtendScript.

## No probado en vivo

Este panel se ha escrito y verificado su lógica de datos (lectura del estado
real del estudio, traducción de rutas) contra la base de datos actual, pero
**no se ha podido cargar dentro de Premiere Pro en esta sesión** — no hay
forma de lanzar la app y probarlo de verdad desde aquí. Si algo falla al
instalarlo, dilo con el mensaje exacto: la parte más frágil y menos
verificable es el manifest.xml (versión de CSXS, rango de versión del host)
y el bin/insertar en `host/index.jsx` (la API de ExtendScript de Premiere no
se puede probar sin la app abierta).
