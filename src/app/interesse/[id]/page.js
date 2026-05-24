import { supabase } from '@/lib/supabase';
import InterestClient from './InterestClient';

export async function generateMetadata({ params }) {
  const { id } = await Promise.resolve(params);

  const { data: event } = await supabase
    .from('events')
    .select('name, image_url, invite_message')
    .eq('id', id)
    .single();

  const title = event?.invite_message || 'Journey | Quer participar?';

  return {
    title,
    openGraph: {
      title,
      description: 'clique aqui',
      images: event?.image_url
        ? [{ url: event.image_url, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: event?.image_url ? [event.image_url] : [],
    },
  };
}

export default function InterestPage({ params }) {
  return <InterestClient params={params} />;
}
