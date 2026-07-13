import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function generateMetadata() {
  const { data } = await getSupabase().from('og_images').select('url').eq('key', 'ficha').single();
  const ogImage = data?.url || '/ficha-og.png';
  return {
    title: 'Ficha de Triagem · Journey',
    openGraph: {
      title: 'Ficha de Triagem · Journey',
      description: 'Preencha sua ficha de triagem antes da cerimônia',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Ficha de Triagem · Journey',
      images: [ogImage],
    },
  };
}

export default function FichaLayout({ children }) {
  return children;
}
