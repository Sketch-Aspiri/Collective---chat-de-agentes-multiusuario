# ⚡ Setup Rápido: Git Local (5 minutos)

## Tu Situación Actual
✅ Creaste 3 ramas en GitHub
❌ Solo tienes `main` en local
❌ Necesitas traer las ramas `staging-*` a tu máquina

---

## 🚀 Comandos Exactos (Copia y Pega)

### Paso 1: Asegúrate de estar en main
```bash
git checkout main
```

### Paso 2: Trae toda la info del repositorio remoto
```bash
git fetch origin
```

### Paso 3: Crea las 3 ramas locales conectadas a remoto

```bash
# Opción A: Una por una
git checkout -b staging-backend origin/staging-backend
git checkout -b staging-devops origin/staging-devops
git checkout -b staging-frontend origin/staging-frontend

# O Opción B: Script automático (copia y pega en terminal)
for branch in staging-backend staging-devops staging-frontend; do
  git checkout -b $branch origin/$branch
done
```

### Paso 4: Verifica que todas estén ahí
```bash
git branch -a
```

**Deberías ver:**
```
  main
  staging-backend
  staging-devops
  staging-frontend
* (la rama donde estés ahora)
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
  remotes/origin/staging-backend
  remotes/origin/staging-devops
  remotes/origin/staging-frontend
```

---

## 🔄 Cambiar Entre Ramas

```bash
# Cambiar a staging-backend
git checkout staging-backend

# Cambiar a staging-frontend
git checkout staging-frontend

# Cambiar a staging-devops
git checkout staging-devops

# Volver a main
git checkout main

# Ver en dónde estoy ahora
git branch
```

---

## 📝 Crear una rama de feature desde staging-backend

```bash
# 1. Asegúrate de estar en staging-backend
git checkout staging-backend

# 2. Trae los últimos cambios
git pull origin staging-backend

# 3. Crea tu rama de feature
git checkout -b feature/mi-tarea

# 4. Trabaja normalmente, haz commits
git add .
git commit -m "feat(modulo): descripcion"

# 5. Sube tu rama a GitHub
git push origin feature/mi-tarea

# 6. En GitHub creas un PR: base = staging-backend, compare = feature/mi-tarea
```

---

## ✅ Checklist

- [ ] Ejecuté `git fetch origin`
- [ ] Ejecuté los 3 `git checkout -b staging-*`
- [ ] `git branch -a` muestra las 6 ramas (3 locales + 3 remotas)
- [ ] Puedo cambiar entre ramas sin errores
- [ ] Entiendo que siempre trabajo en `feature/*` o `bugfix/*`
- [ ] Mis PRs siempre son hacia `staging-*`, nunca directo a `main`

---

## 🆘 Si algo sale mal

### "Tengo conflictos"
```bash
# Ver qué pasó
git status

# Soluciones comunes:
git pull origin staging-backend  # Actualizar

# Si querés descartar cambios locales:
git reset --hard origin/staging-backend
```

### "Quiero empezar de nuevo limpio"
```bash
# Eliminar rama local
git branch -D feature/mi-rama

# Crear nueva
git checkout -b feature/nueva-rama-limpia origin/staging-backend
```

### "Estoy en rama equivocada"
```bash
# Ver dónde estoy
git branch

# Cambiar
git checkout staging-backend
```

---

## 🎯 Resumen Ultra-Rápido

```bash
# Una sola línea que hace todo:
git fetch origin && git checkout -b staging-backend origin/staging-backend && git checkout -b staging-devops origin/staging-devops && git checkout -b staging-frontend origin/staging-frontend && git branch -a
```

---

**¿Listo? Copia los comandos y ejecuta. En 2 minutos está hecho.** ✨
