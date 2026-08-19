// CORS para el panel de Premiere Pro (extensión CEP, carpeta `premiere/`).
//
// Un panel CEP es un Chromium embebido que carga su HTML desde `file://` o
// desde `localhost` con un puerto propio, así que cuando pide datos a la app
// Next (`http://localhost:3000`) el navegador lo trata como origen cruzado y
// lo bloquea sin estas cabeceras.
//
// El permiso es abierto (`*`) a propósito y es aceptable AQUÍ porque:
//   - el servidor solo escucha en localhost, no está expuesto a la red;
//   - es una app de un solo usuario en su propia máquina;
//   - el origen de un panel CEP no es estable ni predecible entre versiones
//     de Premiere, así que una lista blanca daría más falsos negativos que
//     seguridad real.
// Si algún día esto se despliega en un servidor accesible desde fuera, hay
// que cambiarlo por una lista blanca antes de abrir el puerto.

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Respuesta al preflight `OPTIONS` que Chromium manda antes de un PUT/POST. */
export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
