import { DataService } from './types';
import { mockService } from './mockService';
import { createSupabaseService } from './supabaseService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let activeService: DataService;

if (supabaseUrl && supabaseKey && supabaseUrl.trim() !== '' && supabaseKey.trim() !== '') {
  try {
    activeService = createSupabaseService(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('Could not initialize Supabase, falling back to mockService:', err);
    activeService = mockService;
  }
} else {
  // Demo Mode in memory & localStorage
  activeService = mockService;
}

export const dataService = activeService;
