<div align="center">

# ⚡ Adyapan Connect

**AI-Powered WhatsApp Business Messaging, CRM & Automation SaaS**

Connect. Automate. Engage. Grow.

[![Node](https://img.shields.io/badge/node-%3E%3D20-3c873a)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-8.x-f69220)](https://pnpm.io)
[![Turborepo](https://img.shields.io/badge/monorepo-turborepo-000000)](https://turbo.build)
[![NestJS](https://img.shields.io/badge/api-NestJS-e0234e)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/web-Next.js%2014-000000)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/orm-Prisma-2d3748)](https://prisma.io)
[![License](https://img.shields.io/badge/license-Proprietary-blue)](./LICENSE)

</div>

---

## Overview

Adyapan Connect is a multi-tenant SaaS platform that lets businesses run their entire
WhatsApp presence — broadcasts, team inbox, chatbots, AI agents, CRM and analytics —
from a single dashboard built on the Official WhatsApp Business API.

This repository is a **pnpm + Turborepo monorepo** containing the API, the customer
web app, the super-admin panel, and a set of shared internal packages.

## Architecture

```
                     ┌──────────────────────────────────────────────┐
                     │                   Clients                     │
                     │   Web App (3000)   ·   Admin Panel (3001)      │
                     └───────────────┬──────────────┬────────────────┘
                                     │  HTTPS/REST   │
                                     ▼               ▼
                     ┌──────────────────────────────────────────────┐
                     │              NestJS API  (:4000)               │
                     │  Auth · Tenants · Contacts · Campaigns ·       │
                     │  Templates · Conversations · CRM · AI · Billing│
                     └───────┬───────────────┬───────────────┬───────┘
                             │               │               │
                     ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼───────┐
                     │  PostgreSQL  │ │    Redis    │ │  WhatsApp    │
                     │  (Prisma)    │ │  (BullMQ)   │ │  Cloud API   │
                     └──────────────┘ └─────────────┘ └──────────────┘
```

## Tech Stack

| Layer        | Technology                                                        |
|--------------|-------------------------------------------------------------------|
| **API**      | NestJS 10, TypeScript, Prisma, PostgreSQL, Redis/BullMQ, Passport |
| **Web**      | Next.js 14 (App Router), React 18, Tailwind CSS, Zustand, React Query |
| **Admin**    | Next.js 14, Tailwind CSS                                           |
| **Shared**   | TypeScript packages (`types`, `validation`, `logger`, `config`, …)|
| **Tooling**  | pnpm workspaces, Turborepo, Prettier, ESLint, Docker              |

## Monorepo Layout

```
adyapan-connect/
├── apps/
│   ├── api/            # NestJS REST API (backend)
│   ├── web/            # Next.js customer web app + dashboard
│   └── admin/          # Next.js super-admin panel
├── packages/
│   ├── database/       # Prisma schema + client (shared)
│   ├── types/          # Shared TypeScript types
│   ├── validation/     # Shared Zod schemas
│   ├── config/         # Shared runtime config helpers
│   ├── logger/         # Shared logger
│   ├── ui/             # Shared React UI components
│   ├── whatsapp/       # WhatsApp Cloud API client
│   ├── ai/             # AI/LLM helpers
│   └── billing/        # Billing/pricing helpers
├── infrastructure/     # Docker, Nginx, cloud (AWS) configs
├── docs/               # Architecture, API, database, deployment docs
├── docker-compose.yml  # Local Postgres + Redis (+ optional apps)
├── turbo.json          # Turborepo pipeline
└── pnpm-workspace.yaml # Workspace definition
```

## Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 8 (`npm i -g pnpm`)
- **PostgreSQL** 14+ (or Docker) — with the `pgcrypto` and `pg_trgm` extensions
- **Redis** 6+ (or Docker) — used by background jobs (BullMQ)

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# then set apps/api/.env (see apps/api/README.md) and apps/web/.env.local
```

### 3. Set up the database

```bash
pnpm db:generate      # generate Prisma client
pnpm db:migrate       # apply schema (or: pnpm --filter @adyapan/database db:push)
```

### 4. Run everything

```bash
pnpm dev              # starts all apps via Turborepo
```

Or start apps individually:

```bash
pnpm --filter @adyapan/api dev     # API   → http://localhost:4000/api
pnpm --filter @adyapan/web dev     # Web   → http://localhost:3000
pnpm --filter @adyapan/admin dev   # Admin → http://localhost:3001
```

## Services & Ports

| Service      | URL                              | Notes                          |
|--------------|----------------------------------|--------------------------------|
| Web app      | http://localhost:3000            | Marketing site + dashboard     |
| Admin panel  | http://localhost:3001            | Super-admin                    |
| API          | http://localhost:4000/api        | Global prefix `api`, version 1 |
| Swagger docs | http://localhost:4000/api/docs   | OpenAPI UI (non-prod)          |

## Common Scripts

| Command             | Description                                  |
|---------------------|----------------------------------------------|
| `pnpm dev`          | Run all apps in dev (Turborepo)              |
| `pnpm build`        | Build all apps and packages                  |
| `pnpm lint`         | Lint the whole workspace                     |
| `pnpm test`         | Run tests across the workspace               |
| `pnpm format`       | Prettier format                              |
| `pnpm db:generate`  | Generate the Prisma client                   |
| `pnpm db:migrate`   | Run Prisma migrations                        |
| `pnpm db:seed`      | Seed the database                            |

## Documentation

- [Architecture](./docs/architecture/README.md)
- [API Guide](./docs/api/README.md)
- [Database](./docs/database/README.md)
- [Deployment](./docs/deployment/README.md)
- [Contributing](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

## License

Proprietary — © Adyapan. All rights reserved. See [LICENSE](./LICENSE).
# AdyapanCONNECT
