# 🚀 Sprint 1: Agente Backend

## Objetivo General
Construir la base del backend con autenticación, estructura modular y servicios de chat/agentes básicos.

---

## 📋 Tareas Prioritarias

### 1️⃣ **Inicializar proyecto Node.js + Stack base** [2-3 días]

**Entregable:**
- ✅ `backend/` con estructura modular lista
- ✅ `package.json` con dependencias: Express/Fastify, TypeScript, Prisma, Redis, Socket.io, Bull/BullMQ
- ✅ `docker-compose.yml` funcional (PostgreSQL 15+, Redis)
- ✅ Configuración de variables de entorno (`.env.example`)

**Checklist:**
```bash
npm init -y
npm install express cors dotenv helmet
npm install -D typescript ts-node @types/node tsconfig-paths
npm install @prisma/client
npm install redis socket.io bull bullmq
npm install winston # logging centralizado
```

**Estructura esperada:**
```
backend/src/
├── config/
│   ├── database.ts       # Prisma client + connection
│   ├── redis.ts          # Redis client
│   ├── environment.ts    # validación de ENV vars
│   └── constants.ts
├── middleware/
│   ├── auth.ts           # JWT verification
│   ├── errorHandler.ts   # global error handler
│   ├── rateLimiter.ts    # 100 req/min per user
│   └── logger.ts         # Winston logger
├── modules/
│   ├── auth/             # (vacío, fase 2)
│   ├── users/            # (vacío, fase 2)
│   ├── chats/            # (vacío, fase 2)
│   └── agents/           # (vacío, fase 2)
├── utils/
│   ├── validators.ts     # sanitización XSS, input validation
│   └── encryption.ts     # AES-256 para keys
├── app.ts               # Express setup, rutas, middleware
└── server.ts            # entry point
```

**NO hacer en esta tarea:**
- ❌ Implementar lógica de autenticación
- ❌ Endpoints de usuario/chat/agentes
- ❌ WebSocket handlers

---

### 2️⃣ **Esquema de Base de Datos (Prisma)** [1-2 días]

**Entregable:**
- ✅ `prisma/schema.prisma` con modelos base
- ✅ Migrations creadas y aplicadas localmente
- ✅ Documentación de relaciones en comentarios

**Modelos mínimos:**
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  chats           Chat[]
  agents          Agent[]
}

model Chat {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  title           String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  messages        Message[]
  agentLinks      ChatAgentLink[]
}

model Agent {
  id              String    @id @default(cuid())
  creatorId       String
  creator         User      @relation(fields: [creatorId], references: [id])
  name            String
  description     String?
  systemPrompt    String    # instrucciones del agente
  llmConfig       Json?     # modelo, parámetros
  integrations    Json?     # Google Drive config, etc.
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  chatLinks       ChatAgentLink[]
}

model ChatAgentLink {
  id              String    @id @default(cuid())
  chatId          String
  chat            Chat      @relation(fields: [chatId], references: [id])
  agentId         String
  agent           Agent     @relation(fields: [agentId], references: [id])
  joinedAt        DateTime  @default(now())
  @@unique([chatId, agentId])
}

model Message {
  id              String    @id @default(cuid())
  chatId          String
  chat            Chat      @relation(fields: [chatId], references: [id])
  author          String    # "user" o nombre del agente
  content         String
  metadata        Json?     # mentions, attachments
  createdAt       DateTime  @default(now())
}
```

**Checklist:**
- ✅ Relaciones 1:N y M:N correctas
- ✅ Timestamps (createdAt, updatedAt) en todos
- ✅ Índices en `email`, `chatId`, `agentId`
- ✅ `npx prisma migrate dev --name init`
- ✅ Seed script con datos de prueba (2-3 usuarios, 1-2 chats)

**NO hacer:**
- ❌ Modelos de billing/suscripción
- ❌ Historial de versiones de agentes

---

### 3️⃣ **Middleware de Autenticación (JWT + básico)** [2 días]

**Entregable:**
- ✅ Middleware JWT en `middleware/auth.ts`
- ✅ Validación de tokens en rutas protegidas
- ✅ Rate limiter funcional (Redis-backed)
- ✅ Global error handler con logging

**Funcionalidad:**
- Verificar JWT en headers (`Authorization: Bearer <token>`)
- Extraer `userId` y adjuntar a `req.user`
- Rate limiter: 100 req/min por `userId` (usar Redis `INCR`)
- Logger centralizado con Winston (nivel: info, error, debug)
- Respuestas de error estandarizadas (400, 401, 429, 500)

**Ejemplo:**
```typescript
// middleware/auth.ts
export const verifyJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, email, ... }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
```

**NO hacer:**
- ❌ Endpoint `/auth/login` o `/auth/register`
- ❌ Refresh tokens
- ❌ OAuth / Auth0 integration

---

### 4️⃣ **Socket.io Base + Eventos de Chat** [2 días]

**Entregable:**
- ✅ Socket.io server integrado con Express
- ✅ Manejo de conexión/desconexión autenticada
- ✅ Eventos básicos: `join:chat`, `send:message`, `leave:chat`
- ✅ Broadcast de mensajes a todos en sala

**Eventos implementados:**
```typescript
// Evento: usuario se une a chat
socket.on("join:chat", { chatId } => {
  socket.join(`chat:${chatId}`);
  // Logear en Redis o BD
  io.to(`chat:${chatId}`).emit("user:joined", { userId, timestamp });
});

// Evento: nuevo mensaje
socket.on("send:message", { chatId, content } => {
  const message = await Message.create({ chatId, author: userId, content });
  io.to(`chat:${chatId}`).emit("message:new", message);
});

// Evento: usuario sale
socket.on("leave:chat", { chatId } => {
  socket.leave(`chat:${chatId}`);
  io.to(`chat:${chatId}`).emit("user:left", { userId });
});
```

**Checklist:**
- ✅ Autenticación de socket por JWT (`io.use(auth middleware)`)
- ✅ Salas de chat (`socket.join`, `socket.leave`)
- ✅ Persistencia de mensajes en BD
- ✅ Latencia <100ms en broadcast (test local)
- ✅ Manejo de reconexión

**NO hacer:**
- ❌ Ejecución de agentes
- ❌ Mentions (`@agente`) parsing
- ❌ Historial de mensajes endpoint

---

### 5️⃣ **Testing Base (Jest + Supertest)** [1-2 días]

**Entregable:**
- ✅ Suite de tests para middleware (auth, rate limiter)
- ✅ Tests unitarios para utilidades (validators, encryption)
- ✅ Tests de integración básicos (POST /health, Socket events)
- ✅ CI/CD setup (GitHub Actions) para correr tests

**Estructura:**
```
backend/
├── tests/
│   ├── unit/
│   │   ├── middleware.auth.test.ts
│   │   ├── utils.validators.test.ts
│   │   └── utils.encryption.test.ts
│   ├── integration/
│   │   └── socket.events.test.ts
│   └── setup.ts
└── jest.config.js
```

**Coverage mínimo:**
- Middleware auth: 100%
- Validators: 100%
- Socket handlers: 80%

**Checklist:**
- ✅ `npm run test` ejecuta suite
- ✅ GitHub Actions workflow: `.github/workflows/ci.yml`
- ✅ Coverage report en README

---

## 📌 Dependencias y Orden

1. **Tarea 1** → Tarea 2 (necesita `package.json`)
2. **Tarea 2** → Tarea 3 (schema en BD)
3. **Tarea 3** + **Tarea 4** (paralelo, ambas necesitan estructura base)
4. **Tarea 5** (tests de tareas 1-4)

---

## 🔍 Criterios de Aceptación

- [ ] Backend levanta con `npm run dev` sin errores
- [ ] Docker-compose corre Postgres + Redis sin problemas
- [ ] Migrations aplicadas localmente y en CI
- [ ] Todos los tests pasan (`npm run test`)
- [ ] Rate limiter rechaza >100 req/min
- [ ] Socket.io messages llegan <100ms en local
- [ ] Variables de entorno validadas al startup
- [ ] Logging funciona en todos los módulos
- [ ] README actualizado con instrucciones de setup

---

## 📚 Referencias

- Prisma Schema: https://www.prisma.io/docs/orm/prisma-schema
- Socket.io Rooms: https://socket.io/docs/v4/rooms/
- Express Middleware: https://expressjs.com/en/guide/using-middleware.html
- JWT Best Practices: https://tools.ietf.org/html/rfc8949

---

## ⚠️ Notas Importantes

- **No implementar autenticación real (login/register)** en este sprint — solo middleware que valida JWT
- **No conectar LLMs** aún
- **No hacer búsqueda de historial** (ElasticSearch es fase 2)
- **Usar `console.error` solo para errores críticos** — todo va a logger
- **AES-256**: solo estructura, no implementar encriptación de keys en esta tarea
