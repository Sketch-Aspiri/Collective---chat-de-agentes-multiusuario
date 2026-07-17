-- =========================================================================
-- Inicialización de PostgreSQL para agentes-chat
-- Este script se ejecuta UNA sola vez, cuando el volumen de datos está vacío
-- (Docker lo monta en /docker-entrypoint-initdb.d/).
--
-- Las tablas las gestiona Prisma vía `prisma migrate deploy` (lo corre el
-- servicio backend al arrancar). Aquí solo dejamos extensiones y ajustes
-- que deben existir ANTES de aplicar las migraciones.
-- =========================================================================

-- Generación de UUIDs (gen_random_uuid) y utilidades criptográficas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Búsqueda por similitud de texto (fulltext / trigram) — fase 2
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
