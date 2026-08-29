/**
 * buscar.js
 * Al enviar el formulario de "Buscar Viaje" en index.html, en vez de recargar
 * la página (action="#"), redirige a resultados.html pasando origen y destino
 * como parámetros en la URL.
 */

/**
 * Pinta las rutas de menor tiempo de viaje en el panel lateral de la portada.
 * Sustituye a las tres tarjetas que estaban escritas a mano en el HTML: el
 * criterio sale de los datos, asi que la lista sigue siendo cierta cuando se
 * añade o se cambia una ruta en data.js.
 */
function pintarRutasRapidas(cuantas = 3) {
  const panel = document.querySelector("aside.resultados-lista");
  if (!panel || typeof QUIBUS_RUTAS === "undefined") return;

  const rapidas = [...QUIBUS_RUTAS]
    .sort((a, b) => a.tiempo - b.tiempo)
    .slice(0, cuantas);

  rapidas.forEach((ruta) => {
    const articulo = document.createElement("article");
    articulo.innerHTML = `
      <h3>${ruta.id} - Ruta de Bus</h3>
      <p>Tiempo estimado: ${ruta.tiempo} min</p>
      <p>Parada: ${ruta.parada}</p>
    `;

    const enlace = document.createElement("a");
    enlace.href = `pages/resultados.html?rutas=${ruta.id}`;
    enlace.textContent = `Ver la ruta ${ruta.id}`;
    articulo.appendChild(enlace);

    panel.appendChild(articulo);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  pintarRutasRapidas();

  const form = document.querySelector('main section[aria-label="Formulario de búsqueda de viaje"] form');
  if (!form) return;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const origen = document.getElementById("origen").value.trim();
    const destino = document.getElementById("destino").value.trim();

    const params = new URLSearchParams();
    if (origen) params.set("origen", origen);
    if (destino) params.set("destino", destino);

    window.location.href = `pages/resultados.html?${params.toString()}`;
  });
});
