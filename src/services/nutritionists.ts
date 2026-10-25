import { supabase } from '../lib/supabase';
import type { Nutritionist } from '../types';

export const DEMO_NUTRITIONIST_ID = '00000000-0000-0000-0000-000000000001';

export async function getNutritionist(id: string = DEMO_NUTRITIONIST_ID): Promise<Nutritionist> {
  const { data, error } = await supabase
    .from('nutritionists')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Nutritionist;
}
