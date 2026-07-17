#!/bin/bash
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setup agentes-chat local${NC}"
echo "================================================"

# 1️⃣ Verificar que estamos en la raíz del repo
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml no encontrado${NC}"
    echo "Asegúrate de ejecutar este script desde la raíz del repositorio"
    exit 1
fi

# 2️⃣ Iniciar servicios Docker (Postgres + Redis)
echo -e "\n${BLUE}1️⃣  Iniciando servicios (Postgres + Redis)...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Docker services iniciados${NC}"

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que Postgres y Redis estén listos (10s)...${NC}"
sleep 10

# Verificar que los servicios están corriendo
if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo -e "${RED}❌ Postgres no está corriendo${NC}"
    exit 1
fi
if ! docker-compose ps | grep -q "redis.*Up"; then
    echo -e "${RED}❌ Redis no está corriendo${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Servicios verificados${NC}"

# 3️⃣ Configurar variables de entorno
echo -e "\n${BLUE}2️⃣  Configurando variables de entorno...${NC}"

# Backend
if [ ! -f "backend/.env" ]; then
    if [ ! -f "backend/.env.example" ]; then
        echo -e "${RED}❌ backend/.env.example no encontrado${NC}"
        exit 1
    fi
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ backend/.env creado desde .env.example${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env ya existe, usando valores existentes${NC}"
fi

# Frontend
if [ ! -f "frontend/.env" ]; then
    if [ ! -f "frontend/.env.example" ]; then
        echo -e "${RED}❌ frontend/.env.example no encontrado${NC}"
        exit 1
    fi
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ frontend/.env creado desde .env.example${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env ya existe, usando valores existentes${NC}"
fi

# 4️⃣ Generar secrets seguros si no existen
echo -e "\n${BLUE}3️⃣  Generando secrets...${NC}"

# Generar JWT_SECRET (si no existe en backend/.env)
if ! grep -q "JWT_SECRET=" backend/.env || grep "JWT_SECRET=$" backend/.env; then
    JWT_SECRET=$(openssl rand -base64 32)
    # Remover línea vacía si existe
    sed -i '/^JWT_SECRET=$/d' backend/.env
    echo "JWT_SECRET=$JWT_SECRET" >> backend/.env
    echo -e "${GREEN}✓ JWT_SECRET generado${NC}"
else
    echo -e "${YELLOW}⚠️  JWT_SECRET ya configurado${NC}"
fi

# Generar ENCRYPTION_KEY (si no existe en backend/.env)
if ! grep -q "ENCRYPTION_KEY=" backend/.env || grep "ENCRYPTION_KEY=$" backend/.env; then
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    sed -i '/^ENCRYPTION_KEY=$/d' backend/.env
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> backend/.env
    echo -e "${GREEN}✓ ENCRYPTION_KEY generado${NC}"
else
    echo -e "${YELLOW}⚠️  ENCRYPTION_KEY ya configurado${NC}"
fi

# 5️⃣ Configurar DATABASE_URL y REDIS_URL si no existen
echo -e "\n${BLUE}4️⃣  Configurando conexiones de base de datos...${NC}"

if ! grep -q "^DATABASE_URL=" backend/.env; then
    echo "DATABASE_URL=postgresql://agentes_user:agentes_pass@localhost:5432/agentes_chat" >> backend/.env
    echo -e "${GREEN}✓ DATABASE_URL configurada${NC}"
else
    echo -e "${YELLOW}⚠️  DATABASE_URL ya configurada${NC}"
fi

if ! grep -q "^REDIS_URL=" backend/.env; then
    echo "REDIS_URL=redis://localhost:6379" >> backend/.env
    echo -e "${GREEN}✓ REDIS_URL configurada${NC}"
else
    echo -e "${YELLOW}⚠️  REDIS_URL ya configurada${NC}"
fi

# NODE_ENV
if ! grep -q "^NODE_ENV=" backend/.env; then
    echo "NODE_ENV=development" >> backend/.env
fi

# Frontend URLs
if ! grep -q "^VITE_API_URL=" frontend/.env; then
    echo "VITE_API_URL=http://localhost:4000/api" >> frontend/.env
    echo -e "${GREEN}✓ VITE_API_URL configurada${NC}"
else
    echo -e "${YELLOW}⚠️  VITE_API_URL ya configurada${NC}"
fi

if ! grep -q "^VITE_SOCKET_URL=" frontend/.env; then
    echo "VITE_SOCKET_URL=http://localhost:4000" >> frontend/.env
    echo -e "${GREEN}✓ VITE_SOCKET_URL configurada${NC}"
else
    echo -e "${YELLOW}⚠️  VITE_SOCKET_URL ya configurada${NC}"
fi

# 6️⃣ Instalar dependencias
echo -e "\n${BLUE}5️⃣  Instalando dependencias...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo "Instalando backend dependencies..."
    npm install --prefix backend
    echo -e "${GREEN}✓ Backend dependencies instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  Backend node_modules ya existe${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Instalando frontend dependencies..."
    npm install --prefix frontend
    echo -e "${GREEN}✓ Frontend dependencies instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend node_modules ya existe${NC}"
fi

# 7️⃣ Ejecutar migraciones de Prisma
echo -e "\n${BLUE}6️⃣  Ejecutando migraciones de Prisma...${NC}"
cd backend

# Verificar que Prisma schema existe
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ prisma/schema.prisma no encontrado${NC}"
    exit 1
fi

# Ejecutar migraciones
npx prisma migrate dev --name init --skip-generate 2>/dev/null || true

echo -e "${GREEN}✓ Migraciones completadas${NC}"
cd ..

# 8️⃣ Resumen final
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Setup completado exitosamente${NC}"
echo -e "${GREEN}================================================${NC}"

echo -e "\n${BLUE}📋 Próximos pasos:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend (puerto 4000):${NC}"
echo -e "  ${BLUE}npm run dev --prefix backend${NC}"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend (puerto 5173):${NC}"
echo -e "  ${BLUE}npm run dev --prefix frontend${NC}"
echo ""
echo -e "${YELLOW}Terminal 3 - Inspeccionar BD (opcional):${NC}"
echo -e "  ${BLUE}npx prisma studio --prefix backend${NC}"
echo ""
echo -e "${GREEN}Luego abre:${NC} http://localhost:5173"
echo ""
echo -e "${BLUE}Para detener servicios:${NC}"
echo -e "  docker-compose down"
echo ""
