-- ============================================================
-- QuiBus — Base de datos completa (esquema + datos de prueba)
-- Motor: PostgreSQL 12+   /   Cliente: pgAdmin 4
--
-- CÓMO EJECUTARLO EN pgAdmin 4:
--   1. Crear la base de datos:  clic derecho en "Databases" > Create > Database...
--      Nombre sugerido: quibus
--   2. Seleccionar la base "quibus" y abrir Tools > Query Tool
--   3. Abrir este archivo (icono de carpeta) y ejecutar todo con F5
--
-- ESTRUCTURA DEL ARCHIVO:
--   SECCIÓN 0 — Limpieza previa (para poder re-ejecutar)
--   SECCIÓN 1 — Creación de tablas (DDL)
--   SECCIÓN 2 — Índices
--   SECCIÓN 3 — Datos de prueba (DML / INSERT)
--   SECCIÓN 4 — Consultas de verificación
-- ============================================================


-- ============================================================
-- SECCIÓN 0 — LIMPIEZA PREVIA
-- Permite volver a ejecutar el script desde cero sin errores.
-- El orden es inverso al de creación: primero las tablas que
-- dependen de otras. CASCADE elimina también las restricciones
-- que apunten a ellas.
-- ============================================================

DROP TABLE IF EXISTS favorito    CASCADE;
DROP TABLE IF EXISTS ruta_parada CASCADE;
DROP TABLE IF EXISTS parada      CASCADE;
DROP TABLE IF EXISTS ruta        CASCADE;
DROP TABLE IF EXISTS usuario     CASCADE;


-- ============================================================
-- SECCIÓN 1 — CREACIÓN DE TABLAS (DDL)
--
-- Orden obligatorio: una tabla con FOREIGN KEY solo puede
-- crearse si la tabla a la que apunta ya existe.
--   usuario  -> sin dependencias
--   ruta     -> sin dependencias
--   parada   -> sin dependencias
--   ruta_parada -> depende de ruta y parada
--   favorito    -> depende de usuario y ruta
-- ============================================================

-- ------------------------------------------------------------
-- 1.1  USUARIO
-- Cuentas registradas. Pantallas: registro.html, login.html, perfil.html
-- ------------------------------------------------------------
CREATE TABLE usuario (
    usuario_id      SERIAL PRIMARY KEY,
    nombre          VARCHAR(80)  NOT NULL,
    apellido        VARCHAR(80)  NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    fecha_registro  TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  usuario               IS 'Cuentas registradas en QuiBus';
COMMENT ON COLUMN usuario.email         IS 'Identificador de acceso; UNIQUE evita cuentas duplicadas';
COMMENT ON COLUMN usuario.password_hash IS 'Hash de la contraseña (bcrypt/argon2). Nunca texto plano';


-- ------------------------------------------------------------
-- 1.2  RUTA
-- Rutas de bus. Equivale al arreglo QUIBUS_RUTAS de js/data.js
-- ------------------------------------------------------------
CREATE TABLE ruta (
    ruta_id              SERIAL PRIMARY KEY,
    codigo               VARCHAR(10)  NOT NULL UNIQUE,
    origen               VARCHAR(120) NOT NULL,
    destino              VARCHAR(120) NOT NULL,
    tiempo_estimado_min  INTEGER      NOT NULL CHECK (tiempo_estimado_min > 0)
);

COMMENT ON TABLE  ruta                     IS 'Rutas de bus disponibles en el sistema';
COMMENT ON COLUMN ruta.codigo              IS 'Código corto visible para el usuario: T1, T2, T6...';
COMMENT ON COLUMN ruta.tiempo_estimado_min IS 'Duración estimada del recorrido en minutos';


-- ------------------------------------------------------------
-- 1.3  PARADA
-- Puntos físicos de parada. Las coordenadas alimentan los
-- marcadores del mapa Leaflet + OpenStreetMap.
--
-- NOTA DE DISEÑO: la "distancia en metros" que se ve en
-- paradas-cercanas.html NO se guarda aquí. Esa distancia depende
-- de dónde esté parado el usuario en ese momento, así que es un
-- valor calculado en tiempo real, no un atributo fijo de la parada.
-- ------------------------------------------------------------
CREATE TABLE parada (
    parada_id   SERIAL PRIMARY KEY,
    nombre      VARCHAR(120) NOT NULL,
    latitud     DECIMAL(9,6) NOT NULL,
    longitud    DECIMAL(9,6) NOT NULL
);

COMMENT ON TABLE  parada          IS 'Paradas físicas de bus con su ubicación geográfica';
COMMENT ON COLUMN parada.latitud  IS 'Coordenada para el marcador en Leaflet';
COMMENT ON COLUMN parada.longitud IS 'Coordenada para el marcador en Leaflet';


-- ------------------------------------------------------------
-- 1.4  RUTA_PARADA  (tabla intermedia, relación N:M)
-- Una ruta pasa por varias paradas y una parada es servida por
-- varias rutas. Ese tipo de relación no se puede representar con
-- una sola FK, por eso se necesita esta tabla puente.
--
-- La PRIMARY KEY compuesta (ruta_id, parada_id) hace dos cosas:
--   a) identifica cada fila de forma única
--   b) impide registrar dos veces la misma parada en la misma ruta
-- ------------------------------------------------------------
CREATE TABLE ruta_parada (
    ruta_id     INTEGER NOT NULL REFERENCES ruta(ruta_id)     ON DELETE CASCADE,
    parada_id   INTEGER NOT NULL REFERENCES parada(parada_id) ON DELETE CASCADE,
    orden       INTEGER NOT NULL CHECK (orden > 0),
    PRIMARY KEY (ruta_id, parada_id)
);

COMMENT ON TABLE  ruta_parada       IS 'Relación N:M entre ruta y parada';
COMMENT ON COLUMN ruta_parada.orden IS 'Posición de la parada dentro del recorrido: 1, 2, 3...';


-- ------------------------------------------------------------
-- 1.5  FAVORITO
-- Rutas reales guardadas por un usuario. Pantalla: favoritos.html
--
-- La restricción UNIQUE (usuario_id, ruta_id) es una regla de
-- negocio: un mismo usuario no puede guardar dos veces la misma ruta.
-- ------------------------------------------------------------
CREATE TABLE favorito (
    favorito_id     SERIAL    PRIMARY KEY,
    usuario_id      INTEGER   NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    ruta_id         INTEGER   NOT NULL REFERENCES ruta(ruta_id)       ON DELETE CASCADE,
    fecha_guardado  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, ruta_id)
);

COMMENT ON TABLE favorito IS 'Rutas marcadas como favoritas por cada usuario';


-- ============================================================
-- SECCIÓN 2 — ÍNDICES
--
-- PostgreSQL crea índices automáticamente para PRIMARY KEY y
-- UNIQUE, pero NO para las columnas de clave foránea sueltas.
-- Estos índices aceleran los JOIN que usa la aplicación.
-- ============================================================

CREATE INDEX idx_favorito_usuario   ON favorito(usuario_id);
CREATE INDEX idx_favorito_ruta      ON favorito(ruta_id);
CREATE INDEX idx_ruta_parada_parada ON ruta_parada(parada_id);


-- ============================================================
-- SECCIÓN 3 — DATOS DE PRUEBA (DML)
--
-- Reproducen el dataset del prototipo (js/data.js) para poder
-- probar consultas antes de conectar la aplicación real.
-- ============================================================

-- ------------------------------------------------------------
-- 3.1  Usuarios de prueba
--
-- ATENCIÓN: los password_hash de abajo son valores de relleno,
-- NO son hashes reales ni contraseñas válidas. En la aplicación
-- real el hash lo genera el backend con bcrypt al registrarse.
-- ------------------------------------------------------------
INSERT INTO usuario (nombre, apellido, email, password_hash) VALUES
    ('Juan',  'Serrano',  'login@gmail.com',      '$2b$12$PLACEHOLDER_SOLO_PARA_PRUEBAS_001'),
    ('Mateo', 'Hidalgo',  'mateo@quibus.test',    '$2b$12$PLACEHOLDER_SOLO_PARA_PRUEBAS_002'),
    ('Pablo', 'Jacome',   'pablo@quibus.test',    '$2b$12$PLACEHOLDER_SOLO_PARA_PRUEBAS_003');


-- ------------------------------------------------------------
-- 3.2  Rutas
-- Tomadas de QUIBUS_RUTAS (js/data.js)
-- ------------------------------------------------------------
INSERT INTO ruta (codigo, origen, destino, tiempo_estimado_min) VALUES
    ('T1', 'Parque Carolina',      'Estación Norte',   15),
    ('T2', 'Iglesia de la Merced', 'Centro Histórico', 30),
    ('T4', 'La Magdalena',         'El Recreo',        15),
    ('T6', 'Carcelén',             'El Playón',        45),
    ('T8', 'CCI',                  'Estación Norte',   15),
    ('T9', 'El Playón',            'Labrador',         45);


-- ------------------------------------------------------------
-- 3.3  Paradas
-- Coordenadas tomadas de QUIBUS_COORDS (js/data.js).
-- Son ubicaciones reales de Quito, aproximadas para el prototipo.
-- ------------------------------------------------------------
INSERT INTO parada (nombre, latitud, longitud) VALUES
    ('Parada Parque Carolina',      -0.180700, -78.489000),
    ('Parada Estación Norte',       -0.170000, -78.482000),
    ('Parada Iglesia de la Merced', -0.220100, -78.512500),
    ('Parada Centro Histórico',     -0.220500, -78.512000),
    ('Parada La Magdalena',         -0.235000, -78.522000),
    ('Parada El Recreo',            -0.246000, -78.521000),
    ('Parada Carcelén',             -0.105000, -78.465000),
    ('Parada El Playón',            -0.285000, -78.545000),
    ('Parada CCI',                  -0.177500, -78.483500),
    ('Parada Labrador',             -0.162000, -78.478000);


-- ------------------------------------------------------------
-- 3.4  Ruta_parada — qué paradas sirve cada ruta
--
-- En vez de escribir los id numéricos a mano (que dependen del
-- orden de inserción), se buscan por 'codigo' y 'nombre'. Así el
-- script funciona aunque los SERIAL cambien de valor.
--
-- NOTA PARA LA DEFENSA: el prototipo de js/data.js indicaba que la
-- "Parada CCI" era servida por las rutas T2 y T8. Aquí se corrigió
-- a T1 y T8, porque la T2 va de la Iglesia de la Merced al Centro
-- Histórico (sur de la ciudad) y geográficamente no pasa por el CCI
-- (norte). La T1, que va del Parque Carolina a la Estación Norte,
-- sí pasa por ahí.
-- ------------------------------------------------------------
INSERT INTO ruta_parada (ruta_id, parada_id, orden)
SELECT r.ruta_id, p.parada_id, v.orden
FROM (VALUES
        -- T1: Parque Carolina -> CCI -> Estación Norte
        ('T1', 'Parada Parque Carolina',      1),
        ('T1', 'Parada CCI',                  2),
        ('T1', 'Parada Estación Norte',       3),
        -- T2: Iglesia de la Merced -> Centro Histórico
        ('T2', 'Parada Iglesia de la Merced', 1),
        ('T2', 'Parada Centro Histórico',     2),
        -- T4: La Magdalena -> El Recreo
        ('T4', 'Parada La Magdalena',         1),
        ('T4', 'Parada El Recreo',            2),
        -- T6: Carcelén -> El Playón
        ('T6', 'Parada Carcelén',             1),
        ('T6', 'Parada El Playón',            2),
        -- T8: CCI -> Estación Norte
        ('T8', 'Parada CCI',                  1),
        ('T8', 'Parada Estación Norte',       2),
        -- T9: El Playón -> Labrador
        ('T9', 'Parada El Playón',            1),
        ('T9', 'Parada Labrador',             2)
     ) AS v(codigo_ruta, nombre_parada, orden)
JOIN ruta   r ON r.codigo = v.codigo_ruta
JOIN parada p ON p.nombre = v.nombre_parada;


-- ------------------------------------------------------------
-- 3.5  Favoritos
-- Mismo criterio: se referencia por email y por código de ruta.
-- ------------------------------------------------------------
INSERT INTO favorito (usuario_id, ruta_id)
SELECT u.usuario_id, r.ruta_id
FROM (VALUES
        ('login@gmail.com',   'T1'),
        ('login@gmail.com',   'T8'),
        ('mateo@quibus.test', 'T6'),
        ('pablo@quibus.test', 'T2'),
        ('pablo@quibus.test', 'T9')
     ) AS v(email_usuario, codigo_ruta)
JOIN usuario u ON u.email  = v.email_usuario
JOIN ruta    r ON r.codigo = v.codigo_ruta;


-- ============================================================
-- SECCIÓN 4 — CONSULTAS DE VERIFICACIÓN
--
-- Cada consulta corresponde a una funcionalidad real de la app.
-- Sirven para comprobar que los datos quedaron bien y para
-- explicar, en la defensa, cómo la base de datos alimenta cada
-- pantalla.
-- ============================================================

-- 4.1  Conteo general: confirma que todo se insertó
--      Esperado: 3 usuarios, 6 rutas, 10 paradas, 13 ruta_parada, 5 favoritos
SELECT 'usuario'     AS tabla, COUNT(*) AS filas FROM usuario
UNION ALL SELECT 'ruta',        COUNT(*) FROM ruta
UNION ALL SELECT 'parada',      COUNT(*) FROM parada
UNION ALL SELECT 'ruta_parada', COUNT(*) FROM ruta_parada
UNION ALL SELECT 'favorito',    COUNT(*) FROM favorito;


-- 4.2  BUSCAR VIAJE (index.html)
--      Equivale a la función buscarRutas() de js/data.js.
--      ILIKE = comparación sin distinguir mayúsculas/minúsculas.
SELECT codigo, origen, destino, tiempo_estimado_min
FROM ruta
WHERE origen ILIKE '%Carolina%'
ORDER BY tiempo_estimado_min;


-- 4.3  PARADAS CERCANAS (paradas-cercanas.html)
--      Cada parada con las rutas que la sirven, igual que el texto
--      "600 m · Rutas T2, T8" de la interfaz.
--      STRING_AGG concatena varias filas en un solo texto.
SELECT p.nombre                                AS parada,
       p.latitud,
       p.longitud,
       STRING_AGG(r.codigo, ', ' ORDER BY r.codigo) AS rutas
FROM parada p
JOIN ruta_parada rp ON rp.parada_id = p.parada_id
JOIN ruta        r  ON r.ruta_id    = rp.ruta_id
GROUP BY p.parada_id, p.nombre, p.latitud, p.longitud
ORDER BY p.nombre;


-- 4.4  SELECCIONAR UNA PARADA -> ver sus rutas
--      Es el flujo que ocurre al hacer clic en una parada y que
--      lleva a resultados.html?rutas=...
SELECT r.codigo, r.origen, r.destino, r.tiempo_estimado_min
FROM ruta r
JOIN ruta_parada rp ON rp.ruta_id   = r.ruta_id
JOIN parada      p  ON p.parada_id  = rp.parada_id
WHERE p.nombre = 'Parada CCI'
ORDER BY r.codigo;


-- 4.5  FAVORITOS DE UN USUARIO (favoritos.html)
SELECT u.nombre || ' ' || u.apellido AS usuario,
       r.codigo,
       r.origen,
       r.destino,
       f.fecha_guardado
FROM favorito f
JOIN usuario u ON u.usuario_id = f.usuario_id
JOIN ruta    r ON r.ruta_id    = f.ruta_id
WHERE u.email = 'login@gmail.com'
ORDER BY f.fecha_guardado;


-- 4.6  RECORRIDO COMPLETO DE UNA RUTA, en orden
--      Demuestra para qué sirve la columna 'orden' de ruta_parada.
SELECT r.codigo, rp.orden, p.nombre AS parada
FROM ruta_parada rp
JOIN ruta   r ON r.ruta_id   = rp.ruta_id
JOIN parada p ON p.parada_id = rp.parada_id
WHERE r.codigo = 'T1'
ORDER BY rp.orden;
