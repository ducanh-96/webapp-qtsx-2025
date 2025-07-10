# Architecture

This document describes the technical architecture and structure of the project.

## Project Structure

- `src/app/` — Next.js pages and routing logic
- `src/components/` — Reusable React components
- `src/services/` — Service modules for API, caching, security, Power BI, etc.
- `src/config/` — Configuration files (Firebase, Firestore)
- `src/contexts/` — React context providers for state management
- `public/` — Static assets (images, icons, etc.)
- `docs/` — Documentation files

## Main Technologies

- **Next.js** for server-side rendering and routing
- **React** for UI components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Firebase** for backend services
- **Power BI** for embedded reporting
- **Jest** and **Cypress** for testing

## Key Modules

- **Authentication:** Context-based authentication, protected routes, login/signup pages
- **Admin:** User management features in `/admin`
- **Documents:** Document management in `/documents`
- **Reports:** Power BI integration in `/reports`
- **Error Handling:** Custom error pages and error boundaries

## Data Flow

- Client-side state is managed using React Context and hooks.
- API calls are handled via service modules in `src/services/`.
- Authentication state is provided globally via context providers.

## Extensibility

- Modular component and service structure for easy feature addition.
- Configuration-driven setup for environment variables and integrations.

For development workflow and conventions, see [`docs/development.md`](docs/development.md).
