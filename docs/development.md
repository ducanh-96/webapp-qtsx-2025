# Development Workflow

This document outlines the recommended workflow, code style, and conventions for contributing to the project.

## Workflow

1. **Branching:**

   - Use feature branches for new features: `feature/feature-name`
   - Use fix branches for bug fixes: `fix/bug-description`
   - Use descriptive names for branches

2. **Commits:**

   - Write clear, concise commit messages
   - Reference related issues or features when applicable

3. **Pull Requests:**
   - Submit pull requests to the main branch
   - Ensure all checks pass before requesting review
   - Provide a clear description of changes

## Code Style

- Use [Prettier](https://prettier.io/) for code formatting
- Follow ESLint rules as defined in `.eslintrc.json`
- Use TypeScript for all source files
- Organize imports logically and remove unused imports

## Conventions

- Use functional components and React hooks
- Keep components small and focused
- Place reusable logic in `src/services/` or custom hooks
- Use environment variables for configuration

## Testing

- Write unit tests for components and services
- Use Cypress for end-to-end tests
- Ensure all tests pass before merging

## Useful Commands

- `npm run dev` — Start development server
- `npm run lint` — Run linter
- `npm run test` — Run unit tests
- `npm run cypress` — Run end-to-end tests

For more on testing, see [`docs/testing.md`](docs/testing.md).
