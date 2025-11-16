# ChefConnect Backend Setup Guide

This guide will help you set up the backend for ChefConnect with Firebase OTP authentication and Supabase database.

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier)
- Supabase account (free tier)
- A code editor (VS Code recommended)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: "ChefConnect" (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Phone** provider
3. Toggle to **Enable**
4. Click **Save**

### Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to **Your apps**
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "ChefConnect Web")
5. Copy the `firebaseConfig` object values

### Get Firebase Admin SDK Credentials

1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Open the file and copy:
   - `project_id`
   - `client_email`
   - `private_key`

### Update Environment Variables

Update your `.env.local` file with Firebase credentials:

```env
# Firebase Configuration (from Firebase Config)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (from Service Account JSON)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

**Important:** Keep the private key in quotes and preserve the `\n` characters.

## Step 3: Supabase Setup

### Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter project details:
   - Name: ChefConnect
   - Database Password: (create a strong password)
   - Region: (select closest to you)
4. Click "Create new project"

### Set Up Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy the entire contents of `src/lib/supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** to execute the schema

This will create:
- `users` table
- `chefs` table
- `bookings` table
- `reviews` table
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic updates

### Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys** → `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

### Update Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 4: Environment Files

### Development Environment

Use `.env.local` for local development (already configured).

### Test Environment

Copy `.env.test` and fill in test credentials:

```bash
cp .env.test .env.test.local
```

### Production Environment

Update `.env.production` with production credentials:

```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

**Important:** Never commit `.env.local`, `.env.test.local`, or `.env.production.local` to Git!

## Step 5: Test the Setup

### Start Development Server

```bash
npm run dev
```

The server should start at `http://localhost:3000`

### Test Firebase Authentication

Create a test file to verify Firebase is working:

```bash
# The client-side auth will be tested when you build the frontend
```

### Test Supabase Connection

You can test the database connection by:

1. Go to Supabase Dashboard → **Table Editor**
2. You should see all 4 tables created
3. Try inserting a test user manually

## API Endpoints

### Authentication

- `POST /api/auth/login` - Initiate OTP login
- `POST /api/auth/verify-otp` - Verify OTP and create/update user
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/db/users` - Get user profile
- `PUT /api/db/users` - Update user profile
- `DELETE /api/db/users` - Delete user account

### Chefs

- `GET /api/db/chefs` - Get chef profiles (all or filtered)
- `POST /api/db/chefs` - Create chef profile
- `PUT /api/db/chefs` - Update chef profile
- `DELETE /api/db/chefs` - Delete chef profile

### Bookings

- `GET /api/db/bookings` - Get bookings
- `POST /api/db/bookings` - Create booking
- `PUT /api/db/bookings` - Update booking status
- `DELETE /api/db/bookings` - Cancel booking

## Authentication Flow

1. User enters phone number
2. Frontend calls Firebase to send OTP
3. User enters OTP code
4. Frontend verifies OTP with Firebase
5. Frontend gets Firebase ID token
6. Frontend sends token to `/api/auth/verify-otp`
7. Backend verifies token and creates/updates user in Supabase
8. User is authenticated

## Making Authenticated Requests

All API requests (except auth) require a Firebase ID token in the Authorization header:

```javascript
const idToken = await firebase.auth().currentUser.getIdToken();

const response = await fetch('/api/db/users', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json',
  },
});
```

## Security Notes

1. **Never expose service role keys** - Keep them server-side only
2. **Firebase Admin SDK** - Private key should be in environment variables
3. **RLS Policies** - Already enabled in Supabase for all tables
4. **HTTPS only** - Use HTTPS in production
5. **Rate limiting** - Consider adding rate limiting for authentication endpoints

## Troubleshooting

### Firebase Issues

- **"Invalid API key"**: Check your Firebase API key in `.env.local`
- **"Project not found"**: Verify project ID matches Firebase console
- **"Private key error"**: Ensure private key is properly escaped with `\n`

### Supabase Issues

- **"Invalid API key"**: Check your Supabase anon key
- **"No rows returned"**: Check RLS policies are correctly set
- **"Connection error"**: Verify Supabase URL is correct

### General Issues

- **"Module not found"**: Run `npm install` again
- **"Port already in use"**: Kill the process using port 3000 or change port
- **TypeScript errors**: Run `npm run type-check`

## Next Steps

1. Build frontend components for authentication
2. Create chef profile pages
3. Implement booking flow
4. Add payment integration with Stripe
5. Deploy to production (Vercel recommended for Next.js)

## Production Deployment

### Environment Variables

Set these in your hosting platform (Vercel, Netlify, etc.):

- All variables from `.env.production`
- Never commit production secrets to Git

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Database Migrations

For production database changes:

1. Test migrations in `.env.test` first
2. Backup production database
3. Apply migrations carefully
4. Monitor for errors

## Support

For issues or questions:
- Firebase: [Firebase Documentation](https://firebase.google.com/docs)
- Supabase: [Supabase Documentation](https://supabase.com/docs)
- Next.js: [Next.js Documentation](https://nextjs.org/docs)
