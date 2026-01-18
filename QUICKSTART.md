# Quick Start Guide - LifeLink AI

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Firebase account (free tier works)
- Google Cloud account (for Maps & Gemini APIs)

## Step 1: Clone & Install

```bash
# Install dependencies
npm install
```

## Step 2: Firebase Setup (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: "lifelink-ai"
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google" (optional)
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in test mode
   - Choose location
5. Get your config:
   - Project Settings > General
   - Scroll to "Your apps"
   - Click Web icon
   - Copy config values

## Step 3: API Keys (3 minutes)

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Enable "Maps JavaScript API"
4. Create API key (Credentials > Create Credentials)
5. Copy the key

### Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Copy the key

## Step 4: Environment Variables

Create `.env.local` file in root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCT0OEduTXG1Eukmtr2BzX3OMXV8Hmr_eQ
GEMINI_API_KEY=your_gemini_key
```

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Create Test Data

### Option 1: Manual (Firebase Console)
1. Go to Firestore Database
2. Create collections:
   - `hospitals` - Add a hospital document
   - `ambulances` - Add an ambulance document
   - `users` - Will be created automatically on signup

### Option 2: Seed Script (Coming soon)
```bash
npm run seed
```

## Step 7: Test the App

1. **Sign Up** as a Patient
   - Go to `/auth/signup?role=patient`
   - Create account
   - You'll be redirected to patient dashboard

2. **Test SOS Button**
   - Click "ACTIVATE SOS"
   - Allow location access
   - See emergency case created

3. **Sign Up as Donor**
   - Create account with role "donor"
   - Book a donation slot
   - View history

4. **Test AI Chatbot**
   - Go to `/chatbot`
   - Ask questions about blood donation

## Common Issues

### "Firebase not initialized"
- Check `.env.local` file exists
- Verify all Firebase config values are correct
- Restart dev server

### "Maps not loading"
- Verify Google Maps API key
- Check API is enabled in Google Cloud Console
- Ensure billing is enabled (free tier works)

### "Authentication error"
- Check Firebase Auth is enabled
- Verify authorized domains in Firebase Console

### "Gemini API error"
- Verify API key is correct
- Check API quota/billing

## Next Steps

1. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Cloud Functions** (optional)
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

3. **Deploy to Vercel**
   - Push to GitHub
   - Import to Vercel
   - Add environment variables
   - Deploy!

## Need Help?

- Check `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for production deployment
- Check `PROJECT_SUMMARY.md` for feature overview

---

**Happy coding! 🚀**
