# EarnBuddy - Build. Collaborate. Earn.

A platform for builders, creators, and visionaries to collaborate and build amazing projects together.

## 🚀 Quick Start

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Go to Project Settings > General > Your apps
   - Add a web app and copy the config values
   - Create a `.env` file in the root directory:

   ```env
   VITE_FIREBASE_API_KEY=AIzaSyDoEPIqS_9wXRnWUWP-wTR_BqWBjqFCXVs
   VITE_FIREBASE_AUTH_DOMAIN=earnbuddy-641b3.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=earnbuddy-641b3
   VITE_FIREBASE_STORAGE_BUCKET=earnbuddy-641b3.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=679982634262
   VITE_FIREBASE_APP_ID=1:679982634262:web:ef471fa3e4f99008216c37
   ```

4. Enable Firebase services:
   - Go to Authentication > Sign-in method
   - Enable Google sign-in
   - Add your domain to Authorized domains
   - Enable Firestore Database

5. Start the development server:
   ```bash
   npm run dev
   ```

### 🌐 Netlify Deployment

To deploy to Netlify with Firebase authentication:

1. **Add Environment Variables in Netlify:**
   - Go to your Netlify site dashboard
   - Navigate to Site Settings > Environment Variables
   - Add the following variables:

   ```
   VITE_FIREBASE_API_KEY = AIzaSyDoEPIqS_9wXRnWUWP-wTR_BqWBjqFCXVs
   VITE_FIREBASE_AUTH_DOMAIN = earnbuddy-641b3.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = earnbuddy-641b3
   VITE_FIREBASE_STORAGE_BUCKET = earnbuddy-641b3.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID = 679982634262
   VITE_FIREBASE_APP_ID = 1:679982634262:web:ef471fa3e4f99008216c37
   ```

2. **Configure Firebase for your domain:**
   - Go to Firebase Console > Authentication > Settings
   - In the "Authorized domains" section, add:
     - `spontaneous-scone-336c90.netlify.app` (your current domain)
     - Any custom domain you plan to use

3. **Redeploy your site:**
   - Trigger a new deployment in Netlify
   - The environment variables will be available during build

### 🔧 Firebase Setup Checklist

- [ ] Firebase project created
- [ ] Web app added to Firebase project
- [ ] Environment variables added to Netlify
- [ ] Google Authentication enabled in Firebase
- [ ] Netlify domain added to Firebase Authorized domains
- [ ] Firestore Database enabled

### 📱 Features

- **Discover**: Find opportunities and trending projects
- **Freelance**: Connect with clients and manage projects
- **Startups**: Join innovative startups or list your own
- **Community**: Engage with builder communities and pods

### 🛠️ Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Firebase for authentication and database
- Netlify for deployment

### 🔐 Authentication

The app supports:
- Google OAuth sign-in
- Email/password authentication
- Protected routes for authenticated users
- User profile management

### 🎨 Design System

- Modern glassmorphism design
- Dark/light theme support
- Responsive design for all devices
- Smooth animations and micro-interactions
- Accessible UI components

## 📄 License

This project is licensed under the MIT License.