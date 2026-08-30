/**
 * mapa.js
 * Inicializa un mapa Leaflet + OpenStreetMap dentro de un contenedor dado,
 * reemplazando el iframe de Google Maps. Reutilizable en todas las pantallas
 * que necesitan mostrar paradas/rutas (index, resultados, paradas-cercanas, favoritos).
 */

const QUIBUS_CENTRO_QUITO = [-0.1900, -78.4950];

/**
 * Crea el mapa y devuelve { map, capaMarcadores } para que cada pantalla
 * pueda actualizar sus propios marcadores (ej. al filtrar o buscar).
 */
function initQuiBusMapa(containerId, { centro = QUIBUS_CENTRO_QUITO, zoom = 12 } = {}) {
  const contenedor = document.getElementById(containerId);
  if (!contenedor || typeof L === "undefined") return null;

  const map = L.map(containerId).setView(centro, zoom);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const capaMarcadores = L.layerGroup().addTo(map);

  // El contenedor puede no tener aún su tamaño final (aspect-ratio) en el
  // momento exacto de DOMContentLoaded; se re-mide en el siguiente frame
  // y de nuevo al terminar de cargar la página para evitar un mapa en blanco.
  requestAnimationFrame(() => map.invalidateSize());
  window.addEventListener("load", () => map.invalidateSize());

  return { map, capaMarcadores };
}

/**
 * Reemplaza los marcadores de una capa por los de la lista de paradas dada.
 * Cada parada debe tener { nombre, coords: [lat, lng], rutas? }.
 * Si hay marcadores, ajusta el encuadre del mapa para que todos sean visibles.
 */
function pintarParadasEnMapa(map, capaMarcadores, paradas) {
  if (!map || !capaMarcadores) return;

  capaMarcadores.clearLayers();

  const puntos = paradas.filter((p) => Array.isArray(p.coords));
  if (puntos.length === 0) return;

  puntos.forEach((parada) => {
    const rutasTexto = parada.rutas ? ` &middot; ${parada.rutas.join(", ")}` : "";
    L.marker(parada.coords)
      .bindPopup(`<strong>${parada.nombre}</strong>${rutasTexto}`)
      .addTo(capaMarcadores);
  });

  if (puntos.length === 1) {
    map.setView(puntos[0].coords, 15);
  } else {
    map.fitBounds(puntos.map((p) => p.coords), { padding: [24, 24] });
  }
}
