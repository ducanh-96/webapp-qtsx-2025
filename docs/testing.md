# Testing Guide

This document explains the testing strategy and how to run tests for the project.

## Testing Tools

- **Jest:** Unit testing for components and services
- **Cypress:** End-to-end (E2E) testing for user flows

## Running Tests

### Unit Tests

- To run all unit tests:

  ```bash
  npm run test
  # or
  yarn test
  ```

- Unit tests are located in `__tests__` folders, e.g., `src/components/auth/__tests__/`.

### End-to-End Tests

- To run Cypress E2E tests:

  ```bash
  npm run cypress
  # or
  yarn cypress
  ```

- E2E test files are in `cypress/e2e/`.

### Linting

- To check code style and lint errors:
  ```bash
  npm run lint
  # or
  yarn lint
  ```

## Writing Tests

- Write unit tests for all new components and services.
- Cover edge cases and error handling.
- Use descriptive test names and structure.

## Continuous Integration

- All tests and lint checks should pass before merging code.

For troubleshooting test failures, see [`docs/troubleshooting.md`](docs/troubleshooting.md).
