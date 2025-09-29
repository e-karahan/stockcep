import { createClient } from '@supabase/supabase-js'

// .env dosyasındaki değişkenleri buraya çekiyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// supabase client'ını oluşturup dışarıya açıyoruz
export const supabase = createClient(supabaseUrl, supabaseAnonKey)