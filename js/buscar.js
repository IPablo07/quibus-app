/**
 * buscar.js
 * Al enviar el formulario de "Buscar Viaje" en index.html, en vez de recargar
 * la página (action="#"), redirige a resultados.html pasando origen y destino
 * como parámetros en la URL.
 */

document.addEventListener("DOMContentLoaded", () => {
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
