# Troubleshooting Guide

This document lists common issues and solutions for the project.

## Common Issues

### 1. Application Fails to Start

- **Check:** Node.js and npm/yarn versions.
- **Solution:** Ensure all dependencies are installed. Run:
  ```bash
  npm install
  # or
  yarn install
  ```

### 2. Environment Variables Not Loaded

- **Check:** `.env.local` file exists and is correctly configured.
- **Solution:** Copy from `.env.local.example` and update values.

### 3. Firebase/Power BI Integration Fails

- **Check:** API keys and configuration in `.env.local`.
- **Solution:** Verify credentials and endpoints.

### 4. Tests Fail

- **Check:** Test output for errors.
- **Solution:** Ensure code changes are covered by tests and all dependencies are installed.

### 5. Deployment Issues

- **Check:** Deployment logs (Vercel, Docker, etc.).
- **Solution:** Review logs for errors, verify environment variables, and check build configuration.

## Getting Help

- Review documentation in the `docs/` folder.
- Search for similar issues in the repository.
- If unresolved, open an issue with detailed information.

For more details on setup and deployment, see [`docs/setup.md`](docs/setup.md) and [`docs/deployment.md`](docs/deployment.md).
