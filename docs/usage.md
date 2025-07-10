# Usage Guide

This document explains how to use the main features of the application.

## User Authentication

- **Sign Up:** Go to `/auth/signup` to create a new account.
- **Login:** Go to `/auth/login` to access your account.
- **Protected Routes:** Some pages require authentication. Unauthenticated users will be redirected to the login page.

## Admin Dashboard

- Access the admin dashboard at `/admin`.
- Manage users, view user lists, and perform administrative actions.

## Document Management

- Go to `/documents` to view and manage documents.
- Upload, view, and organize documents as needed.

## Reporting

- Access reports at `/reports`.
- Embedded Power BI reports are available for data visualization and analytics.

## Error Handling

- Custom error pages are provided for 404 and other errors.
- Users are redirected to `/error-404` or `/not-found` as appropriate.

## Layout Controls

- Header and footer visibility can be toggled based on the page context for a better user experience.

For more technical details, refer to [`docs/architecture.md`](docs/architecture.md).
