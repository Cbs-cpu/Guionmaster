/**
 * Puente mínimo con el runtime CEP de Adobe.
 *
 * Adobe distribuye una librería oficial (`CSInterface.js`, en su repo
 * CEP-Resources) con decenas de métodos: temas, ventanas, eventos, rutas del
 * sistema... Este panel usa exactamente UNO de ellos, `evalScript`, así que
 * en vez de arrastrar un archivo de ~1000 líneas de terceros se implementa
 * aquí la parte necesaria sobre `window.__adobe_cep__`, que es el objeto que
 * el propio runtime inyecta en el panel y sobre el que la librería oficial
 * es una envoltura fina.
 *
 * Si algún día hace falta más superficie de la API (eventos entre paneles,
 * detección del tema de Premiere, diálogos nativos), lo correcto es sustituir
 * este archivo por el CSInterface.js oficial de Adobe — la interfaz que se
 * expone aquí es deliberadamente compatible, así que main.js no cambiaría.
 */

function CSInterface() {}

/**
 * Ejecuta código ExtendScript en el host (Premiere) y devuelve el resultado
 * como string por callback.
 *
 * El resultado SIEMPRE es texto: ExtendScript y el panel viven en procesos
 * distintos y solo se pasan strings. Si el script lanza una excepción no
 * capturada, CEP devuelve literalmente "EvalScript error." — por eso
 * host/index.jsx envuelve todo en try/catch y devuelve su propio JSON de
 * error, mucho más informativo.
 */
CSInterface.prototype.evalScript = function (script, callback) {
  if (typeof window.__adobe_cep__ === "undefined") {
    // Fuera de Premiere (p. ej. abriendo el HTML en un navegador para
    // maquetar): se falla de forma explícita en vez de quedarse colgado
    // esperando un callback que no va a llegar nunca.
    if (callback) {
      callback(
        JSON.stringify({
          ok: false,
          error: "Este panel solo funciona dentro de Premiere Pro (no hay runtime CEP).",
        })
      );
    }
    return;
  }
  window.__adobe_cep__.evalScript(script, callback || function () {});
};

/** Información del host: útil para depurar qué versión de Premiere lo carga. */
CSInterface.prototype.getHostEnvironment = function () {
  if (typeof window.__adobe_cep__ === "undefined") return null;
  return JSON.parse(window.__adobe_cep__.getHostEnvironment());
};

/** Abre una URL en el navegador del sistema, no dentro del panel. */
CSInterface.prototype.openURLInDefaultBrowser = function (url) {
  if (typeof window.cep !== "undefined" && window.cep.util) {
    window.cep.util.openURLInDefaultBrowser(url);
  }
};
