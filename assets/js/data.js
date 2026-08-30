/**
 * data.js
 * Dataset central de QuiBus: rutas y paradas de bus.
 * Toda la app lee de aquí en vez de tener datos "quemados" en el HTML.
 * Para agregar una ruta o parada nueva, solo hay que añadir un objeto al arreglo correspondiente.
 */

/**
 * Coordenadas aproximadas (lat, lng) de referencia para cada punto nombrado
 * en QUIBUS_RUTAS / QUIBUS_PARADAS, usadas para pintar marcadores en Leaflet.
 * Son ubicaciones reales de Quito pero aproximadas para el prototipo.
 */
const QUIBUS_COORDS = {
  "Parque Carolina":      [-0.1807, -78.4890],
  "Estación Norte":       [-0.1700, -78.4820],
  "Iglesia de la Merced": [-0.2201, -78.5125],
  "Centro Histórico":     [-0.2205, -78.5120],
  "La Magdalena":         [-0.2350, -78.5220],
  "El Recreo":            [-0.2460, -78.5210],
  "Carcelén":             [-0.1050, -78.4650],
  "El Playón":            [-0.2850, -78.5450],
  "CCI":                  [-0.1775, -78.4835],
  "Labrador":             [-0.1620, -78.4780],
};

const QUIBUS_RUTAS = [
  { id: "T1", origen: "Parque Carolina", destino: "Estación Norte",   tiempo: 15, parada: "Parque Carolina", coords: QUIBUS_COORDS["Parque Carolina"] },
  { id: "T2", origen: "Iglesia de la Merced", destino: "Centro Histórico", tiempo: 30, parada: "Iglesia de la Merced", coords: QUIBUS_COORDS["Iglesia de la Merced"] },
  { id: "T4", origen: "La Magdalena", destino: "El Recreo", tiempo: 15, parada: "La Magdalena", coords: QUIBUS_COORDS["La Magdalena"] },
  { id: "T6", origen: "Carcelén", destino: "El Playón", tiempo: 45, parada: "El Playón", coords: QUIBUS_COORDS["El Playón"] },
  { id: "T8", origen: "CCI", destino: "Estación Norte", tiempo: 15, parada: "CCI", coords: QUIBUS_COORDS["CCI"] },
  { id: "T9", origen: "El Playón", destino: "Labrador", tiempo: 45, parada: "El Playón", coords: QUIBUS_COORDS["El Playón"] },
];

const QUIBUS_PARADAS = [
  { nombre: "Parada Parque Carolina", distancia: 200, rutas: ["T1"], coords: QUIBUS_COORDS["Parque Carolina"] },
  { nombre: "Parada Carcelén",        distancia: 450, rutas: ["T6"], coords: QUIBUS_COORDS["Carcelén"] },
  { nombre: "Parada CCI",             distancia: 600, rutas: ["T1", "T8"], coords: QUIBUS_COORDS["CCI"] },
];

/**
 * Rutas que el usuario guardó como favoritas.
 * Solo se guardan los códigos: el nombre, origen y destino se leen
 * de QUIBUS_RUTAS, para no repetir la misma información en dos lugares.
 * Equivale a la tabla "favorito" de la base de datos, que guarda ruta_id.
 */
const QUIBUS_FAVORITOS = ["T1", "T8"];



/**
 * Busca rutas cuyo origen o destino coincida (parcialmente, sin distinguir mayúsculas/acentos)
 * con los textos ingresados por el usuario.
 */
function buscarRutas(origen, destino) {
  const norm = (str) =>
    (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const o = norm(origen);
  const d = norm(destino);

  return QUIBUS_RUTAS.filter((ruta) => {
    const coincideOrigen = o === "" || norm(ruta.origen).includes(o);
    const coincideDestino = d === "" || norm(ruta.destino).includes(d);
    return coincideOrigen && coincideDestino;
  });
}

/**
 * Devuelve las rutas cuyo id está en la lista dada (usado al seleccionar
 * una parada en paradas-cercanas.html, que ya sabe qué rutas la sirven).
 */
function buscarRutasPorIds(ids) {
  return QUIBUS_RUTAS.filter((ruta) => ids.includes(ruta.id));
}

/**
 * Filtra paradas por nombre (usado en el buscador en vivo de paradas-cercanas.html).
 */
function filtrarParadas(texto) {
  const norm = (str) =>
    (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const t = norm(texto);
  if (t === "") return QUIBUS_PARADAS;
  return QUIBUS_PARADAS.filter((p) => norm(p.nombre).includes(t));
}
