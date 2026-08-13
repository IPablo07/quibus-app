# quibus-app
Aplicación QuiBus - actividad grupal HTML semántico

# QuiBus

## Descripción
QuiBus es una aplicación web que permite a los usuarios buscar rutas de bus ingresando un origen y un destino, visualizar un mapa con las rutas disponibles y consultar los resultados de búsqueda con tiempos estimados de llegada.

## Prototipo
Enlace al proyecto de Figma: [https://www.figma.com/design/ASTusrmuMWKqSbYTHO8beM/El-equipo-de-mnhidalgop-team-library?node-id=3446-2&t=7urpNUIHE2c33fRT-1]

## Pantallas implementadas

| Pantalla | Responsable | Componentes principales |
|---|---|---|
| Buscar Viaje (`index.html`) | Grupal | Formulario de búsqueda (origen/destino), mapa embebido de Google Maps, tarjetas de resultados |
| Resultados (`pages/resultados.html`) | Pablo Jacome | Tarjetas de rutas (`article`) con tiempo estimado y parada, mapa embebido |
| Login (`pages/login.html`) | Pablo Jacome | Formulario de acceso, mensaje de error de validación, iconos de redes sociales |
| Registro (`pages/registro.html`) | Pablo Jacome | Formulario en dos columnas (Nombre/Apellido, Email/Password), mensaje de error de validación |
| Favoritos (`pages/favoritos.html`) | Pablo| Lista de rutas guardadas, botón "Añadir ruta" (estilo fantasma), mapa embebido |
| Paradas Cercanas (`pages/paradas-cercanas.html`) | Mateo Hidalgo | Filtro de búsqueda de paradas, lista de paradas con distancia y ruta, mapa embebido |
| Perfil (`pages/perfil.html`) | Mateo Hidalgo | Tarjeta de perfil con avatar, menú de opciones, modal de confirmación de cierre de sesión |

Cada pantalla individual se implementó en una rama personal, conectada a la hoja de estilos general `css/styles.css`, reutilizando las variables, botones, campos y tarjetas ya definidos por el equipo, e incorporando un componente adicional propio.

## Integrantes
- Pablo Jacome
- Mateo Hidalgo

## Tecnologías
- HTML5
- CSS3
- Google Maps Embed
- Git / GitHub



## Pantalla individual: Resultados (Pablo Jacome)

### Justificación de etiquetas semánticas

| Zona | Etiqueta | Justificación |
|---|---|---|
| Logo + título + nav | header | Cabecera con identificación de la pantalla actual |
| Enlaces de navegación | nav | Agrupa los enlaces principales del sitio |
| Contenido central | main | Contenido principal de la pantalla |
| Lista de resultados | section | Bloque que agrupa contenido de resultados de búsqueda |
| Cada tarjeta de ruta | article | Contenido independiente y autocontenido |
| Mapa de rutas | section | Bloque Mapa de igual jerarquía que los resultados |
| Franja inferior | footer | Pie de página |