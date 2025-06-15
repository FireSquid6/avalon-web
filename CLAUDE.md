# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for an Avalon web game implementation with three main packages:
- **engine**: Core game logic and data structures for Avalon (using Zod for validation)
- **server**: Elysia.js backend with authentication and game state management
- **client**: React frontend with TanStack Router and TailwindCSS + DaisyUI

## Technology Stack

**Runtime & Package Manager:**
- Bun runtime for all TypeScript packages
- Workspace-based monorepo structure

**Backend (server package):**
- Elysia.js web framework
- Drizzle ORM with SQLite database
- Session-based authentication system

**Frontend (client package):**
- React 19 with TanStack Router
- TailwindCSS 4 + DaisyUI for styling
- Vite for development and building

**Game Engine (engine package):**
- Pure TypeScript with Zod for schema validation
- Avalon game rules and state management

## Development Commands

### Root Level (Monorepo)
```bash
bun install          # Install dependencies for all packages
```

### Client Package (React Frontend)
```bash
cd packages/client
bun run dev          # Start Vite development server
bun run build        # Build for production (TypeScript check + Vite build)
bun run lint         # Run ESLint
bun run preview      # Preview production build
```

### Server Package (Elysia Backend)
```bash
cd packages/server
bun run index.ts     # Start the server (port 4320)
```

### Engine Package (Game Logic)
```bash
cd packages/engine
bun run index.ts     # Run the engine
```

## Architecture Overview

**Game State Management:**
- Game logic is centralized in the `engine` package with comprehensive Zod schemas
- Server maintains active games in memory and persists completed games to SQLite
- Client communicates with server via Elysia routes for game actions

**Database Schema:**
- Users, profiles, sessions, completed games, and participation tracking
- Session-based authentication with token expiration
- Game history persistence for completed Avalon games

**Monorepo Structure:**
- Each package has its own `package.json` and TypeScript configuration
- Shared types and logic are exported from the engine package
- Development environment managed through Nix flake

## Key Files

**Game Logic:**
- `packages/engine/index.ts` - Core game types and schemas (GameState, Player, Round, etc.)
- `packages/engine/logic.ts` - Game rule implementations
- `packages/engine/actions.ts` - Game action handlers

**Server:**
- `packages/server/routes.ts` - API route definitions
- `packages/server/db/schema.ts` - Database schema with Drizzle
- `packages/server/db/auth.ts` - Authentication logic

**Client:**
- `packages/client/src/main.tsx` - React app entry point with TanStack Router
- `packages/client/src/routes/` - Page components and routing

## Development Environment

The project includes a Nix flake for reproducible development environments:
```bash
nix develop         # Enter development shell with Bun, Node.js, TypeScript, and Fly.io CLI
```

## Database Operations

Database migrations and schema management:
```bash
cd packages/server
bunx drizzle-kit generate    # Generate migrations
bunx drizzle-kit migrate     # Apply migrations  
bunx drizzle-kit studio      # Open Drizzle Studio
```