# Contribuir

Gracias por contribuir a **agentes-chat**. Antes de empezar, levanta el entorno
siguiendo [SETUP.md](./SETUP.md).

## Tabla de contenidos
- [Flujo de ramas](#flujo-de-ramas)
- [Commits](#commits)
- [Estilo de código](#estilo-de-código)
- [Tests](#tests)
- [Checklist antes de abrir un PR](#checklist-antes-de-abrir-un-pr)

---

## Flujo de ramas

```
main
  └── staging
       ├── staging-backend
       ├── staging-frontend
       ├── staging-devops
       └── feature/*  ·  bugfix/*
```

- `main`: código estable y desplegable.
- `staging`: integración antes de producción.
- `staging-*`: ramas de trabajo por área.
- `feature/*` · `bugfix/*`: cambios puntuales, parten de `staging`.

---

## Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat(agents): add @mention detection
fix(auth): fix JWT expiration bug
docs(readme): update API endpoints
ci(devops): add build workflow
```

Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

---

## Estilo de código

```bash
npm run lint            # eslint backend + frontend
npm run format          # prettier --write
npm run format:check    # verifica formato (lo que corre en CI)
```

- TypeScript en backend y frontend.
- Backend modular por dominio (`modules/<dominio>/{service,controller,routes,model}.ts`); sin lógica de negocio en controllers.
- Frontend con stores Zustand separados por contexto.

---

## Tests

```bash
make test               # backend + frontend en Docker
npm run test:backend
npm run test:frontend
npm run test:backend:coverage
```

Objetivo de cobertura: **≥ 80%**.

---

## Checklist antes de abrir un PR

- [ ] `npm run lint` sin errores
- [ ] `npm run format:check` pasa
- [ ] Tests de backend y frontend en verde
- [ ] Cobertura ≥ 80% en el código nuevo
- [ ] Sin secretos hardcodeados (usar `.env`, ver [`.env.example`](../.env.example))
- [ ] Rama actualizada con la rama destino
- [ ] Commits siguen Conventional Commits
