import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function generateMetadata() {
  const { data } = await getSupabase().from('og_images').select('url').eq('key', 'pagamento').single();
  const ogImage = data?.url || '/money.jpeg';
  return {
    title: 'Pagamento · Journey',
    openGraph: {
      title: 'Journey · Reserva de Vaga',
      description: 'Confirme sua vaga e escolha sua forma de pagamento.',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Journey · Reserva de Vaga',
      images: [ogImage],
    },
  };
}

export default function PagamentoLayout({ children }) {
  return children;
}
