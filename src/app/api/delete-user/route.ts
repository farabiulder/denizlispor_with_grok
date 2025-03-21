import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Check for required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables are not set');
    }

    const { userId } = await request.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Delete from all related tables
    const tables = ['user_points', 'weekly_scores', 'game_states', 'users'];
    
    for (const table of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        console.error(`Error deleting from ${table}:`, error);
      }
    }

    // Delete the user from Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      throw authError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in delete-user route:', error);
    
    // Return a more specific error message
    const errorMessage = error.message === 'Required environment variables are not set' 
      ? 'Server configuration error. Please contact administrator.'
      : error.message || 'Failed to delete user';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 