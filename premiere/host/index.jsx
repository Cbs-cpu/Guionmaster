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

    var archivo = new File(ruta);
    if (!archivo.exists) {
      return respuesta(false, null, "El archivo no existe en disco: " + ruta);
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
      return respuesta(false, null, "No se ha podido localizar el clip importado en el proyecto.");
    }

    var pista = typeof indicePista === "number" ? indicePista : parseInt(indicePista, 10);
    if (isNaN(pista) || pista < 0) pista = 0;
    if (pista >= sec.videoTracks.numTracks) {
      return respuesta(
        false,
        null,
        "La secuencia solo tiene " + sec.videoTracks.numTracks + " pistas de vídeo; pediste la V" + (pista + 1) + "."
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
 * paneles de "quita silencios" que existen para Premiere. AVISO: esta
 * función no se ha podido probar dentro de Premiere de verdad (ver
 * README.md, "Verificado hasta dónde se puede sin abrir Premiere") — si al
 * usarla algo no cuadra, el mensaje de error exacto es lo que hace falta
 * para arreglarlo, no hay forma de adivinarlo desde fuera de la app.
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
    var qeTrack = qeSec.getVideoTrackAt(indicePista);
    if (!qeTrack) {
      return respuesta(false, null, "No existe la pista de vídeo V" + (indicePista + 1) + " en la API QE.");
    }

    // De más tarde a más temprano: al recortar por el final primero, las
    // posiciones de los rangos que aún no se han tocado no se mueven —
    // recortar de temprano a tarde obligaría a recalcular cada rango
    // siguiente después de cada ripple.
    rangos.sort(function (a, b) {
      return b.inicioSeg - a.inicioSeg;
    });

    var cortados = 0;
    var fallidos = 0;
    // El motivo del PRIMER fallo, tal cual — con eso basta para diagnosticar
    // (los 33 fallan siempre por la misma razón: un nombre de método/
    // propiedad que no es el de esta versión de la API QE). Guardar los 33
    // solo repetiría el mismo texto treinta y tres veces.
    var primerError = null;

    for (var i = 0; i < rangos.length; i++) {
      var r = rangos[i];
      // Etiqueta de qué paso se estaba intentando cuando algo revienta —
      // "Illegal Parameter type" no dice cuál de las tres llamadas fue, así
      // que si vuelve a fallar, al menos sabremos CUÁL sin adivinar otra vez.
      var paso = "razor(inicio)";
      try {
        // Dos cuchillas: una al inicio del silencio, otra al final. El
        // trozo que queda entre ambas es el silencio suelto. El tiempo se
        // manda como STRING, no como number — la API QE (histórica, no la
        // DOM moderna) es quisquillosa con esto en varias de sus versiones.
        qeTrack.razor(String(r.inicioSeg));
        paso = "razor(fin)";
        qeTrack.razor(String(r.finSeg));

        paso = "buscar clip tras el razor";
        var encontrado = null;
        var volcado = []; // solo se rellena si no se encuentra nada, para el diagnóstico
        for (var c = 0; c < qeTrack.numItems; c++) {
          var clip = qeTrack.getItemAt(c);
          if (!clip) continue;
          // clip.start puede venir como number plano (DOM moderna) o como
          // algo con `.seconds` (Time-like, API QE histórica) — de ahí que
          // el intento anterior con parseFloat(clip.start) fallara SIEMPRE
          // si clip.start era un objeto o un timecode tipo "0:00:05:12"
          // (parseFloat se para en el primer ":" y da 0, no 5.12).
          var inicioClip =
            typeof clip.start === "number"
              ? clip.start
              : clip.start && typeof clip.start.seconds === "number"
                ? clip.start.seconds
                : parseFloat(clip.start);
          if (!isNaN(inicioClip) && Math.abs(inicioClip - r.inicioSeg) < 0.1) {
            encontrado = clip;
            break;
          }
          volcado.push(String(clip.start) + " (typeof " + typeof clip.start + ")");
        }
        if (encontrado) {
          paso = "remove";
          // remove(ripple, alignToVideo): con ripple=true todo lo que hay
          // detrás en esta pista se desplaza para cerrar el hueco.
          encontrado.remove(true, true);
          cortados++;
        } else {
          fallidos++;
          if (!primerError) {
            primerError =
              "No se encontró ningún clip en start=" +
              r.inicioSeg +
              " tras el razor (numItems=" +
              qeTrack.numItems +
              "). Starts vistos: [" +
              volcado.join(", ") +
              "]";
          }
        }
      } catch (eRango) {
        fallidos++;
        if (!primerError) primerError = "[" + paso + "] " + eRango.toString();
      }
    }

    return respuesta(
      true,
      '{"cortados":' +
        cortados +
        ',"fallidos":' +
        fallidos +
        ',"total":' +
        rangos.length +
        ',"primerError":"' +
        escapar(primerError || "") +
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
