# Deployment Guide - LifeLink AI

This guide will walk you through deploying LifeLink AI to production.

## Prerequisites

- Node.js 18+ installed
- Firebase account
- Google Cloud account
- Vercel account (for frontend)
- Google Maps API key
- Gemini API key

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `lifelink-ai`
4. Enable Google Analytics (optional)
5. Create project

### 1.2 Enable Authentication

1. Go to Authentication > Sign-in method
2. Enable "Email/Password"
3. Enable "Google" provider
   - Add authorized domains
   - Configure OAuth consent screen

### 1.3 Create Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Start in production mode
4. Choose location (closest to your users)

### 1.4 Enable Realtime Database

1. Go to Realtime Database
2. Click "Create database"
3. Choose location
4. Start in test mode (we'll secure it later)

### 1.5 Get Firebase Config

1. Go to Project Settings > General
2. Scroll to "Your apps"
3. Click Web icon (`</>`)
4. Register app
5. Copy the config object

## Step 2: Google Cloud Setup

### 2.1 Enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to APIs & Services > Library
4. Enable:
   - Maps JavaScript API
   - Directions API
   - Geocoding API

### 2.2 Create API Keys

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "API Key"
3. Restrict the key:
   - Application restrictions: HTTP referrers
   - Add your domain: `*.vercel.app`, `yourdomain.com`
   - API restrictions: Select "Maps JavaScript API", "Directions API", "Geocoding API"

### 2.3 Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Copy the key

## Step 3: Environment Variables

Create `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

## Step 4: Deploy Firestore Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Step 5: Deploy Cloud Functions

```bash
cd functions
npm install
cd ..

# Deploy functions
firebase deploy --only functions
```

## Step 6: Deploy Frontend to Vercel

### 6.1 Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... add all environment variables
```

### 6.2 Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables:
   - Go to Settings > Environment Variables
   - Add all variables from `.env.local`
6. Deploy

## Step 7: Configure Firebase Hosting (Alternative)

If you prefer Firebase Hosting:

```bash
# Build Next.js
npm run build

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## Step 8: Post-Deployment

### 8.1 Update Authorized Domains

1. Go to Firebase Console > Authentication > Settings
2. Add your production domain to authorized domains

### 8.2 Update API Key Restrictions

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Update API key restrictions with production domain

### 8.3 Seed Initial Data

Create a script to seed initial data:

```javascript
// scripts/seed.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Add sample hospitals
async function seedHospitals() {
  const hospitals = [
    {
      name: 'City General Hospital',
      coords: { lat: 28.6139, lng: 77.2090 },
      address: '123 Main St, City',
      bloodStock: { 'A+': 50, 'A-': 20, 'B+': 50, 'B-': 20, 'AB+': 10, 'AB-': 5, 'O+': 100, 'O-': 40 },
      icuBeds: 10,
      otAvailability: true,
      specialization: ['General', 'Emergency'],
    },
    // Add more hospitals...
  ];

  for (const hospital of hospitals) {
    await db.collection('hospitals').add(hospital);
  }
}

// Add sample ambulances
async function seedAmbulances() {
  const ambulances = [
    {
      driverName: 'John Doe',
      status: 'available',
      coords: { lat: 28.6139, lng: 77.2090 },
      vehicleNumber: 'AMB-001',
    },
    // Add more ambulances...
  ];

  for (const ambulance of ambulances) {
    await db.collection('ambulances').add(ambulance);
  }
}

seedHospitals();
seedAmbulances();
```

## Step 9: Monitoring

### 9.1 Firebase Analytics

Enable Firebase Analytics in your app.

### 9.2 Error Monitoring

Set up error monitoring with:
- Sentry
- Firebase Crashlytics
- Vercel Analytics

### 9.3 Performance Monitoring

- Firebase Performance Monitoring
- Vercel Analytics
- Google Analytics

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check API key restrictions
   - Verify authorized domains in Firebase

2. **Maps Not Loading**
   - Verify API key is correct
   - Check API restrictions
   - Ensure billing is enabled

3. **Authentication Errors**
   - Check authorized domains
   - Verify OAuth configuration

4. **Cloud Functions Not Working**
   - Check function logs: `firebase functions:log`
   - Verify environment variables
   - Check billing status

## Security Checklist

- [ ] Firestore rules deployed
- [ ] API keys restricted
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Authentication required for protected routes

## Cost Optimization

- Enable Firestore indexes only for queries you use
- Use Firestore on-demand pricing plan
- Optimize Cloud Functions execution time
- Cache API responses where possible
- Use CDN for static assets

## Support

For issues:
1. Check Firebase Console logs
2. Check Vercel deployment logs
3. Review Cloud Functions logs
4. Open GitHub issue
