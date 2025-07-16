# Firebase Setup Guide for EarnBuddy

## 1. Deploy Firestore Security Rules

### Option A: Using Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `earnbuddy-641b3`
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy the contents of `firestore.rules` file from this project
6. Paste it into the rules editor, replacing the existing rules
7. Click **Publish** to deploy the rules

### Option B: Using Firebase CLI (Advanced)
If you have Firebase CLI installed:
```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## 2. Verify Rules Are Working

After deploying the rules, test them by:

1. **Sign in to your app** - Make sure authentication is working
2. **Try creating a post** - This should work for authenticated users
3. **Try accessing data while signed out** - This should be blocked
4. **Check the browser console** - Look for any permission errors

## 3. Security Rules Explanation

The rules we've set up provide:

### ✅ **Allowed Operations:**
- **Authenticated users** can read and write most data
- **Users** can only modify their own profiles
- **Pod/Room creators** can manage their own pods/rooms
- **Anyone** can join pods or apply to startups/gigs
- **Post authors** can edit their own posts
- **Others** can like, reply, or bookmark posts

### ❌ **Blocked Operations:**
- **Unauthenticated users** cannot access any data
- **Users** cannot modify other users' profiles
- **Users** cannot delete others' content
- **Malicious updates** are prevented by field-level restrictions

## 4. Common Issues & Solutions

### Issue: "Missing or insufficient permissions"
**Solution:** Make sure you're signed in and the rules are properly deployed.

### Issue: "Rules are too permissive"
**Solution:** The current rules are designed for development. For production, consider more restrictive rules.

### Issue: "Can't create documents"
**Solution:** Ensure the user is authenticated and the document structure matches the rules.

## 5. Production Considerations

For production deployment, consider:

1. **More restrictive rules** for sensitive operations
2. **Rate limiting** to prevent abuse
3. **Data validation** rules for required fields
4. **Audit logging** for important operations
5. **Regular security reviews** of the rules

## 6. Testing Your Rules

You can test your rules in the Firebase Console:
1. Go to **Firestore Database > Rules**
2. Click on **Rules playground**
3. Test different scenarios with authenticated/unauthenticated users

## 7. Environment Variables Check

Make sure these environment variables are set in your deployment:

```env
VITE_FIREBASE_API_KEY=AIzaSyDoEPIqS_9wXRnWUWP-wTR_BqWBjqFCXVs
VITE_FIREBASE_AUTH_DOMAIN=earnbuddy-641b3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=earnbuddy-641b3
VITE_FIREBASE_STORAGE_BUCKET=earnbuddy-641b3.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=679982634262
VITE_FIREBASE_APP_ID=1:679982634262:web:ef471fa3e4f99008216c37
```

## 8. Next Steps

After setting up the rules:
1. Test all major features (sign up, create posts, join pods, etc.)
2. Monitor the Firebase Console for any rule violations
3. Adjust rules as needed based on your app's behavior
4. Consider setting up Firebase Analytics for usage tracking

---

**Need Help?** 
- Check the [Firebase Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- Review the [Security Rules Reference](https://firebase.google.com/docs/reference/security/database)