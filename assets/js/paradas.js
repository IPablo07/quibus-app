/**
 * paradas.js
 * Filtra en vivo la lista de paradas en pages/paradas-cercanas.html
 * usando QUIBUS_PARADAS (data.js), sin recargar la página.
 */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("busqueda-parada");
  const lista = document.querySelector("ul.lista-paradas");
  const form = document.querySelector("form.filtro-paradas");
  const { map, capaMarcadores } = initQuiBusMapa("mapa-paradas") || {};
  if (!input || !lista) return;

  // Evita que Enter recargue la página (el formulario no tiene action real).
  if (form) form.addEventListener("submit", (e) => e.preventDefault());

  function renderParadas(paradas) {
    lista.innerHTML = "";

    if (paradas.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No se encontraron paradas.";
      lista.appendChild(li);
      return;
    }

    paradas.forEach((parada) => {
      const li = document.createElement("li");
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "parada-item";

      const rutasTexto =
        parada.rutas.length > 1
          ? `Rutas ${parada.rutas.join(", ")}`
          : `Ruta ${parada.rutas[0]}`;

      boton.setAttribute(
        "aria-label",
        `${parada.nombre}, a ${parada.distancia} metros, ${rutasTexto}`
      );
      boton.innerHTML = `
        <span class="parada-item__nombre">${parada.nombre}</span>
        <span class="parada-item__meta">${parada.distancia} m &middot; ${rutasTexto}</span>
      `;
      // Al seleccionar una parada, va directo a las rutas que ya sabemos que la sirven.
      boton.addEventListener("click", () => {
        const idsRutas = encodeURIComponent(parada.rutas.join(","));
        window.location.href = `resultados.html?rutas=${idsRutas}`;
      });
      li.appendChild(boton);
      lista.appendChild(li);
    });

    pintarParadasEnMapa(map, capaMarcadores, paradas);
  }

  // Pinta la lista completa al cargar (ya usando data.js, no el HTML quemado)
  renderParadas(QUIBUS_PARADAS);

  input.addEventListener("input", () => {
    renderParadas(filtrarParadas(input.value));
  });
});
