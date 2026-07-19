# ⚙️ Sprint 2: Agente DevOps

**Duración:** Jul 18–31 | **Objetivo del sprint:** Chat en tiempo real | **Entregable:** Usuarios pueden chatear

## Objetivo General
Asegurar que la infraestructura de Sprint 1 soporte carga de WebSockets en tiempo real, ampliar CI/CD con tests de integración de Socket.io, y preparar observabilidad para el módulo de chat.

## Contexto (ya resuelto en Sprint 1)
- Docker Compose con Postgres + Redis operativo
- GitHub Actions corriendo tests en cada PR
- Logging centralizado (Winston) y healthchecks básicos
- `.env.example` y manejo de secrets ya establecido

## 📌 Tareas principales

### Tarea 1 — Escalabilidad de Socket.io
- [ ] Configurar el adapter de Redis para Socket.io (`socket.io-redis` o `@socket.io/redis-adapter`) para soportar múltiples instancias del backend
- [ ] Verificar que Redis ya levantado en Sprint 1 sirve para pub/sub de sockets, sin conflicto con su uso en sesiones/rate limiting
- [ ] Documentar la configuración en `/docs/ARCHITECTURE.md`

### Tarea 2 — CI/CD para el módulo de chats
- [ ] Ampliar GitHub Actions para correr tests de integración de Socket.io (levantar Postgres+Redis como servicios del workflow)
- [ ] Asegurar que el pipeline falla si la cobertura del módulo `chats` baja de 80%
- [ ] Cachear dependencias de npm para acelerar el pipeline

### Tarea 3 — Observabilidad
- [ ] Métricas básicas de conexiones WebSocket activas (conteo de sockets conectados/room)
- [ ] Logs estructurados para eventos clave de chat (conexión, desconexión, error de socket) — sin loguear contenido de mensajes ni tokens
- [ ] Endpoint `/health` extendido para reportar estado de Redis pub/sub

### Tarea 4 — Pruebas de carga
- [ ] Script de load testing (ej. Artillery o k6) simulando múltiples usuarios conectados a un mismo chat
- [ ] Validar el requisito no funcional: WebSocket <100ms de latencia bajo carga moderada
- [ ] Documentar resultados y cuellos de botella encontrados

### Tarea 5 — Entorno de staging
- [ ] Preparar despliegue de staging (según decisión pendiente AWS vs Vercel — confirmar con el equipo antes de avanzar)
- [ ] Variables de entorno específicas de staging, separadas de local/prod
- [ ] Rollback simple documentado en caso de fallo de deploy

## 🚫 No toca en este sprint
- ElasticSearch (fase 2, no antes)
- Infraestructura para ejecución de agentes/LLMs (Sprint 3+)
- Webhooks externos
- Producción final (AWS/Vercel definitivo se confirma después de validar staging)

## 📌 Dependencias y Orden
1. **Tarea 1** → habilita que el chat funcione con más de una instancia (bloqueante para Tarea 4)
2. **Tarea 2** → puede ir en paralelo, pero necesita que Backend tenga tests de socket listos (Tarea 6 del agente Backend)
3. **Tarea 3** → en paralelo, transversal
4. **Tarea 4** → depende de Tarea 1
5. **Tarea 5** → al final del sprint, una vez el chat esté estable

## 🔍 Criterios de Aceptación
- [ ] Dos instancias del backend detrás de un balanceador pueden compartir eventos de socket entre sí (vía Redis adapter)
- [ ] El pipeline de CI corre y falla correctamente ante tests de socket rotos o cobertura insuficiente
- [ ] `/health` reporta el estado de Postgres, Redis y pub/sub
- [ ] Prueba de carga documentada con métricas de latencia bajo concurrencia
- [ ] No hay API keys, tokens ni contenido de mensajes en logs
- [ ] Staging desplegado y accesible (si la decisión de proveedor ya fue tomada)

## 📚 Referencias
- Socket.io Redis adapter: https://socket.io/docs/v4/redis-adapter/
- GitHub Actions services (Postgres/Redis en CI): https://docs.github.com/actions/using-containerized-services/creating-postgresql-service-containers
- k6 load testing: https://k6.io/docs/
- Artillery: https://www.artillery.io/docs

## ⚠️ Notas Importantes
- Confirmar con el equipo la decisión de AWS vs Vercel antes de invertir tiempo en configuración de staging específica de un proveedor
- El adapter de Redis para Socket.io es requisito técnico para que el chat en tiempo real escale — no opcional aunque el MVP corra en una sola instancia
- Cualquier cambio a la configuración de Redis debe validarse contra su uso existente en sesiones y rate limiting (no romper Sprint 1)
