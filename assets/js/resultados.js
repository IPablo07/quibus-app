/**
 * resultados.js
 * Lee ?origen=...&destino=... de la URL, filtra QUIBUS_RUTAS (data.js)
 * y reemplaza las tarjetas <article> quemadas por las que realmente coinciden.
 */

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector("section.resultados-grid");
  const { map, capaMarcadores } = initQuiBusMapa("mapa-resultados") || {};

  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const idsParada = params.get("rutas");

  // Si venimos de "seleccionar una parada" (paradas-cercanas.html), esa
  // parada ya sabe qué rutas la sirven; si no, es una búsqueda por origen/destino.
  const rutas = idsParada
    ? buscarRutasPorIds(idsParada.split(","))
    : buscarRutas(params.get("origen") || "", params.get("destino") || "");

  // Elimina los <article> quemados en el HTML, deja el <h2> intacto.
  contenedor.querySelectorAll("article").forEach((art) => art.remove());

  const paradasEncontradas = rutas.map((ruta) => ({
    nombre: ruta.parada,
    coords: ruta.coords,
    rutas: [ruta.id],
  }));
  pintarParadasEnMapa(map, capaMarcadores, paradasEncontradas);

  if (rutas.length === 0) {
    const vacio = document.createElement("p");
    vacio.textContent = "No se encontraron rutas para esa búsqueda.";
    contenedor.appendChild(vacio);
    return;
  }

  rutas.forEach((ruta) => {
    const articulo = document.createElement("article");
    articulo.setAttribute(
      "aria-label",
      `Ruta ${ruta.id}, tiempo estimado ${ruta.tiempo} minutos, parada ${ruta.parada}`
    );
    articulo.innerHTML = `
      <h3>${ruta.id} - Ruta de Bus</h3>
      <p>Tiempo estimado: ${ruta.tiempo} min</p>
      <p>Parada: ${ruta.parada}</p>
    `;
    contenedor.appendChild(articulo);
  });
});
