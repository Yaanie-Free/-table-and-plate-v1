# Complete Backend Files for Table & Plate

Copy each file below into your codespace at `/workspaces/-table-and-plate-v1`

---

## File: src/lib/firebase/config.ts

```typescript
/**
 * Firebase Client Configuration
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

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

---

## File: src/lib/firebase/admin.ts

```typescript
/**
 * Firebase Admin SDK Configuration
 */
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
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const adminAuth = admin.auth();
export default admin;
```

---

## File: src/lib/firebase/auth.ts

```typescript
/**
 * Firebase OTP Authentication Utilities
 */
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
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.error('reCAPTCHA expired');
    },
  });
  return recaptchaVerifier;
};

export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    console.log('OTP sent successfully');
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<User> => {
  try {
    const result = await confirmationResult.confirm(code);
    console.log('OTP verified successfully');
    return result.user;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};
```


## File: src/lib/firebase/index.ts

```typescript
export * from './config';
export * from './auth';
export { adminAuth } from './admin';
```

---

## File: src/lib/supabase/client.ts

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

export const createClient = () => {
  return createClientComponentClient<Database>();
};

export const supabase = createClient();
```

---

## File: src/lib/supabase/server.ts

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export const createServerClient = () => {
  return createRouteHandlerClient<Database>({ cookies });
};
```

---

## File: src/lib/supabase/index.ts

```typescript
export * from './client';
export * from './server';
```

---

