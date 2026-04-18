# Brewica
A coffee diary that gives you feedback.

## Objectives
Built to showcase end-to-end product development across infrastructure, DevOps, frontend and backend. A learning project and portfolio piece that reflects how I work with TypeScript across the full stack.

## Stack & Decisions
- **Nx monorepo**: keeps the frontend, backend and shared types in sync with unified tooling and CI
- **Next.js 16 + React 19**: frontend, with Tailwind CSS for styling and Vitest for testing
- **NestJS 11**: TypeScript native structured API
- **Prisma 7 + PostgreSQL**: type-safe database
- **Authentik**: self-hosted identity provider, integrated via `openid-client`
- **Traefik**: reverse proxy handling routing and TLS
- **Docker**: containerised local development and production deployment
- **TypeScript 5.9:** type safety across the full stack

## Structure
| Project | Description |
|---|---|
| `apps/web` | Frontend web application |
| `apps/api` | Backend REST API |
| `apps/api-e2e` | End-to-end tests for the API (planned) |
| `libs/db` | Prisma client and schema |
| `libs/shared-types` | Shared TypeScript types |

## AI Usage - Claude

This project is being built with Claude as a collaborative tool. I have assigned Claude a variety of roles: An advisor for architectural decisions, a pair programmer during debugging, and a mentor for areas I was less familiar with (particularly DevOps and infrastructure).

All decisions have been made by me and where Claude suggests an approach, I question it, research it, and validate it before implementing. The project is a significant learning opportunity, particularly around infrastructure: Docker, Traefik, and CI/CD pipelines are areas I have been building knowledge in through this process.

This reflects how I work professionally, using available tools effectively while maintaining ownership of the codebase and continuing to build understanding as I go.
