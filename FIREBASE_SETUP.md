# Firebase Setup Guide

## Current Issue

You're seeing a "Failed to get document because the client is offline" error. This can happen due to:

1. **Missing Firebase configuration** - Environment variables not set
2. **Network connectivity issues** - Firewall or internet connection
3. **Firebase project not configured** - Project doesn't exist or rules are restrictive

## Quick Fix

### Step 1: Check Environment Variables

Create a `.env.local` file in your project root with your Firebase config:

```bash
# Copy from .env.local.example and fill in your values
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual Firebase project values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

### Step 2: Verify Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Make sure your project exists
3. Check Firestore Database is created
4. Verify Authentication is enabled

### Step 3: Test Connection

After setting up the environment variables:

1. Restart the development server: `npm run dev`
2. Check the browser console for connection status
3. The yellow banner will show if there are still connectivity issues

## Features Added

### Offline Support

- **Automatic persistence**: Data is cached locally for offline access
- **Multi-tab support**: Works across multiple browser tabs
- **Graceful fallback**: Uses Firebase Auth data when Firestore is unavailable

### Connection Monitoring

- **Visual indicator**: Yellow banner shows when offline
- **Auto-retry**: Attempt to reconnect when online
- **Detailed logging**: Console messages help debug connection issues

### Error Handling

- **Graceful degradation**: App continues to work with limited functionality
- **User feedback**: Clear messages about offline status
- **Automatic recovery**: Reconnects when connection is restored

## Testing Offline Mode

1. Open Developer Tools → Network tab
2. Set throttling to "Offline"
3. The app should continue working with cached data
4. Yellow banner will appear indicating offline mode

## Troubleshooting

If you're still getting errors:

1. **Check browser console** for specific error messages
2. **Verify project ID** matches your Firebase project
3. **Check Firestore rules** - ensure read/write permissions are correct
4. **Try incognito mode** to rule out browser extensions
5. **Check network** - corporate firewalls may block Firebase

## Development vs Production

- **Development**: Uses offline persistence for better developer experience
- **Production**: Will work online with full Firestore functionality
- **Emulator**: Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` for local testing
