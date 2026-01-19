import { createClient } from '@supabase/supabase-js';

// Supabase client for browser (client-side)
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Supabase client for server (server-side with service role)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ==========================================
// STORAGE HELPERS
// ==========================================

const BUCKET_NAME = 'campaign-media';

/**
 * Upload de mídia para o Supabase Storage
 */
export async function uploadMedia(
  file: File,
  userId: string,
  type: 'image' | 'video'
): Promise<{ url: string; path: string } | null> {
  const supabase = createBrowserClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${type}s/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Remove mídia do Supabase Storage
 */
export async function deleteMedia(path: string): Promise<boolean> {
  const supabase = createServerClient();
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    return false;
  }

  return true;
}

/**
 * Lista mídias do usuário
 */
export async function listUserMedia(
  userId: string,
  type?: 'image' | 'video'
): Promise<Array<{ name: string; url: string; createdAt: string }>> {
  const supabase = createBrowserClient();
  
  const folder = type ? `${userId}/${type}s` : userId;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folder, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error || !data) {
    console.error('Error listing files:', error);
    return [];
  }

  return data.map((file) => {
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${folder}/${file.name}`);
    
    return {
      name: file.name,
      url: urlData.publicUrl,
      createdAt: file.created_at,
    };
  });
}

// ==========================================
// TYPES
// ==========================================

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string | null;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          name?: string | null;
          image?: string | null;
        };
        Update: {
          email?: string;
          password?: string;
          name?: string | null;
          image?: string | null;
        };
      };
      campaigns: {
        Row: {
          id: string;
          meta_id: string;
          user_id: string;
          name: string;
          objective: string;
          status: string;
          daily_budget: number | null;
          lifetime_budget: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      // ... outros tipos podem ser adicionados conforme necessário
    };
  };
};
