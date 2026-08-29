/**
 * modal.js
 * Comportamiento de teclado y foco compartido por los dialogos de la app
 * (el de "Añadir ruta" en favoritos y el de "Cerrar sesion" en perfil).
 *
 * Un dialogo accesible necesita tres cosas que antes faltaban:
 *   1. Llevar el foco dentro al abrirse, si no, quien usa teclado o lector de
 *      pantalla sigue "de pie" en la pagina de detras sin saber que se abrio algo.
 *   2. Atrapar el foco mientras esta abierto, para no tabular hasta controles
 *      que estan visualmente tapados por el dialogo.
 *   3. Devolver el foco al boton que lo abrio al cerrarse, para no perder el
 *      sitio en la pagina.
 *
 * Los atributos role="dialog" y aria-modal="true" van en el HTML; esto es solo
 * la parte de comportamiento.
 */

/** Controles del dialogo que pueden recibir foco, en orden de tabulacion. */
function enfocables(modal) {
  const selector =
    'a[href], button:not([disabled]), select:not([disabled]), ' +
    'input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(modal.querySelectorAll(selector)).filter(
    (el) => !el.hidden && el.offsetParent !== null
  );
}

/**
 * Prepara un dialogo y devuelve { abrir, cerrar }.
 *
 * @param {HTMLElement} modal        El contenedor del dialogo.
 * @param {object}      opciones
 * @param {string}      opciones.focoInicial  Selector del control que recibe el
 *        foco al abrir. Por defecto, el primero que pueda recibirlo.
 */
function iniciarModal(modal, { focoInicial } = {}) {
  let disparador = null;

  function abrir() {
    // Se guarda quien abrio el dialogo para devolverle el foco despues.
    disparador = document.activeElement;
    modal.hidden = false;

    const destino = focoInicial ? modal.querySelector(focoInicial) : null;
    const primero = destino || enfocables(modal)[0];
    if (primero) primero.focus();
  }

  function cerrar() {
    if (modal.hidden) return;
    modal.hidden = true;
    if (disparador && document.contains(disparador)) disparador.focus();
    disparador = null;
  }

  modal.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      evento.preventDefault();
      cerrar();
      return;
    }

    if (evento.key !== "Tab") return;

    // Trampa de foco: al pasar del ultimo control se vuelve al primero, y al
    // reves con Shift+Tab, de modo que el recorrido nunca sale del dialogo.
    const controles = enfocables(modal);
    if (controles.length === 0) return;

    const primero = controles[0];
    const ultimo = controles[controles.length - 1];

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  });

  return { abrir, cerrar };
}
