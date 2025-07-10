# Setup Guide

This document provides step-by-step instructions to set up the project for local development.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- (Optional) [Docker](https://www.docker.com/) for containerized deployment

## Installation Steps

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**

   - Copy `.env.local.example` to `.env.local` and update values as needed.

4. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

## Additional Notes

- For Firebase setup, ensure your credentials are correctly set in `.env.local`.
- For Power BI integration, configure the required API keys and endpoints.
- To run tests, see [`docs/testing.md`](docs/testing.md).

Refer to other documentation files in the `docs/` folder for more details on usage, architecture, and deployment.
