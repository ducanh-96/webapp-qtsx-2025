# Deployment Guide

This document describes how to deploy the application to production and manage environment variables.

## Deployment Options

### Vercel

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2. Connect the repository to [Vercel](https://vercel.com/).
3. Set environment variables in the Vercel dashboard.
4. Deploy the project. Vercel will handle builds and hosting automatically.

### Docker

1. Build the Docker image:
   ```bash
   docker build -t your-app-name .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env.local your-app-name
   ```

## Environment Variables

- Copy `.env.local.example` to `.env.local` and fill in the required values.
- Common variables:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_POWERBI_CLIENT_ID`
  - (Add others as needed for your integrations)

## Notes

- Ensure all secrets are kept out of version control.
- For custom domains, configure DNS in your hosting provider.
- For troubleshooting deployment issues, see [`docs/troubleshooting.md`](docs/troubleshooting.md).
