# Firebase Setup Guide for ChefConnect

## Quick Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `ChefConnect` (or any name you prefer)
4. Click **Continue**
5. **Disable Google Analytics** (optional, but simpler for now)
6. Click **Create project**
7. Wait for project creation, then click **Continue**

### 2. Enable Phone Authentication

1. In the Firebase Console, click **Authentication** in the left sidebar
   - If you don't see it, click **Build** → **Authentication**
2. Click **Get started** (if first time)
3. Go to the **Sign-in method** tab
4. Find **Phone** in the list of providers
5. Click on **Phone**
6. Toggle the switch to **Enable**
7. Click **Save**

**Important for Testing:**
- Scroll down to find **Phone numbers for testing** (optional)
- You can add test phone numbers here to avoid SMS charges during development
- Example: Add `+1 650 555 1234` with code `123456`

### 3. Get Firebase Web Configuration

1. In Firebase Console, click the **Settings gear icon** ⚙️ (top left)
2. Click **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web icon** (`</>`) to add a web app
5. Enter app nickname: `ChefConnect Web`
6. **Do NOT** check "Also set up Firebase Hosting"
7. Click **Register app**
8. You'll see a `firebaseConfig` object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "chefconnect-xxxxx.firebaseapp.com",
  projectId: "chefconnect-xxxxx",
  storageBucket: "chefconnect-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

9. **Copy these values** - you'll need them in the next step
10. Click **Continue to console**

### 4. Get Firebase Admin SDK Credentials

1. Still in **Project settings**, go to the **Service accounts** tab
2. Click **Generate new private key**
3. Click **Generate key** in the popup
4. A JSON file will download (e.g., `chefconnect-xxxxx-firebase-adminsdk-xxxxx.json`)
5. **Keep this file secure!** Don't commit it to Git

Open the downloaded JSON file. It looks like this:

```json
{
  "type": "service_account",
  "project_id": "chefconnect-xxxxx",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@chefconnect-xxxxx.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  ...
}
```

You need:
- `project_id`
- `client_email`
- `private_key`

### 5. Update Your .env.local File

Now update your `.env.local` file with all the Firebase credentials:

```bash
# From Step 3 (firebaseConfig)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chefconnect-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chefconnect-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chefconnect-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# From Step 4 (Service Account JSON)
FIREBASE_ADMIN_PROJECT_ID=chefconnect-xxxxx
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chefconnect-xxxxx.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- Keep the private key in quotes
- Preserve the `\n` characters in the private key
- Don't remove the quotes around the entire private key value

### 6. How Firebase & Supabase Work Together

Here's the flow:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Authentication Flow                  │
└─────────────────────────────────────────────────────────────┘

1. User enters phone number
   ↓
2. FIREBASE sends OTP via SMS
   ↓
3. User enters OTP code
   ↓
4. FIREBASE verifies OTP → Returns ID Token
   ↓
5. Frontend sends ID Token to /api/auth/verify-otp
   ↓
6. Backend verifies token with Firebase Admin SDK
   ↓
7. SUPABASE creates/updates user in database
   ↓
8. User is authenticated ✅

┌─────────────────────────────────────────────────────────────┐
│                   Data Storage (Supabase)                    │
└─────────────────────────────────────────────────────────────┘

- User profiles (phone, email, name, etc.)
- Chef profiles (bio, rates, specialties, etc.)
- Bookings
- Reviews

┌─────────────────────────────────────────────────────────────┐
│              Authentication (Firebase)                       │
└─────────────────────────────────────────────────────────────┘

- OTP generation and SMS sending
- Phone number verification
- User session management
- Security tokens (JWT)
```

**Key Points:**
- **Firebase** = Authentication only (handles OTP)
- **Supabase** = Database (stores all user data)
- They're linked via the `firebase_uid` field in the Supabase `users` table

### 7. Set Up Supabase Database

Your Supabase project is already created. Now run the schema:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/xvqenbovsajgpkdjhxol
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `src/lib/supabase/schema.sql` from your project
5. Paste it into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see:
```
Success. No rows returned
```

7. Click **Table Editor** to verify the tables were created:
   - users
   - chefs
   - bookings
   - reviews

### 8. Get Supabase Service Role Key

You already have the Supabase URL and anon key in your `.env.local`, but you're missing the service role key:

1. In Supabase Dashboard, click **Settings** (gear icon) → **API**
2. Scroll to **Project API keys**
3. Find **service_role** key (it's marked as secret)
4. Click **Reveal** and copy it
5. Update `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ Warning:** Never expose the service role key in client-side code!

### 9. Test Your Setup

Restart your dev server:

```bash
npm run dev
```

Check for errors in the terminal. If you see:
```
✓ Ready in X seconds
```

Then your setup is working!

### 10. Verify Firebase Connection

Create a simple test by opening your browser console and running:

```javascript
// This will be available once you build the frontend
// For now, just make sure there are no errors when starting the dev server
```

### Common Issues & Fixes

**Issue:** Firebase "Invalid API key"
- **Fix:** Double-check the API key in `.env.local` matches Firebase Console

**Issue:** Firebase Admin "Private key error"
- **Fix:** Make sure the private key is wrapped in quotes and has `\n` characters

**Issue:** Supabase "Invalid API key"
- **Fix:** Verify the anon key and service role key are correct

**Issue:** "Module not found"
- **Fix:** Run `npm install` again

**Issue:** Server won't start
- **Fix:** Check if port 3000 is already in use. Kill the process or change the port.

### Next: Build the Frontend

Once Firebase and Supabase are connected, you can:

1. Create a login page with phone input
2. Implement OTP verification UI
3. Build user profile pages
4. Create chef listing and booking pages

Would you like me to create the frontend authentication components next?
