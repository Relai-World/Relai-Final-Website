import { supabase } from '../db';

export async function getRawPropertyData(id: string) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('_id', id)
    .single();
    
  if (error) throw error;
  return data;
}