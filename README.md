## Dental Hub Backend (NestJS)

API backend para gestión clínica dental (estilo consultorio) con arquitectura modular en NestJS, PostgreSQL y TypeORM.

## Requisitos
- Node.js 20+
- pnpm
- Docker Desktop

## Configuración Rápida
1. Crear variables de entorno:
```bash
cp .env.example .env
```
2. Instalar dependencias:
```bash
pnpm install
```
3. Levantar base de datos:
```bash
pnpm db:up
```
4. Iniciar API:
```bash
pnpm start:dev
```

## Configuración de Entorno
Variables clave:
- `PORT`: puerto HTTP de la API (default `3000`)
- `DB_HOST`: host PostgreSQL (default `127.0.0.1`)
- `DB_PORT`: puerto PostgreSQL (default `5432`)
- `DB_NAME`: nombre de base (default `DentalHubDB`)
- `DB_USERNAME`: usuario DB (default `postgres`)
- `DB_PASSWORD`: password DB (default `postgres`)
- `DB_SYNCHRONIZE`:
  - `true` (o no definido): habilita `synchronize` para desarrollo local
  - `false`: deshabilita synchronize (recomendado para producción)

Nota: en producción se deben aplicar migraciones SQL/TypeORM y mantener `DB_SYNCHRONIZE=false`.

## Scripts
- `pnpm start:dev`: levanta API en modo watch
- `pnpm start:prod`: ejecuta build en `dist`
- `pnpm test:e2e`: corre toda la suite e2e
- `pnpm db:up`: levanta PostgreSQL con Docker
- `pnpm db:down`: baja contenedores
- `pnpm db:logs`: logs de PostgreSQL

## Seed de Datos
Endpoint:
- `GET /seed`

Carga datos de prueba (usuarios, clínicas, membresías, pacientes, agenda, facturación, etc.).

Usuarios seed para login:
- `test1@google.com` / `Abc123` (admin)
- `test2@google.com` / `Abc123`
- `test3@google.com` / `Abc123`

## Fases Implementadas

### Fase 1
- Multi-clínica: `clinics`, `clinic_memberships`
- Scope por clínica vía `x-clinic-id`
- Agenda base:
  - tipos de cita
  - citas
  - validación de solapamientos y rango horario
- Pacientes
- Facturación:
  - `invoices`
  - `invoice_items`
  - pagos parciales y transición de estado de factura

### Fase 2
- Historia clínica (`clinical_records`)
- Notas clínicas (`clinical_notes`)
- Tratamientos (`treatments`)
- Sesiones de tratamiento (`treatment_sessions`)
- Regla de integridad: tratamiento y registro clínico deben pertenecer al mismo paciente
- Validaciones de alcance por clínica en módulos clínicos

### Fase 3
- Plantillas de mensaje (`message_templates`)
- Mensajería saliente (`outbound_messages`)
- Recordatorios (`reminders`)
- Gastos (`expenses`)
- Dashboard operativo/financiero (`/common/dashboard`)
- Migración SQL de fase 3:
  - `src/migrations/202603050002_phase3_ops.sql`

## Internacionalización (i18n)
Implementado con `nestjs-i18n` para respuestas y errores API.

Idiomas soportados:
- `en`
- `es`

Resolución de idioma (orden de prioridad):
1. Query param `lang`
2. Header `x-lang` o `x-custom-lang`
3. Header `Accept-Language`
4. Fallback `en`

Catálogos:
- `src/i18n/en/api.json`
- `src/i18n/es/api.json`

## Pruebas E2E
Configuración:
- `__test__/jest-e2e.json`

Specs implementados:
- `__test__/app.e2e-spec.ts`
- `__test__/phase1.e2e-spec.ts`
- `__test__/phase2.e2e-spec.ts`
- `__test__/phase3.e2e-spec.ts`
- `__test__/i18n.e2e-spec.ts`

Ejecución:
```bash
pnpm test:e2e
```

Resultado actual esperado:
- 5 suites
- 16 tests

## Troubleshooting
- Puerto ocupado (`EADDRINUSE: :::3000`):
```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
kill -9 <PID>
```
O cambiar `PORT`.

- Error de conexión a DB:
  - confirmar Docker abierto
  - correr `pnpm db:up`
  - validar variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`

- Error de i18n por path:
  - verificar que existan assets de `src/i18n` en build
  - revisar `nest-cli.json` y configuración de carga en `AppModule`
