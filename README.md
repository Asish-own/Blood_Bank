# LifeLink AI - Blood Donation & Emergency Healthcare Platform

A smart, real-time emergency coordination system connecting blood donors, patients, hospitals, blood banks, ambulance staff, and doctors with AI-driven decision support.

## 🚀 Features

### User Roles
- **Blood Donor**: Register, book donation slots, earn rewards, view history
- **Patient/Emergency User**: SOS button, live ambulance tracking, AI hospital selection
- **Ambulance Staff**: Receive SOS alerts, live navigation, status updates
- **Hospital/Blood Bank**: Manage blood stock, ICU beds, accept emergencies
- **Doctor**: Manage appointments, schedule slots

### AI Features (Powered by Gemini)
1. **Predictive Blood Demand Model**: Forecasts city-level blood type demand
2. **Golden Hour Survival Score (GHS)**: Calculates survival probability
3. **Emergency Routing AI**: Selects best hospital based on multiple factors
4. **AI Chatbot**: Provides guidance on blood donation, FAQs, emergency instructions
5. **Accident Severity Estimation**: Analyzes images to estimate trauma severity
6. **Blood Compatibility Check**: Validates donor-recipient compatibility

### Real-time Features
- Live ambulance tracking with Google Maps
- Real-time SOS alerts
- WebSocket/Firebase RTDB updates
- Live dashboard updates

## 🛠 Technology Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Firebase Cloud Functions, Next.js API Routes
- **Database**: Firestore, Firebase Realtime Database
- **Authentication**: Firebase Auth (Email/Password + Google)
- **Maps**: Google Maps JavaScript API
- **AI**: Google Gemini API
- **State Management**: Zustand

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Blood_Bank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Firebase and API keys:
   - Firebase configuration (from Firebase Console)
   - Google Maps API key
   - Gemini API key

4. **Set up Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

5. **Deploy Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google)
3. Create Firestore database
4. Enable Realtime Database
5. Copy your Firebase config to `.env.local`

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API
3. Create API key and restrict it to your domain
4. Add to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env.local` as `GEMINI_API_KEY`

## 📁 Project Structure

```
Blood_Bank/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── donor/             # Donor dashboard
│   ├── patient/           # Patient dashboard
│   ├── ambulance/         # Ambulance dashboard
│   ├── hospital/          # Hospital dashboard
│   └── doctor/            # Doctor dashboard
├── components/            # React components
│   ├── ui/                # Shadcn UI components
│   ├── donor/             # Donor-specific components
│   ├── patient/           # Patient-specific components
│   ├── ambulance/         # Ambulance-specific components
│   ├── hospital/          # Hospital-specific components
│   ├── doctor/            # Doctor-specific components
│   └── ai/                # AI components (chatbot)
├── lib/                   # Utilities and services
│   ├── firebase/          # Firebase configuration
│   ├── gemini/            # Gemini AI client
│   └── services/          # Business logic services
├── store/                 # Zustand state management
├── functions/             # Firebase Cloud Functions
├── firestore.rules        # Firestore security rules
└── firestore.indexes.json # Firestore indexes
```

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Backend (Firebase Cloud Functions)
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## 🔐 Security

- Firestore security rules are configured to protect data
- API keys should be restricted in production
- Authentication is required for all protected routes
- Role-based access control implemented

## 📝 Database Schema

### Collections
- `users`: User profiles with roles
- `hospitals`: Hospital information and blood stock
- `ambulances`: Ambulance status and location
- `SOS_cases`: Emergency cases
- `donations`: Blood donation records
- `appointments`: Doctor appointments
- `appointment_slots`: Available appointment slots

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Next.js team
- Firebase team
- Google Maps API
- Gemini AI
- Shadcn UI
