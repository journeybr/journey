import { createClient } from '@supabase/supabase-js'

// Fallbacks de placeholder para o Next.js não quebrar durante a fase de compilação (build-time) caso as variáveis ainda não estejam injetadas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
