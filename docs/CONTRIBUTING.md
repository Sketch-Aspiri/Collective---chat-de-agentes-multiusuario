# Contribuir

## Flujo de ramas

```
main
  └── staging
       └── feature/*
       └── bugfix/*
```

## Commits

Conventional Commits:

```
feat(agents): add @mention detection
fix(auth): fix JWT expiration bug
docs(readme): update API endpoints
```

## Antes de abrir un PR

- `npm run lint`
- `npm run test:backend` / `npm run test:frontend`
- Cobertura de tests ≥ 80%
- Sin secretos hardcodeados
