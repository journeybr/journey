import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data } = await getSupabase().from('events').select('image_url').eq('id', id).single();
  return {
    openGraph: {
      ...(data?.image_url ? { images: [data.image_url] } : {}),
    },
  };
}

export default function Layout({ children }) {
  return children;
}
