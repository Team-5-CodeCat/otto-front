# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` (uses turbopack and dotenv with .env.local)
- **Build**: `pnpm build` (uses turbopack)  
- **Start production**: `pnpm start` (requires .env.local)
- **Lint**: No explicit lint command configured - use `npx eslint .` if needed
- **Type check**: No explicit typecheck command - use `npx tsc --noEmit` if needed

## Environment Configuration

- Copy `.env.example` to `.env.local` and configure:
  - `PORT`: Frontend port
  - `BACKEND_PORT`: Backend API port
- API base URL configured via `NEXT_PUBLIC_API_BASE_URL` (defaults to localhost:4000 client-side, host.docker.internal:4000 server-side)
- GitHub app name via `NEXT_PUBLIC_GITHUB_APP_NAME` (defaults to 'otto-test-1')

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS v4 + Radix UI Themes
- **External SDK**: `@Team-5-CodeCat/otto-sdk` for backend API integration
- **Flow Diagrams**: ReactFlow for pipeline visualization
- **Package Manager**: pnpm with workspace configuration

### Project Structure

**App Router Structure (app/):**
- `(auth)/` - Authentication pages (signin/signup)
- `(dashboard)/` - Main application dashboard with nested routes:
  - `builds/`, `deployments/`, `environments/`, `projects/`, `pipelines/`, `settings/`, `tests/`
- `(landing)/` - Marketing pages
- `api/` - Next.js API routes (GitHub integration endpoints)
- `components/` - Reusable UI components organized by domain:
  - `ui/` - Basic UI components (Button, Input, Card, etc.)
  - `dashboard/` - Dashboard-specific components  
  - `auth/` - Authentication components
  - `github/` - GitHub integration components
- `contexts/` - React contexts (AuthContext)
- `hooks/` - Custom hooks (useAuth)
- `lib/` - Utility libraries and stores:
  - `*Store.ts` - State management for different domains
  - `api.ts` - GitHub API utilities with client/server-side URL handling
  - `auth-api.ts`, `jwt-utils.ts`, `token-manager.ts` - Authentication utilities

**Key Features:**
- **Authentication**: JWT-based auth with localStorage token management
- **GitHub Integration**: OAuth app integration with repository and branch management
- **Pipeline Editor**: Visual pipeline builder using ReactFlow with custom nodes and edges
- **Multi-tenant Dashboard**: Project-based organization with builds, deployments, and tests

### Development Notes

- **TypeScript Config**: Strict mode with additional safety features (noUncheckedIndexedAccess, exactOptionalPropertyTypes)
- **Path Aliases**: Configured for `@/*` imports pointing to project root
- **ESLint**: Comprehensive config covering JS/TS/React/JSON/Markdown/CSS with flat config format
- **Environment Handling**: Different API URLs for client vs server-side requests to handle Docker networking
- **State Management**: Custom stores in `lib/` directory for different application domains

### Backend Integration
- API calls handle both browser and server-side environments 
- Authentication via Bearer tokens stored in localStorage
- GitHub app integration with installation flow and repository management
- Error handling utilities for API responses