/**
 * API Route: /api/db/chefs
 * CRUD operations for chef profiles
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

// GET: Fetch chef profiles (all or specific)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const chefId = searchParams.get('id');
    const available = searchParams.get('available');
    const specialty = searchParams.get('specialty');

    if (chefId) {
      // Fetch specific chef with user details
      const { data, error } = await supabase
        .from('chefs')
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url,
            phone_number,
            email
          )
        `)
        .eq('id', chefId)
        .single();

      if (error) throw error;
      return NextResponse.json({ chef: data });
    } else {
      // Fetch all chefs with filters
      let query = supabase
        .from('chefs')
        .select(`
          *,
          users:user_id (
            id,
            full_name,
            avatar_url,
            phone_number,
            email
          )
        `)
        .order('rating', { ascending: false });

      if (available === 'true') {
        query = query.eq('is_available', true);
      }

      if (specialty) {
        query = query.contains('specialties', [specialty]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return NextResponse.json({ chefs: data });
    }
  } catch (error) {
    console.error('Get chefs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chefs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Create chef profile
export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();
    const body = await request.json();

    // Get user_id from firebase_uid
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', decodedToken.uid)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const {
      bio,
      specialties = [],
      experience_years = 0,
      hourly_rate,
      location,
      portfolio_images = [],
    } = body;

    const { data, error } = await supabase
      .from('chefs')
      .insert({
        user_id: user.id,
        bio,
        specialties,
        experience_years,
        hourly_rate,
        location,
        portfolio_images,
      })
      .select()
      .single();

    if (error) throw error;

    // Update user role to chef
    await supabase
      .from('users')
      .update({ role: 'chef' })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      chef: data,
      message: 'Chef profile created successfully',
    });
  } catch (error) {
    console.error('Create chef error:', error);
    return NextResponse.json(
      { error: 'Failed to create chef profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT: Update chef profile
export async function PUT(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();
    const body = await request.json();

    // Get user_id from firebase_uid
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', decodedToken.uid)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const {
      bio,
      specialties,
      experience_years,
      hourly_rate,
      is_available,
      location,
      portfolio_images,
    } = body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (bio !== undefined) updateData.bio = bio;
    if (specialties !== undefined) updateData.specialties = specialties;
    if (experience_years !== undefined) updateData.experience_years = experience_years;
    if (hourly_rate !== undefined) updateData.hourly_rate = hourly_rate;
    if (is_available !== undefined) updateData.is_available = is_available;
    if (location !== undefined) updateData.location = location;
    if (portfolio_images !== undefined) updateData.portfolio_images = portfolio_images;

    const { data, error } = await supabase
      .from('chefs')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      chef: data,
      message: 'Chef profile updated successfully',
    });
  } catch (error) {
    console.error('Update chef error:', error);
    return NextResponse.json(
      { error: 'Failed to update chef profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete chef profile
export async function DELETE(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();

    // Get user_id from firebase_uid
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', decodedToken.uid)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('chefs')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    // Update user role back to customer
    await supabase
      .from('users')
      .update({ role: 'customer' })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Chef profile deleted successfully',
    });
  } catch (error) {
    console.error('Delete chef error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chef profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
