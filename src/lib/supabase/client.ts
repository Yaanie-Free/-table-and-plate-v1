/**
 * Supabase Client Configuration
 * Used for client-side database operations
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

export const createClient = () => {
  return createClientComponentClient<Database>();
};

export const supabase = createClient();
