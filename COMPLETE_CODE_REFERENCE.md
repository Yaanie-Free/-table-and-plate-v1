# Complete Backend Implementation - Copy & Paste Guide

All files needed for Table & Plate backend. Create each file in your codespace.

## Directory Structure to Create

```bash
mkdir -p src/app/api/auth/{login,verify-otp,logout}
mkdir -p src/app/api/db/{users,chefs,bookings}
mkdir -p src/lib/{firebase,supabase}
mkdir -p src/{types,middleware,utils}
mkdir -p scripts
```

## Dependencies to Install

```bash
npm install firebase firebase-admin @supabase/auth-helpers-nextjs @supabase/supabase-js dotenv
```

---

# FIREBASE FILES

## src/lib/firebase/config.ts
```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export default app;
```

## src/lib/firebase/admin.ts
```typescript
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const adminAuth = admin.auth();
export default admin;
```

## src/lib/firebase/auth.ts
```typescript
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

export const initializeRecaptcha = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => console.log('reCAPTCHA verified'),
    'expired-callback': () => console.error('reCAPTCHA expired'),
  });
};

export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<User> => {
  const result = await confirmationResult.confirm(code);
  return result.user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => auth.currentUser;

export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
};
```

## src/lib/firebase/index.ts
```typescript
export * from './config';
export * from './auth';
export { adminAuth } from './admin';
```

---

# SUPABASE FILES

## src/lib/supabase/client.ts
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

export const createClient = () => createClientComponentClient<Database>();
export const supabase = createClient();
```

## src/lib/supabase/server.ts
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export const createServerClient = () => createRouteHandlerClient<Database>({ cookies });
```

## src/lib/supabase/index.ts
```typescript
export * from './client';
export * from './server';
```

---

/**
 * Database Type Definitions
 * Auto-generated types for Supabase database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          firebase_uid: string;
          phone_number: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: 'customer' | 'chef' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          firebase_uid: string;
          phone_number: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'chef' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firebase_uid?: string;
          phone_number?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'chef' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      chefs: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          specialties: string[];
          experience_years: number;
          hourly_rate: number;
          rating: number;
          total_bookings: number;
          is_verified: boolean;
          is_available: boolean;
          location: string | null;
          portfolio_images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          specialties?: string[];
          experience_years?: number;
          hourly_rate?: number;
          rating?: number;
          total_bookings?: number;
          is_verified?: boolean;
          is_available?: boolean;
          location?: string | null;
          portfolio_images?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          specialties?: string[];
          experience_years?: number;
          hourly_rate?: number;
          rating?: number;
          total_bookings?: number;
          is_verified?: boolean;
          is_available?: boolean;
          location?: string | null;
          portfolio_images?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          chef_id: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_amount: number;
          special_requests: string | null;
          cuisine_type: string | null;
          number_of_guests: number;
          location: string;
          payment_status: 'pending' | 'paid' | 'refunded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          chef_id: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_amount: number;
          special_requests?: string | null;
          cuisine_type?: string | null;
          number_of_guests: number;
          location: string;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          chef_id?: string;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_amount?: number;
          special_requests?: string | null;
          cuisine_type?: string | null;
          number_of_guests?: number;
          location?: string;
          payment_status?: 'pending' | 'paid' | 'refunded';
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          chef_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          chef_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          customer_id?: string;
          chef_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'customer' | 'chef' | 'admin';
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      payment_status: 'pending' | 'paid' | 'refunded';
    };
  };
}
