/**
 * API Route: POST /api/auth/logout
 * Logout user and clear session
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Firebase logout is handled on the client side
    // This endpoint can be used for server-side cleanup or logging

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
