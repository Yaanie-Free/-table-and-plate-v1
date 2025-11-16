/**
 * API Route: POST /api/auth/verify-otp
 * Verify Firebase ID token and create/update user in Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, phone_number } = decodedToken;

    if (!phone_number) {
      return NextResponse.json(
        { error: 'Phone number not found in token' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerClient();

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', uid)
      .single();

    let user;

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('firebase_uid', uid)
        .select()
        .single();

      if (error) throw error;
      user = data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          firebase_uid: uid,
          phone_number: phone_number,
          role: 'customer',
        })
        .select()
        .single();

      if (error) throw error;
      user = data;
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Authentication successful',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 401 }
    );
  }
}
