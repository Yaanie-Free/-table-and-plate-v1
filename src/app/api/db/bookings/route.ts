/**
 * API Route: /api/db/bookings
 * CRUD operations for bookings
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

// GET: Fetch bookings
export async function GET(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    const status = searchParams.get('status');

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('firebase_uid', decodedToken.uid)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (bookingId) {
      // Fetch specific booking
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id (id, full_name, phone_number, email),
          chef:chef_id (
            *,
            user:user_id (id, full_name, phone_number, email)
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return NextResponse.json({ booking: data });
    } else {
      // Fetch all bookings for current user
      let query = supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id (id, full_name, phone_number, email),
          chef:chef_id (
            *,
            user:user_id (id, full_name, phone_number, email)
          )
        `)
        .order('booking_date', { ascending: false });

      // Filter based on user role
      if (user.role === 'chef') {
        const { data: chefProfile } = await supabase
          .from('chefs')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (chefProfile) {
          query = query.eq('chef_id', chefProfile.id);
        }
      } else {
        query = query.eq('customer_id', user.id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return NextResponse.json({ bookings: data });
    }
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Create booking
export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();
    const body = await request.json();

    // Get customer user_id
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
      chef_id,
      booking_date,
      start_time,
      end_time,
      total_amount,
      special_requests,
      cuisine_type,
      number_of_guests,
      location,
    } = body;

    // Validate required fields
    if (!chef_id || !booking_date || !start_time || !end_time || !total_amount || !number_of_guests || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if chef is available
    const { data: chef, error: chefError } = await supabase
      .from('chefs')
      .select('is_available')
      .eq('id', chef_id)
      .single();

    if (chefError || !chef) {
      return NextResponse.json(
        { error: 'Chef not found' },
        { status: 404 }
      );
    }

    if (!chef.is_available) {
      return NextResponse.json(
        { error: 'Chef is not available' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        chef_id,
        booking_date,
        start_time,
        end_time,
        total_amount,
        special_requests,
        cuisine_type,
        number_of_guests,
        location,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      booking: data,
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT: Update booking
export async function PUT(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();
    const body = await request.json();
    const { booking_id, status, payment_status } = body;

    if (!booking_id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('firebase_uid', decodedToken.uid)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch booking to verify ownership
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, chef:chef_id(user_id)')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to update
    const isCustomer = booking.customer_id === user.id;
    const isChef = booking.chef?.user_id === user.id;

    if (!isCustomer && !isChef) {
      return NextResponse.json(
        { error: 'Unauthorized to update this booking' },
        { status: 403 }
      );
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', booking_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      booking: data,
      message: 'Booking updated successfully',
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE: Cancel/Delete booking
export async function DELETE(request: NextRequest) {
  try {
    const decodedToken = await verifyAuth(request);
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get current user
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

    // Update status to cancelled instead of deleting
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      booking: data,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
