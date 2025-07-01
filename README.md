# Enterprise Web Application

A comprehensive document management and collaboration platform with Google Workspace integration, built with Next.js, Firebase, and TypeScript.

## 🚀 Project Overview

This enterprise web application provides:

- **User Management**: Role-based access control with Google SSO
- **Document Management**: Seamless Google Drive and Sheets integration
- **Analytics & Reports**: Power BI integration for data-driven insights
- **Real-time Collaboration**: Team-based document sharing and editing

## 📋 Development Status - Phase 1

### ✅ Completed (Sprint 1.1: Infrastructure Setup)

- [x] React TypeScript project setup
- [x] ESLint, Prettier, Git hooks configuration
- [x] Firebase project setup and configuration
- [x] Tailwind CSS styling system
- [x] Project structure and build pipeline
- [x] Environment configuration

### 🚧 In Progress (Sprint 1.2: Authentication System)

- [x] Firebase Auth with Google SSO
- [x] Authentication context and hooks
- [x] Login/logout components
- [x] Route protection system
- [x] Basic dashboard implementation
- [ ] User session management testing
- [ ] Google Workspace accounts integration testing

### 📅 Next Steps (Phase 1 - Week 2)

- **Sprint 2.1**: Database Design (Firestore collections, security rules)
- **Sprint 2.2**: Google APIs Integration (Drive API, Sheets API)

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form validation and management

### Backend & Authentication

- **Firebase Auth** - Authentication with Google SSO
- **Firestore** - NoSQL database for user and document management
- **Firebase Storage** - File storage and management

### Development Tools

- **ESLint & Prettier** - Code linting and formatting
- **Husky** - Git hooks for code quality
- **Jest** - Unit testing framework
- **Cypress** - End-to-end testing

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- Google Cloud Project with necessary APIs enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd enterprise-web-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your Firebase and Google Cloud credentials in `.env.local`:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/login/        # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
│   └── auth/             # Authentication components
├── contexts/             # React context providers
│   └── AuthContext.tsx   # Authentication state management
├── config/               # Configuration files
│   └── firebase.ts       # Firebase configuration
├── types/                # TypeScript type definitions
│   └── index.ts          # Global type definitions
└── hooks/                # Custom React hooks (future)
```

## 🔐 Authentication

The application uses Firebase Authentication with Google SSO integration:

- **Google SSO**: Primary authentication method
- **Role-based Access**: Admin, Manager, User roles
- **Route Protection**: Automatic redirection for unauthenticated users
- **Session Management**: Persistent authentication state

### User Roles

- **Admin**: Full system access, user management, system configuration
- **Manager**: User management, document management, reporting
- **User**: Document access, basic reporting

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run unit tests
npm run test:watch   # Watch mode for tests
npm run test:coverage # Test coverage report
```

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. **Connect to Vercel**

   - Push your code to GitHub/GitLab
   - Import project in Vercel
   - Configure environment variables

2. **Environment Variables**
   Add all Firebase and Google Cloud credentials to Vercel environment variables

3. **Automatic Deployment**
   - Main branch deploys to production
   - Pull requests create preview deployments

## 📊 Phase 1 Success Metrics

### Technical KPIs

- ✅ Page load time: <2 seconds
- ✅ Authentication response: <1 second
- ✅ TypeScript coverage: 100%
- ✅ Zero critical security vulnerabilities

### User Experience

- ✅ Google SSO integration working
- ✅ Responsive design on all devices
- ✅ Intuitive navigation and UI
- ✅ Error handling and user feedback

## 🔮 Upcoming Features (Phase 2-4)

### Phase 2: Core Features (Week 3-4)

- User management system
- Document upload/download
- Google Drive integration
- Folder management

### Phase 3: Advanced Features (Week 5-6)

- Power BI report embedding
- Advanced permissions
- Real-time notifications
- Performance optimization

### Phase 4: Testing & Deployment (Week 7-8)

- Comprehensive testing suite
- Production deployment
- User acceptance testing
- Monitoring and documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential. All rights reserved.

## 👥 Development Team

- **Senior Developer**: Architecture, complex integrations, code review
- **Frontend Developer**: UI/UX implementation, React components
- **Backend Developer**: API development, database design, integrations
- **QA Engineer/DevOps**: Testing, deployment, monitoring

## 📞 Support

For technical support or questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Project Status**: Phase 1 - Foundation & Core Setup ✅ In Progress
**Last Updated**: January 2025
**Version**: 0.1.0
