# PREGUNTAS ABIERTAS Y DECISIONES CRÍTICAS

**Documento:** Documento de alineación pre-desarrollo  
**Objetivo:** Resolver ambigüedades clave antes de escribir la primera línea de código  
**Responsable:** [Nombre del PM/Tech Lead]  
**Deadline para resolver:** Antes de Sprint 1

---

## Decisiones Arquitectónicas

### 1. ¿Pueden los agentes comunicarse entre sí?
**Pregunta:** Si el usuario dice "@agente-a, pide que agente-b haga X", ¿pueden hablar?

**Opciones:**
- **No (MVP):** Solo humanos → agentes. Los agentes no se llaman. Más simple, más control.
- **Sí (Fase 2+):** Agentes pueden llamar a otros agentes. Flujos complejos, pero requiere límites para evitar loops infinitos.

**Recomendación:** NO en MVP. Agrega timeout/retry infinito como riesgo. Revisa en Fase 2 con beta testers.

**Status:** ⏳ **ABIERTO**

---

### 2. ¿El historial se comparte entre chats o es aislado por chat?
**Pregunta:** Si creo dos chats ("Proyecto A" y "Proyecto B"), ¿el mismo agente ve el historial de ambos?

**Opciones:**
- **Aislado (Recomendado):** Cada chat tiene su propio historial + memoria de agente. Seguridad + claridad.
- **Compartido:** Un agente tiene una memoria global de todos los chats. Risk: contaminación de contexto.

**Recomendación:** AISLADO. Más seguro. Los agentes no ven lo que pasó en otros equipos.

**Status:** ✅ **RECOMENDADO: AISLADO**

---

### 3. ¿Cuál es la máxima complejidad de una tarea?
**Pregunta:** ¿Hay límites en timeout, tokens, retries para evitar costos/latencia desbocada?

**Opciones:**
- Timeout: 30s / 60s / 120s (máximo)
- Tokens por mensaje: 5k / 10k / 20k
- Retries automáticos: 1 / 3 / 5 intentos
- Cost cap: ¿Advertencia cuando alcanza X?

**Recomendación:**
```
Timeout: 60s (ajustable por plan)
Max tokens/msg: 10k
Max retries: 3
Cost alert: Si alcanza 80% del límite mensual del plan
```

**Status:** ⏳ **ABIERTO - Validar costos reales**

---

### 4. ¿Soporte para webhooks y triggers externos?
**Pregunta:** ¿Un sistema externo puede triggerear un agente? (ej: Zapier → agente crea doc)

**Opciones:**
- **No (MVP):** Solo @mención dentro del chat. Más simple.
- **Sí (Fase 2+):** Webhooks. Cada agente tiene URL única. Otro sistema POST → ejecuta agente.

**Recomendación:** NO en MVP. Agrega overhead de seguridad + validación. Fase 2 si demanda existe.

**Status:** ⏳ **ABIERTO**

---

### 5. ¿Los agentes pueden cotejar en tiempo real con usuarios durante ejecución?
**Pregunta:** ¿Un agente puede pausar y pedir confirmación? (ej: "¿Edito este archivo?" Sí/No)

**Opciones:**
- **No:** Ejecución automática. Usuarios revisan resultado después.
- **Sí:** Agente pausa → muestra botones "Proceder/Cancelar". Requiere WebSocket bidireccional.

**Recomendación:** NO en MVP. "Supervisa en tiempo real" != "aprueba cada paso". MVP muestra logs, Fase 2 agrega cotejación.

**Status:** ⏳ **ABIERTO - Validar casos de uso**

---

### 6. ¿Versioning de agentes?
**Pregunta:** ¿Los agentes tienen versiones? ¿Puedo hacer rollback a una versión anterior?

**Opciones:**
- **No:** Un agente = un estado. Si edito, el cambio es inmediato.
- **Sí:** Cada cambio crea una versión. Puedo rollback. Auditoría completa.

**Recomendación:** NO en MVP. Agrega complejidad BD. Fase 2 si hay demanda.

**Status:** ⏳ **ABIERTO**

---

## Integraciones y Proveedores

### 7. ¿El usuario trae su propia API key o la plataforma paga?
**Pregunta:** ¿Quién paga los tokens al LLM?

**Opciones:**
- **Usuario trae key:** Los costos los paga directamente el usuario. Plataforma cobra por features de software.
- **Plataforma paga:** Incluido en subscription. Plataforma absorbe costos, cobra markup.

**Recomendación (Fase 1):** **USUARIO TRAE KEY**. Elimina costos variables impredecibles. Más simple.

**Recomendación (Fase 3+):** Ofrecer ambos modelos: "Bring your own key" free vs "Platform paid" en planes Pro/Enterprise.

**Status:** ✅ **DECIDIDO: USUARIO TRAE KEY en MVP**

---

### 8. ¿Qué pasa si la API key es inválida o vencida?
**Pregunta:** Error handling cuando agent intenta usar key expirada.

**Flujo esperado:**
1. Agente intenta llamar a LLM
2. Respuesta 401 (Unauthorized)
3. Sistema notifica al admin del chat
4. Admin actualiza key
5. Usuario reintentar tarea

**Status:** ✅ **INCLUIR en error handling**

---

### 9. ¿Qué integraciones de cloud storage van en MVP?
**Pregunta:** ¿Google Drive, OneDrive, o solo S3?

**Opciones:**
- **Google Drive solo:** 80% de equipos lo usan. Foco en calidad.
- **Google Drive + OneDrive:** Más cobertura, pero doble trabajo testing.

**Recomendación:** **SOLO GOOGLE DRIVE en MVP**. OneDrive en Fase 2.

**Status:** ✅ **DECIDIDO: GOOGLE DRIVE solo en MVP**

---

## Seguridad y Compliance

### 10. ¿Encriptación de datos en reposo y en tránsito?
**Pregunta:** ¿Cómo se almacenan las API keys? ¿El chat es E2E?

**Recomendación:**
- **API keys:** AES-256 en BD (encrypted_api_key field)
- **Mensajes de chat:** No E2E en MVP. TLS en tránsito. Chat puede ser leído por admins (SaaS estándar).
- **Backups:** Encriptados también.

**Status:** ✅ **INCLUIR desde MVP**

---

### 11. ¿GDPR / Privacidad?
**Pregunta:** ¿Necesito compliance GDPR, SOC 2, etc?

**Recomendación:**
- **MVP:** Privacidad basic (user can delete account → purge data). GDPR data deletion request en API.
- **Fase 2+:** SOC 2 Type II (si vamos Enterprise).

**Status:** ⏳ **ABIERTO - Validar mercado objetivo**

---

## Monetización

### 12. ¿Cómo se define "token consumption" en la factura?
**Pregunta:** Si usuario agrega agentes con diferentes LLMs, ¿cómo facturo?

**Opciones:**
- **Por LLM:** Stripe event por cada API call. Precios diferentes por OpenAI vs Anthropic.
- **Token pool:** Usuario compra pool de 1M tokens/mes, consume de todos los LLMs.
- **Simple:** Planes fijos, tokens ilimitados (Starter 10k/mes, Pro 100k/mes).

**Recomendación (MVP):** **PLANES FIJOS**. Usuario trae key, no facturamos tokens.

**Status:** ✅ **DECIDIDO: PLANES FIJOS, TOKEN-AGNOSTIC**

---

### 13. ¿Free tier o solo planes de pago?
**Pregunta:** ¿Hay un tier gratuito?

**Opciones:**
- **Freemium:** 1 chat gratis, 5 agentes, 2 miembros. Upgrade a Pro por $79/mes.
- **Paid only:** Prueba gratis 14 días. Luego paga o se cierra.

**Recomendación:** **PRUEBA GRATUITA 14 DÍAS**. Más simple que freemium, menos overhead operacional.

**Status:** ⏳ **ABIERTO - Validar con early users**

---

## Testing y QA

### 14. ¿Qué herramientas de testing?
**Pregunta:** Jest/Vitest, Cypress, etc?

**Recomendación:**
- **Unit:** Jest (backend) + Vitest (frontend)
- **Integration:** Supertest (API), React Testing Library (components)
- **E2E:** Cypress (chat flow, agent execution)
- **Target:** 80% coverage en MVP

**Status:** ✅ **INCLUIR setup desde Sprint 1**

---

### 15. ¿Monitoreo y alertas?
**Pregunta:** ¿Qué monitoreamos en producción?

**Recomendación:**
- **Sentry:** Errors + crashlogs
- **Datadog:** Latency, throughput, LLM API response times
- **Uptime:** StatusPage pública
- **Alertas:** PagerDuty si error rate > 5% en 5 min

**Status:** ✅ **SETUP en Sprint 1, antes de Fase 1 launch**

---

## Operacional

### 16. ¿Escalabilidad inicial: cuántos usuarios?
**Pregunta:** ¿Optimizar para 100 o 10k?

**Recomendación:**
- **MVP target:** 100 usuarios concurrentes (10 chats × 10 miembros).
- **Arquitectura:** Diseñar para escalar. Si llega a 1k usuarios, refactor ligera (sharding, replicas).
- **Load test:** Simular 500 usuarios en Fase 2.

**Status:** ⏳ **ABIERTO - Validar TAM**

---

### 17. ¿Backup y disaster recovery?
**Pregunta:** ¿Frecuencia de backups? ¿Recovery time objective (RTO)?

**Recomendación:**
- **Backups:** Diarios (incremental), semanales (full).
- **RTO:** Max 4 horas de downtime.
- **RPO:** Max 24 horas de data loss.
- **Proveedor:** AWS RDS automated backups + manual exports.

**Status:** ✅ **INCLUIR antes de Fase 1 launch**

---

### 18. ¿SLA y compensación?
**Pregunta:** ¿Qué nivel de servicio prometo?

**Recomendación:**
- **MVP:** 99% uptime (sin SLA).
- **Fase 2+:** 99.5% uptime garantizado (SLA en Starter). Créditos si fallo.

**Status:** ⏳ **ABIERTO**

---

## Roadmap

### 19. ¿Mobile app en MVP o Fase 2?
**Pregunta:** ¿React Native / Flutter desde el principio?

**Recomendación:** **FASE 2**. MVP es Web only. Valida uso patterns primero.

**Status:** ✅ **DECIDIDO: FASE 2**

---

### 20. ¿Marketplace de agentes pre-built?
**Pregunta:** ¿Cuándo ofrecemos agentes listos (ej: "Document Reviewer Bot")?

**Recomendación:** **FASE 4**. Requiere template system, rating system, etc.

**Status:** ✅ **DECIDIDO: FASE 4**

---

## RESUMEN: DECISIONES CRÍTICAS A TOMAR ANTES DE SPRINT 1

| # | Pregunta | Recomendación | Status |
|----|----------|---------------|--------|
| 7 | API key: usuario vs plataforma | Usuario trae key | ✅ |
| 9 | Cloud storage MVP | Solo Google Drive | ✅ |
| 10 | Encriptación | AES-256 keys, TLS | ✅ |
| 12 | Facturación | Planes fijos | ✅ |
| 14 | Testing stack | Jest + Cypress | ✅ |
| 15 | Monitoreo | Sentry + Datadog | ✅ |
| 17 | Backup/DR | Daily backups, 4h RTO | ✅ |
| 19 | Mobile | Fase 2, no MVP | ✅ |
| 2 | Historial: aislado vs compartido | Aislado por chat | ✅ |
| 3 | Límites timeout/tokens | 60s, 10k tokens, 3 retries | ⏳ |
| 13 | Free tier | Prueba 14 días | ⏳ |
| 11 | GDPR / Compliance | Basic MVP, SOC2 Fase 2+ | ⏳ |

**⏳ = Validar con stakeholders antes de Sprint 1**  
**✅ = Listo para proceder**

---

## SIGUIENTE PASO

Agendar **Planning Meeting (2h)** con:
- Product Manager
- Tech Lead
- Arquitecto (si existe)
- Finance/Operations (para preguntas 12, 13)

**Agenda:**
1. Revisar REQUISITOS_AGENTES_CHAT.md (30 min)
2. Discutir decisiones críticas (60 min)
3. Confirmar roadmap + sprints (30 min)
4. Crear Epics en Jira (para comenzar Sprint 1)

**Outcome:** Todas las preguntas ⏳ pasan a ✅
