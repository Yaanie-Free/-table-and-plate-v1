/**
 * API Route: /api/db/users
 * CRUD operations for users
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { adminAuth } from '@/lib/firebase/admin';

// Helper function to verify Firebase token from request
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  return decodedToken;
}

// GET: Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (userId) {
      // Fetch specific user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return NextResponse.json({ user: data });
    } else {
      // Fetch current user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', decodedToken.uid)
        .single();

      if (error) throw error;
      return NextResponse.json({ user: data });
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT: Update user profile
export async function PUT(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();
    const body = await request.json();

    const { full_name, email, avatar_url } = body;

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name,
        email,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('firebase_uid', decodedToken.uid)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: data,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('firebase_uid', decodedToken.uid);

    if (error) throw error;

    // Also delete from Firebase
    await adminAuth.deleteUser(decodedToken.uid);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
