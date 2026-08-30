/**
 * favoritos.js
 * Gestiona la pantalla de favoritos (pages/favoritos.html):
 * pintar la lista, añadir rutas, eliminarlas y mostrarlas en el mapa.
 *
 * Los favoritos se guardan en localStorage para que sobrevivan a una recarga.
 * Equivale a la tabla "favorito" de la base de datos: hoy se guardan en el
 * navegador, con un backend serían INSERT y DELETE contra PostgreSQL.
 */

const FAVORITOS_STORAGE_KEY = "quibus_favoritos";

/**
 * Lee los códigos de ruta favoritos guardados en el navegador.
 * Si todavía no hay nada guardado, usa QUIBUS_FAVORITOS (data.js)
 * como valor inicial.
 */
function leerFavoritos() {
  try {
    const guardado = localStorage.getItem(FAVORITOS_STORAGE_KEY);
    if (guardado) return JSON.parse(guardado);
  } catch (error) {
    // localStorage puede fallar en modo incógnito o si el dato quedó corrupto.
    console.warn("No se pudieron leer los favoritos guardados:", error);
  }
  return [...QUIBUS_FAVORITOS];
}

/** Guarda la lista de códigos favoritos en el navegador. */
function guardarFavoritos(codigos) {
  try {
    localStorage.setItem(FAVORITOS_STORAGE_KEY, JSON.stringify(codigos));
  } catch (error) {
    console.warn("No se pudieron guardar los favoritos:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.querySelector("ul.lista-favoritos");
  if (!lista) return;

  const modal       = document.getElementById("modalAnadir");
  const select      = document.getElementById("selectRuta");
  const btnAbrir    = document.querySelector(".boton-anadir");
  const btnCancelar = document.getElementById("cancelarAnadir");
  const btnConfirmar = document.getElementById("confirmarAnadir");

  const { map, capaMarcadores } = initQuiBusMapa("mapa-favoritos") || {};

  let favoritos = leerFavoritos();

  /**
   * Llena el desplegable solo con las rutas que AÚN NO son favoritas.
   * Es la misma regla que la restricción UNIQUE (usuario_id, ruta_id)
   * de la base de datos: un usuario no puede guardar dos veces la misma ruta.
   */
  function actualizarSelect() {
    if (!select) return;

    const disponibles = QUIBUS_RUTAS.filter((ruta) => !favoritos.includes(ruta.id));

    select.innerHTML = "";
    disponibles.forEach((ruta) => {
      const opcion = document.createElement("option");
      opcion.value = ruta.id;
      opcion.textContent = `${ruta.id}: ${ruta.origen} → ${ruta.destino}`;
      select.appendChild(opcion);
    });

    // Si ya se añadieron todas las rutas, no tiene sentido dejar el botón activo.
    if (btnAbrir) {
      const sinRutas = disponibles.length === 0;
      btnAbrir.disabled = sinRutas;
      btnAbrir.textContent = sinRutas ? "Ya añadiste todas las rutas" : "Añadir ruta";
    }
  }

  /** Vuelve a pintar la lista, el mapa y el desplegable con el estado actual. */
  function render() {
    const rutasFavoritas = buscarRutasPorIds(favoritos);

    lista.innerHTML = "";

    if (rutasFavoritas.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "favoritos-vacio";
      vacio.textContent = "Todavía no tienes rutas favoritas.";
      lista.appendChild(vacio);
    }

    rutasFavoritas.forEach((ruta) => {
      const li = document.createElement("li");

      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "ruta-favorita";
      boton.setAttribute(
        "aria-label",
        `Ruta favorita ${ruta.id}, desde ${ruta.origen} hasta ${ruta.destino}`
      );
      boton.innerHTML = `${ruta.id}: ${ruta.origen} &rarr; ${ruta.destino}`;
      boton.addEventListener("click", () => {
        window.location.href = `resultados.html?rutas=${ruta.id}`;
      });

      const eliminar = document.createElement("button");
      eliminar.type = "button";
      eliminar.className = "favorito-eliminar";
      eliminar.textContent = "✕";
      eliminar.setAttribute("aria-label", `Eliminar la ruta ${ruta.id} de favoritos`);
      eliminar.addEventListener("click", () => quitarFavorito(ruta.id));

      li.appendChild(boton);
      li.appendChild(eliminar);
      lista.appendChild(li);
    });

    // El mapa muestra las paradas de las rutas favoritas actuales.
    pintarParadasEnMapa(
      map,
      capaMarcadores,
      rutasFavoritas.map((ruta) => ({
        nombre: ruta.parada,
        coords: ruta.coords,
        rutas: [ruta.id],
      }))
    );

    actualizarSelect();
  }

  function agregarFavorito(codigo) {
    if (!codigo || favoritos.includes(codigo)) return;
    favoritos.push(codigo);
    guardarFavoritos(favoritos);
    render();
  }

  function quitarFavorito(codigo) {
    favoritos = favoritos.filter((id) => id !== codigo);
    guardarFavoritos(favoritos);
    render();
  }

  // --- Control del modal ---
  // El foco, la trampa de tabulacion, Escape y la devolucion del foco al boton
  // que lo abrio los gestiona iniciarModal (js/modal.js), igual que en perfil.
  if (modal) {
    const dialogo = iniciarModal(modal, { focoInicial: "#selectRuta" });

    if (btnAbrir) btnAbrir.addEventListener("click", dialogo.abrir);
    if (btnCancelar) btnCancelar.addEventListener("click", dialogo.cerrar);

    if (btnConfirmar) {
      btnConfirmar.addEventListener("click", () => {
        agregarFavorito(select.value);
        dialogo.cerrar();
      });
    }
  }

  render();
});
