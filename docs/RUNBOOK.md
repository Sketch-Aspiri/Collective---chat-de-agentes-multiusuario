# Runbook

## Servicio caído
1. Revisar logs del backend (`winston` → stdout / agregador configurado).
2. Verificar conectividad a PostgreSQL y Redis (`docker-compose ps`).
3. Revisar `/health` del backend.

## Rollback
```bash
./infra/scripts/rollback.sh
```

## Backup de base de datos
```bash
./infra/scripts/backup.sh
```

TODO: completar con alertas, dashboards y contactos de guardia una vez exista infraestructura de monitoreo.
