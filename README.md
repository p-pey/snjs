# TaskFlow

A todo application built with **Next.js**, **Supabase**, and **React Query**. Manage tasks with categories, tags, priorities, activity tracking, and Excel export.

## Demo https://snjs-todo.vercel.app

## Quick start

```bash
npm install
cp .env.example .env.local   # then add your Supabase URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Before the app works**, configure Supabase and run the database migration. See the full guide:

→ **[docs/PROJECT.md](./docs/PROJECT.md)** — installation, Supabase setup, environment variables, architecture, and feature documentation.

## Main routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login`, `/signup` | Authentication |
| `/dashboard` | Stats and activity |
| `/todos` | Task list and management |
| `/categories` | Category CRUD |
| `/tags` | Tag CRUD |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — run production build
- `npm run lint` — ESLint
