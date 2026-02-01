# Matriz RBAC (MVP1)

| Recurso | Ação | Roles permitidos |
| --- | --- | --- |
| patient | create | TENANT_ADMIN, TEAM |
| patient | read | OWNER*, TENANT_ADMIN, TEAM, PATIENT |
| patient | update | TENANT_ADMIN, TEAM, PATIENT |
| patient | delete | TENANT_ADMIN |
| plan | create | TENANT_ADMIN, TEAM |
| plan | read | OWNER*, TENANT_ADMIN, TEAM, PATIENT |
| plan | update | TENANT_ADMIN, TEAM |
| plan | approve | TENANT_ADMIN |
| plan | publish | TENANT_ADMIN |
| dataset | create | OWNER |
| dataset | read | OWNER, TENANT_ADMIN |
| dataset | update | OWNER |
| audit | read | OWNER, TENANT_ADMIN |
| tenant | create | OWNER |
| tenant | read | OWNER |

Notas:
- `OWNER*` somente com `app.owner_mode = true` em rotas `/owner`.
- RLS filtra o escopo final (tenant + paciente atribuído).
