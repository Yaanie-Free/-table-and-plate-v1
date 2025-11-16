/**
 * Supabase Server Client Configuration
 * Used for server-side operations (API routes, Server Components)
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

export const createServerClient = () => {
  return createRouteHandlerClient<Database>({ cookies });
};
