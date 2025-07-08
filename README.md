# Enterprise Web Application

A comprehensive enterprise-grade web application built with Next.js, featuring user management, document management, Power BI integration, and advanced security.

## 🚀 Features

- **Authentication System**: Firebase Auth with Google Sign-in
- **User Management**: Role-based access control (Admin, Manager, User)
- **Power BI Integration**: Enterprise reporting and analytics
- **Advanced Security**: Multi-layer security with threat detection
- **Performance Optimization**: Intelligent caching and monitoring

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd enterprise-web-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Power BI Configuration (Optional)
NEXT_PUBLIC_POWER_BI_CLIENT_ID=your_powerbi_client_id
POWER_BI_CLIENT_SECRET=your_powerbi_client_secret
POWER_BI_TENANT_ID=your_tenant_id
POWER_BI_WORKSPACE_ID=your_workspace_id
POWER_BI_REPORT_ID=your_report_id

# Google APIs (Optional)
GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_json
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and Firestore
4. Get your configuration keys from Project Settings
5. Update the `.env.local` file with your Firebase configuration

### 5. Deploy Firestore Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase use your_project_id
firebase deploy --only firestore:rules
```

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run cypress:open # Open Cypress E2E tests
npm run cypress:run  # Run Cypress tests headlessly

# Type Checking
npm run type-check   # Run TypeScript type checking
```

## 📁 Project Structure

```
enterprise-web-app/
├── src/
│   ├── app/                 # Next.js 13+ App Router
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Main dashboard
│   │   ├── documents/      # Document management
│   │   ├── reports/        # Power BI reports
│   │   └── api/           # API routes
│   ├── components/         # React components
│   │   ├── admin/         # Admin components
│   │   ├── auth/          # Authentication components
│   │   ├── documents/     # Document components
│   │   └── reports/       # Reporting components
│   ├── contexts/          # React contexts
│   ├── services/          # Business logic services
│   ├── config/            # Configuration files
│   └── types/             # TypeScript type definitions
├── cypress/               # E2E tests
├── docs/                  # Documentation
├── .github/workflows/     # CI/CD pipelines
└── public/               # Static assets
```

## 🔐 Authentication

The application uses Firebase Authentication with the following features:

- **Email/Password Authentication**
- **Google Sign-in**
- **Role-based Access Control**
- **Session Management**
- **Security Monitoring**

### Default Test Accounts

For development and testing, you can create test accounts with different roles:

- **Admin**: Full system access
- **Manager**: Department management access
- **User**: Basic user access

## 📊 Power BI Integration

The application uses **Power BI Public Reports** via iframe embedding:

### Setup Power BI Reports:

1. **Create/Publish your Power BI reports** in Power BI Service
2. **Share reports publicly** and get the share URLs
3. **Update environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_POWERBI_SALES_REPORT_URL=https://app.powerbi.com/view?r=YOUR_SALES_REPORT_TOKEN
   NEXT_PUBLIC_POWERBI_ANALYTICS_REPORT_URL=https://app.powerbi.com/view?r=YOUR_ANALYTICS_REPORT_TOKEN
   NEXT_PUBLIC_POWERBI_USAGE_REPORT_URL=https://app.powerbi.com/view?r=YOUR_USAGE_REPORT_TOKEN
   ```
4. **Restart the development server**

### How to get Power BI Share URLs:

1. Open your report in Power BI Service
2. Click **File** → **Share** → **Embed** → **Publish to web**
3. Copy the generated URL
4. Update the corresponding environment variable

**Note**: This method uses public sharing, so ensure your reports contain only non-sensitive data or implement proper access controls.

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### End-to-End Tests

```bash
# Interactive mode
npm run cypress:open

# Headless mode
npm run cypress:run
```

### Test Coverage

```bash
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Docker

```bash
# Build Docker image
docker build -t enterprise-web-app .

# Run container
docker run -p 3000:3000 enterprise-web-app
```

### Manual Deployment

```bash
npm run build
npm start
```

## 📈 Monitoring

The application includes comprehensive monitoring:

- **Health Check**: `/api/health`
- **Performance Monitoring**: Built-in performance service
- **Security Monitoring**: Real-time threat detection
- **Error Tracking**: Automatic error logging

## 🛠️ Development Tools

- **TypeScript**: Type safety and better development experience
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality control
- **Jest**: Unit testing framework
- **Cypress**: End-to-end testing

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**

   - Verify your Firebase configuration
   - Check network connectivity
   - Ensure Firebase project is active

2. **Build Errors**

   - Clear `.next` folder: `rm -rf .next`
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run type-check`

3. **Environment Variables**
   - Ensure all required variables are set
   - Restart development server after changes
   - Check variable names (case-sensitive)

### Getting Help

- Check the [documentation](./docs/)
- Review existing [issues](./docs/TECHNICAL_ANALYSIS.md)
- Contact the development team

## 📝 License

This project is proprietary and confidential.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

---

## 📞 Support

For technical support or questions:

- Review the documentation in the `docs/` folder
- Check the troubleshooting section above
- Contact the development team

**Happy coding! 🚀**
