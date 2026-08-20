/**
 * Capa ExtendScript del panel: lo único que puede hablar con Premiere Pro.
 *
 * El panel (client/) es Chromium normal y no tiene acceso al proyecto; se
 * comunica con este archivo por `CSInterface.evalScript`, que serializa
 * argumentos y resultado como STRING. De ahí que todo entre y salga como
 * JSON en texto: no es una manía, es la única forma de cruzar esa frontera.
 *
 * ExtendScript es ES3: nada de const/let, arrow functions, JSON nativo ni
 * Array.prototype.indexOf. Todo lo que parezca "escrito raro" aquí abajo es
 * por eso.
 */

/** Serializa una respuesta uniforme para el panel. */
function respuesta(ok, datos, error) {
  var partes = [];
  partes.push('"ok":' + (ok ? "true" : "false"));
  if (datos !== undefined && datos !== null) {
    partes.push('"datos":' + datos);
  }
  if (error) {
    // Se escapan comillas y barras para no romper el JSON de vuelta.
    var limpio = String(error).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ");
    partes.push('"error":"' + limpio + '"');
  }
  return "{" + partes.join(",") + "}";
}

function escapar(texto) {
  return String(texto).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Convierte a segundos un valor de tiempo `QETime` (la API QE histórica,
 * no la DOM moderna). Confirmado en vivo con el MCP Bridge del propio
 * usuario contra su Premiere real: un `QETime` NO es number ni expone
 * `.seconds` — su reflect da `["frames","secs","ticks","timecode"]`, así
 * que el campo es `.secs`, no `.seconds`. `.ticks` (string de un entero
 * grande, 254016000000 ticks/segundo) sirve de respaldo si `.secs` no
 * estuviera.
 */
var QE_TICKS_POR_SEGUNDO = 254016000000;

function aSegundos(t) {
  if (t === null || t === undefined) return NaN;
  if (typeof t === "number") return t;
  if (typeof t.secs === "number") return t.secs;
  if (typeof t.ticks !== "undefined") {
    var ticks = parseFloat(t.ticks);
    if (!isNaN(ticks)) return ticks / QE_TICKS_POR_SEGUNDO;
  }
  return parseFloat(t);
}

/**
 * Segundos → el string que `Track.razor()` espera de verdad. Confirmado en
 * vivo, probando decenas de formatos contra la Premiere real del usuario
 * vía el MCP Bridge — no es cuestión de precisión decimal como se pensó al
 * principio, es un LÍMITE DE 6 CARACTERES en el string, a secas:
 *   - number (cualquier magnitud): "Illegal Parameter type", siempre.
 *   - string de TICKS: no lanza error, pero tampoco corta nada.
 *   - string de ≤6 caracteres ("10", "20.5", "40.555"...): corta bien.
 *   - string de ≥7 caracteres ("50.5555", "60.55555"...): no lanza error,
 *     pero tampoco corta nada — el parser interno se calla en silencio en
 *     vez de fallar. Confirmado con pruebas dirigidas: 6 va, 7 no, siempre.
 * De ahí que los decimales se recorten según cuántos dígitos ya ocupa la
 * parte entera, para no pasar nunca de 6 caracteres en total — muy por
 * encima de la precisión de un fotograma, así que no se pierde nada real.
 */
function aRazorString(segundos) {
  var digitosEnteros = String(Math.floor(Math.abs(segundos))).length;
  var decimales = 6 - digitosEnteros - 1; // -1 por el punto decimal
  if (decimales > 4) decimales = 4; // no hace falta más que eso para nada
  if (decimales < 0) decimales = 0;
  return segundos.toFixed(decimales);
}

/** ¿Hay un proyecto abierto? Sin esto, todo lo demás falla con errores crípticos. */
function sccEstado() {
  try {
    if (!app.project) {
      return respuesta(false, null, "No hay ningún proyecto abierto en Premiere.");
    }
    var nombreSecuencia = app.project.activeSequence ? app.project.activeSequence.name : "";
    return respuesta(
      true,
      '{"proyecto":"' +
        escapar(app.project.name) +
        '","secuencia":"' +
        escapar(nombreSecuencia) +
        '","version":"' +
        escapar(app.version) +
        '"}'
    );
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/**
 * Importa archivos al proyecto, dentro de un bin con nombre.
 *
 * `rutasJson` es un array JSON de rutas ABSOLUTAS de disco (las construye el
 * panel a partir de /api/system/paths). Se comprueba que cada archivo exista
 * antes de llamar a importFiles: si se le pasa una ruta muerta, Premiere
 * ignora el lote entero sin decir por qué, y desde el panel parecería que
 * "no ha pasado nada".
 */
function sccImportar(rutasJson, nombreBin) {
  try {
    if (!app.project) {
      return respuesta(false, null, "No hay ningún proyecto abierto en Premiere.");
    }

    var rutas = eval("(" + rutasJson + ")");
    if (!rutas || !rutas.length) {
      return respuesta(false, null, "No se ha recibido ninguna ruta que importar.");
    }

    var existentes = [];
    var faltan = [];
    for (var i = 0; i < rutas.length; i++) {
      var f = new File(rutas[i]);
      if (f.exists) {
        existentes.push(rutas[i]);
      } else {
        faltan.push(rutas[i]);
      }
    }

    if (!existentes.length) {
      return respuesta(false, null, "Ninguno de los archivos existe en disco. ¿Se ha renderizado ya?");
    }

    // Bin de destino: se reutiliza si ya existe, para no llenar el proyecto
    // de carpetas duplicadas cada vez que se importa algo.
    var raiz = app.project.rootItem;
    var destino = null;
    var bin = nombreBin && nombreBin.length ? nombreBin : "System Content Studio";
    for (var j = 0; j < raiz.children.numItems; j++) {
      var hijo = raiz.children[j];
      if (hijo.type === ProjectItemType.BIN && hijo.name === bin) {
        destino = hijo;
        break;
      }
    }
    if (!destino) {
      destino = raiz.createBin(bin);
    }

    app.project.importFiles(existentes, /* suppressWarnings */ true, destino, /* asNumberedStills */ false);

    return respuesta(
      true,
      '{"importados":' + existentes.length + ',"noEncontrados":' + faltan.length + ',"bin":"' + escapar(bin) + '"}'
    );
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/**
 * Importa un archivo al bin raíz si no estaba ya, y devuelve su
 * ProjectItem. Compartido por todas las funciones de insertar-en-secuencia
 * — antes vivía duplicado dentro de sccInsertarEnSecuencia.
 */
function importarYLocalizar(ruta) {
  var archivo = new File(ruta);
  if (!archivo.exists) {
    throw new Error("El archivo no existe en disco: " + ruta);
  }

  var raiz = app.project.rootItem;
  var antes = raiz.children.numItems;
  app.project.importFiles([ruta], true, raiz, false);

  // importFiles no devuelve el item creado, así que se busca el último
  // añadido comparando el número de hijos antes/después.
  var item = null;
  if (raiz.children.numItems > antes) {
    item = raiz.children[raiz.children.numItems - 1];
  } else {
    // Ya estaba importado: se busca por nombre de archivo.
    var nombre = archivo.name;
    for (var k = 0; k < raiz.children.numItems; k++) {
      if (raiz.children[k].name === nombre) {
        item = raiz.children[k];
        break;
      }
    }
  }
  if (!item) {
    throw new Error("No se ha podido localizar el clip importado en el proyecto: " + ruta);
  }
  return item;
}

/** Índice de pista válido, o -1 si no existe en la secuencia. */
function validarPistaVideo(sec, indicePista) {
  var pista = typeof indicePista === "number" ? indicePista : parseInt(indicePista, 10);
  if (isNaN(pista) || pista < 0) pista = 0;
  if (pista >= sec.videoTracks.numTracks) return -1;
  return pista;
}

/**
 * Importa e inserta directamente en la secuencia activa, en la pista de
 * vídeo indicada y en la posición del cursor de reproducción.
 *
 * Es lo que convierte el panel en algo útil de verdad: para un overlay
 * (subtítulos con alfa, una animación de contexto) lo que quieres no es
 * tenerlo en el bin, es tenerlo YA encima del plano en el que estás.
 */
function sccInsertarEnSecuencia(ruta, indicePista) {
  try {
    if (!app.project) {
      return respuesta(false, null, "No hay ningún proyecto abierto en Premiere.");
    }
    var sec = app.project.activeSequence;
    if (!sec) {
      return respuesta(false, null, "No hay ninguna secuencia activa. Abre una en el timeline.");
    }

    var item = importarYLocalizar(ruta);

    var pista = validarPistaVideo(sec, indicePista);
    if (pista < 0) {
      return respuesta(
        false,
        null,
        "La secuencia solo tiene " + sec.videoTracks.numTracks + " pistas de vídeo; pediste la V" + (indicePista + 1) + "."
      );
    }

    var tiempo = sec.getPlayerPosition();
    sec.videoTracks[pista].insertClip(item, tiempo.ticks);

    return respuesta(true, '{"pista":' + (pista + 1) + ',"clip":"' + escapar(item.name) + '"}');
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/**
 * Como sccInsertarEnSecuencia, pero en un TIEMPO ARBITRARIO de la
 * secuencia en vez de en el cursor de reproducción — lo que hace falta
 * para colocar un recurso exactamente donde dice una AnclaTemporal, sin
 * tener que mover el cursor a mano cada vez.
 *
 * El tiempo se pasa en segundos y se convierte a ticks (la DOM MODERNA de
 * Premiere, no la QE — aquí `insertClip` sí acepta un tiempo arbitrario
 * directamente, sin las rarezas de la API QE que hicieron falta para
 * sccRecortarSilencios).
 */
var TICKS_POR_SEGUNDO = 254016000000;

function sccInsertarEnTiempo(ruta, indicePista, tiempoSeg) {
  try {
    if (!app.project) {
      return respuesta(false, null, "No hay ningún proyecto abierto en Premiere.");
    }
    var sec = app.project.activeSequence;
    if (!sec) {
      return respuesta(false, null, "No hay ninguna secuencia activa. Abre una en el timeline.");
    }

    var item = importarYLocalizar(ruta);

    var pista = validarPistaVideo(sec, indicePista);
    if (pista < 0) {
      return respuesta(
        false,
        null,
        "La secuencia solo tiene " + sec.videoTracks.numTracks + " pistas de vídeo; pediste la V" + (indicePista + 1) + "."
      );
    }

    var ticks = String(Math.round(parseFloat(tiempoSeg) * TICKS_POR_SEGUNDO));
    sec.videoTracks[pista].insertClip(item, ticks);

    return respuesta(true, '{"pista":' + (pista + 1) + ',"clip":"' + escapar(item.name) + '","tiempoSeg":' + tiempoSeg + "}");
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/** Índice de pista de AUDIO válido, o -1 si no existe — hermano de validarPistaVideo. */
function validarPistaAudio(sec, indicePista) {
  var pista = typeof indicePista === "number" ? indicePista : parseInt(indicePista, 10);
  if (isNaN(pista) || pista < 0) pista = 0;
  if (pista >= sec.audioTracks.numTracks) return -1;
  return pista;
}

/**
 * Inserta VARIOS recursos de una sola llamada, cada uno en su tiempo y
 * pista — un "Insertar todo" para las anclas temporales de un guion, en
 * vez de un evalScript por recurso (más lento y más propenso a que el
 * cursor de reproducción se mueva entre medias por accidente).
 *
 * `itemsJson` es un array JSON de `{ruta, pista, tiempoSeg, tipo}`, donde
 * `tipo` es "video" (por defecto, para no romper llamadas antiguas) o
 * "audio" — así una misma llamada puede colocar el vídeo de una animación
 * Y sus sonidos sueltos (tecleo, whoosh) en su pista de audio, todo en el
 * mismo lote. Un fallo en UN item no aborta el resto — se acumulan
 * éxitos/fallos, igual que sccRecortarSilencios.
 */
function sccInsertarLoteEnSecuencia(itemsJson) {
  try {
    if (!app.project) {
      return respuesta(false, null, "No hay ningún proyecto abierto en Premiere.");
    }
    var sec = app.project.activeSequence;
    if (!sec) {
      return respuesta(false, null, "No hay ninguna secuencia activa. Abre una en el timeline.");
    }

    var items = eval("(" + itemsJson + ")");
    if (!items || !items.length) {
      return respuesta(false, null, "No se ha recibido ningún recurso que insertar.");
    }

    var insertados = 0;
    var fallidos = 0;
    var primerError = null;

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      try {
        var item = importarYLocalizar(it.ruta);
        var ticks = String(Math.round(parseFloat(it.tiempoSeg) * TICKS_POR_SEGUNDO));
        if (it.tipo === "audio") {
          var pistaA = validarPistaAudio(sec, it.pista);
          if (pistaA < 0) throw new Error("Pista de audio inválida: " + it.pista);
          sec.audioTracks[pistaA].insertClip(item, ticks);
        } else {
          var pistaV = validarPistaVideo(sec, it.pista);
          if (pistaV < 0) throw new Error("Pista de vídeo inválida: " + it.pista);
          sec.videoTracks[pistaV].insertClip(item, ticks);
        }
        insertados++;
      } catch (eItem) {
        fallidos++;
        if (!primerError) primerError = eItem.toString();
      }
    }

    return respuesta(
      true,
      '{"insertados":' +
        insertados +
        ',"fallidos":' +
        fallidos +
        ',"total":' +
        items.length +
        ',"primerError":"' +
        escapar(primerError || "") +
        '"}'
    );
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/**
 * Recorta de la secuencia activa una lista de rangos de silencio, en la
 * pista de vídeo indicada, con ripple (todo lo posterior se pega hacia
 * delante para no dejar huecos).
 *
 * `rangosJson` es un array JSON de `{inicioSeg, finSeg}` EN TIEMPO DE
 * SECUENCIA (el panel ya ha convertido los tiempos de silencedetect, que
 * son relativos al archivo de origen, sumando `clip.start` y restando
 * `clip.inPoint` — ver mandarRecortarSilencios en main.js). No se tocan las
 * pistas de audio por separado: en Premiere, al hacer ripple sobre un clip
 * enlazado (vídeo+audio del mismo archivo), el audio vinculado se mueve
 * solo con el vídeo.
 *
 * Usa la API "QE" (`app.enableQE()`), la capa de scripting histórica de
 * Premiere para edición de clips — no la DOM moderna, que no expone un
 * ripple-delete de rango arbitrario. Es la misma que usan la mayoría de
 * paneles de "quita silencios" que existen para Premiere.
 *
 * A diferencia del resto de host/index.jsx, esto SÍ se ha verificado contra
 * una Premiere real (26.2.0) — vía el MCP Bridge que el usuario ya tenía
 * instalado, que ejecuta .jsx sueltos dentro de la app y devuelve el
 * resultado. Así se confirmaron en vivo, con `reflect`, los nombres reales
 * de los métodos QE (`razor`, `rippleDelete`, no lo que se había supuesto
 * al principio) y el formato de argumento exacto que espera cada uno —
 * ver aSegundos/aRazorString arriba para el detalle de cada quirk.
 */
function sccRecortarSilencios(pista, rangosJson) {
  try {
    if (!app.project) {
      return respuesta(false, null, "No hay ningún proyecto abierto en Premiere.");
    }
    var sec = app.project.activeSequence;
    if (!sec) {
      return respuesta(false, null, "No hay ninguna secuencia activa. Abre una en el timeline.");
    }

    var rangos = eval("(" + rangosJson + ")");
    if (!rangos || !rangos.length) {
      return respuesta(false, null, "No se ha recibido ningún rango que recortar.");
    }

    app.enableQE();
    var qeSec = qe.project.getActiveSequence();
    if (!qeSec) {
      return respuesta(false, null, "No se ha podido acceder a la secuencia por la API QE de Premiere.");
    }

    var indicePista = typeof pista === "number" ? pista : parseInt(pista, 10);
    if (isNaN(indicePista) || indicePista < 0) indicePista = 0;
    var qeVideo = qeSec.getVideoTrackAt(indicePista);
    if (!qeVideo) {
      return respuesta(false, null, "No existe la pista de vídeo V" + (indicePista + 1) + " en la API QE.");
    }
    // El audio del clip principal vive normalmente en la pista de audio del
    // MISMO índice (A1 para V1, etc. — la convención por defecto de
    // Premiere al importar un archivo con audio+vídeo). Si no existe esa
    // pista de audio, se sigue recortando solo el vídeo en vez de fallar
    // entero: mejor un resultado parcial avisado que nada.
    var qeAudio = qeSec.getAudioTrackAt(indicePista);

    // De más tarde a más temprano: al recortar por el final primero, las
    // posiciones de los rangos que aún no se han tocado no se mueven —
    // recortar de temprano a tarde obligaría a recalcular cada rango
    // siguiente después de cada ripple. Válido pista por pista: un delete
    // en audio no mueve nada de vídeo ni viceversa, son listas de clips
    // independientes en la API QE.
    rangos.sort(function (a, b) {
      return b.inicioSeg - a.inicioSeg;
    });

    /**
     * Recorta UN rango en UNA pista (vídeo o audio, misma lógica para
     * las dos): dos cuchillas + buscar el trozo resultante + rippleDelete.
     * Devuelve {ok:true} o {ok:false, error, volcado} — nunca lanza, el
     * llamador decide qué hacer con cada resultado.
     */
    function recortarRangoEnPista(track, r) {
      var paso = "razor(inicio)";
      var valorInicio = aRazorString(r.inicioSeg);
      var valorFin = aRazorString(r.finSeg);
      try {
        var numItemsAntes = track.numItems;
        // Tiempo como STRING DE SEGUNDOS con ≤3 decimales — ver
        // aRazorString arriba para el porqué exacto (confirmado en vivo
        // contra Premiere real con el MCP Bridge, no adivinado).
        track.razor(valorInicio);
        var numItemsTrasInicio = track.numItems;
        paso = "razor(fin)";
        track.razor(valorFin);
        var numItemsTrasFin = track.numItems;

        paso = "buscar clip tras el razor";
        var encontrado = null;
        var volcado = [];
        for (var c = 0; c < track.numItems; c++) {
          var clip = track.getItemAt(c);
          if (!clip) continue;
          var inicioClip = aSegundos(clip.start);
          var finClip = aSegundos(clip.end);
          if (!isNaN(inicioClip) && Math.abs(inicioClip - r.inicioSeg) < 0.1) {
            encontrado = clip;
            break;
          }
          volcado.push(inicioClip.toFixed(3) + "→" + finClip.toFixed(3));
        }
        if (!encontrado) {
          return {
            ok: false,
            valorInicio: valorInicio,
            valorFin: valorFin,
            error:
              "No se encontró ningún clip en start=" +
              r.inicioSeg +
              " (pedido: razor(" +
              valorInicio +
              ") y razor(" +
              valorFin +
              ")). numItems antes=" +
              numItemsAntes +
              ", tras razor(inicio)=" +
              numItemsTrasInicio +
              ", tras razor(fin)=" +
              numItemsTrasFin +
              ". Clips vistos (inicio→fin): [" +
              volcado.join(", ") +
              "]",
          };
        }
        paso = "rippleDelete";
        // Método propio del clip (confirmado por reflect en vivo) — hace
        // exactamente lo que dice: borra este trozo y desplaza todo lo
        // posterior de la PISTA para cerrar el hueco. Cada pista (vídeo,
        // audio) se recorta por separado — la API QE no mueve el audio
        // enlazado solo al hacerlo sobre el vídeo, a pesar de lo que hace
        // el ripple delete normal de la interfaz.
        encontrado.rippleDelete();
        return { ok: true, valorInicio: valorInicio, valorFin: valorFin };
      } catch (eRango) {
        return { ok: false, valorInicio: valorInicio, valorFin: valorFin, error: "[" + paso + "] " + eRango.toString() };
      }
    }

    var cortadosVideo = 0;
    var cortadosAudio = 0;
    var fallidos = 0;
    // El motivo del PRIMER fallo (de cualquiera de las dos pistas), tal
    // cual — con eso basta para diagnosticar, no hace falta guardar 33.
    var primerError = null;
    // Detalle de los primeros N rangos (éxito o fallo) — para ver si el
    // patrón es el mismo en todos o cambia. Solo vídeo, para no duplicar.
    var LOG_MAX = 5;
    var log = [];

    for (var i = 0; i < rangos.length; i++) {
      var r = rangos[i];
      var resVideo = recortarRangoEnPista(qeVideo, r);
      if (resVideo.ok) {
        cortadosVideo++;
      } else {
        fallidos++;
        if (!primerError) primerError = "[vídeo] " + resVideo.error;
      }
      if (log.length < LOG_MAX) {
        log.push({
          inicioSeg: r.inicioSeg,
          finSeg: r.finSeg,
          valorInicio: resVideo.valorInicio,
          valorFin: resVideo.valorFin,
          ok: resVideo.ok,
        });
      }

      if (qeAudio) {
        var resAudio = recortarRangoEnPista(qeAudio, r);
        if (resAudio.ok) {
          cortadosAudio++;
        } else if (!primerError) {
          primerError = "[audio] " + resAudio.error;
        }
      }
    }

    var logTexto = [];
    for (var li = 0; li < log.length; li++) {
      var le = log[li];
      logTexto.push(
        (le.ok ? "OK" : "FALLO") +
          " inicioSeg=" +
          le.inicioSeg +
          "->razor(" +
          le.valorInicio +
          ") finSeg=" +
          le.finSeg +
          "->razor(" +
          le.valorFin +
          ")"
      );
    }

    return respuesta(
      true,
      '{"cortados":' +
        cortadosVideo +
        ',"cortadosAudio":' +
        cortadosAudio +
        ',"tuvoAudio":' +
        (qeAudio ? "true" : "false") +
        ',"fallidos":' +
        fallidos +
        ',"total":' +
        rangos.length +
        ',"primerError":"' +
        escapar(primerError || "") +
        '","log":"' +
        escapar(logTexto.join(" | ")) +
        '"}'
    );
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/** Cuántas pistas de vídeo tiene la secuencia activa, para poblar el selector del panel. */
function sccPistas() {
  try {
    var sec = app.project ? app.project.activeSequence : null;
    if (!sec) {
      return respuesta(true, '{"pistas":0}');
    }
    return respuesta(true, '{"pistas":' + sec.videoTracks.numTracks + "}");
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/**
 * Diálogo nativo de "abrir archivo", para el flujo de Transcribir.
 *
 * El panel es Chromium normal y un `<input type=file>` en algunas versiones
 * de CEF no expone la ruta absoluta del archivo elegido (por seguridad del
 * propio navegador) — File.openDialog() de ExtendScript sí la da siempre,
 * porque corre dentro de Premiere, no dentro del panel.
 *
 * Devuelve `{"ruta": null}` si el usuario cancela, no un error: cancelar no
 * es un fallo, es una respuesta válida.
 */
function sccElegirArchivo() {
  try {
    var filtro = "Audio o vídeo:*.mp4;*.mov;*.mp3;*.wav;*.m4a;*.aac;*.webm";
    var archivo = File.openDialog("Elige el audio o vídeo a transcribir", filtro, false);
    if (!archivo) {
      return respuesta(true, '{"ruta":null}');
    }
    return respuesta(true, '{"ruta":"' + escapar(archivo.fsName) + '","nombre":"' + escapar(archivo.name) + '"}');
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/**
 * El "vídeo principal": el clip que hay justo debajo del cursor de
 * reproducción en la secuencia activa, mirando las pistas de vídeo de abajo
 * arriba (V1 primero — es la base del montaje en casi cualquier proyecto,
 * así que es la lectura más razonable de "el vídeo principal" sin pedirle
 * nada al usuario). Si quiere transcribir OTRO clip, mueve el cursor sobre
 * él y vuelve a pulsar: es la misma idea que "el que tú selecciones" pero
 * sin depender de la selección de teclado/ratón en el Project panel, que
 * ExtendScript no siempre puede leer de forma fiable entre versiones.
 *
 * Devuelve también la pista donde estaba, para que el panel pueda insertar
 * el subtítulo generado una pista por encima sin preguntar.
 */
function sccClipPrincipal() {
  try {
    var sec = app.project.activeSequence;
    if (!sec) {
      return respuesta(false, null, "No hay ninguna secuencia activa. Abre una en el timeline.");
    }
    var ahora = sec.getPlayerPosition().seconds;

    for (var t = 0; t < sec.videoTracks.numTracks; t++) {
      var pista = sec.videoTracks[t];
      for (var c = 0; c < pista.clips.numItems; c++) {
        var clip = pista.clips[c];
        if (ahora >= clip.start.seconds && ahora < clip.end.seconds) {
          var item = clip.projectItem;
          if (!item) continue;
          var ruta = item.getMediaPath();
          if (!ruta) continue;
          return respuesta(
            true,
            '{"ruta":"' +
              escapar(ruta) +
              '","nombre":"' +
              escapar(item.name) +
              '","pista":' +
              t +
              ',"totalPistas":' +
              sec.videoTracks.numTracks +
              // Con esto el panel puede convertir tiempos del ARCHIVO de
              // origen (lo que devuelve /api/ai/silencios/detectar, que
              // analiza el archivo directo) a tiempo de SECUENCIA:
              // tiempoSecuencia = clipStartSeg + (tiempoArchivo - clipInPointSeg).
              ',"clipStartSeg":' +
              clip.start.seconds +
              ',"clipInPointSeg":' +
              clip.inPoint.seconds +
              "}"
          );
        }
      }
    }
    return respuesta(
      false,
      null,
      "No hay ningún clip de vídeo bajo el cursor de reproducción. Mueve el cursor sobre el clip que quieres transcribir."
    );
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/**
 * Los clips de vídeo seleccionados ahora mismo en la secuencia activa —
 * para aplicarles un LUT sin que el usuario tenga que teclear nada. Usa
 * `sequence.getSelection()` de la DOM MODERNA (no la QE) — verificado en
 * vivo que es fiable, a diferencia de casi todo lo que se probó de la QE
 * hoy (razor, addVideoEffect). Solo clips de vídeo con projectItem propio
 * (no un color mate ni un título) tienen sentido para un LUT.
 */
function sccObtenerSeleccion() {
  try {
    if (!app.project) {
      return respuesta(false, null, "No hay ningún proyecto abierto en Premiere.");
    }
    var sec = app.project.activeSequence;
    if (!sec) {
      return respuesta(false, null, "No hay ninguna secuencia activa. Abre una en el timeline.");
    }

    var seleccion = sec.getSelection();
    if (!seleccion || !seleccion.length) {
      return respuesta(false, null, "No hay ningún clip seleccionado en el timeline. Selecciona uno o varios y vuelve a intentarlo.");
    }

    var clips = [];
    for (var i = 0; i < seleccion.length; i++) {
      var it = seleccion[i];
      if (!it.projectItem) continue; // color mate, título, etc. — sin archivo de origen, no hay LUT que aplicar
      var ruta = it.projectItem.getMediaPath();
      if (!ruta) continue;
      clips.push(
        '{"nombre":"' +
          escapar(it.name) +
          '","mediaPath":"' +
          escapar(ruta) +
          '","startTicks":"' +
          it.start.ticks +
          '","pista":' +
          it.parentTrackIndex +
          "}"
      );
    }
    if (!clips.length) {
      return respuesta(false, null, "Lo seleccionado no tiene archivo de origen propio (¿un color mate o un título?) — un LUT no aplica ahí.");
    }

    return respuesta(true, "[" + clips.join(",") + "]");
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}

/**
 * Sustituye cada clip por su versión con el LUT ya horneado (el archivo
 * nuevo lo genera /api/ai/luts/aplicar con ffmpeg — ver la cabecera de
 * src/lib/luts/aplicar.ts para el porqué de este camino en vez del efecto
 * Lumetri de Premiere). `remove(false, false)` + `insertClip` en el mismo
 * `startTicks` de origen: verificado en vivo que es exacto — a diferencia
 * de razor(), esto no calcula ningún tiempo nuevo, solo reinserta en la
 * misma posición que ya tenía el clip.
 *
 * `itemsJson` es un array de `{rutaNueva, startTicks, pista}` — el panel
 * ya ha emparejado cada clip original con su archivo con LUT.
 */
function sccSustituirClips(itemsJson) {
  try {
    if (!app.project) {
      return respuesta(false, null, "No hay ningún proyecto abierto en Premiere.");
    }
    var sec = app.project.activeSequence;
    if (!sec) {
      return respuesta(false, null, "No hay ninguna secuencia activa. Abre una en el timeline.");
    }

    var items = eval("(" + itemsJson + ")");
    if (!items || !items.length) {
      return respuesta(false, null, "No se ha recibido ningún clip que sustituir.");
    }

    var sustituidos = 0;
    var fallidos = 0;
    var primerError = null;

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      try {
        var pista = validarPistaVideo(sec, it.pista);
        if (pista < 0) throw new Error("Pista de vídeo inválida: " + it.pista);
        var track = sec.videoTracks[pista];

        // Encuentra el clip que ahora mismo ocupa ese punto exacto de la
        // pista (por posición, no por índice — puede haber cambiado si un
        // item anterior de este mismo lote ya se sustituyó).
        var objetivo = null;
        for (var c = 0; c < track.clips.numItems; c++) {
          var cl = track.clips[c];
          if (cl.start.ticks === it.startTicks) {
            objetivo = cl;
            break;
          }
        }
        if (!objetivo) throw new Error("No se encontró el clip original en startTicks=" + it.startTicks + " (¿se movió?).");

        objetivo.remove(false, false);

        var itemNuevo = importarYLocalizar(it.rutaNueva);
        track.insertClip(itemNuevo, it.startTicks);
        sustituidos++;
      } catch (eItem) {
        fallidos++;
        if (!primerError) primerError = eItem.toString();
      }
    }

    return respuesta(
      true,
      '{"sustituidos":' + sustituidos + ',"fallidos":' + fallidos + ',"total":' + items.length + ',"primerError":"' + escapar(primerError || "") + '"}'
    );
  } catch (e) {
    return respuesta(false, null, e.toString());
  }
}
