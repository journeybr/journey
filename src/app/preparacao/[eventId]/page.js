'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function PreparacaoPage() {
  const { eventId } = useParams();
  const [state, setState] = useState('loading'); // 'loading' | 'found' | 'unavailable'
  const [event, setEvent] = useState(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!eventId) return;
    (async () => {
      const { data: ev } = await supabase
        .from('events')
        .select('id, name, date, date2, active, preparation_id')
        .eq('id', eventId)
        .single();

      if (!ev || ev.active === false || !ev.preparation_id) {
        setState('unavailable');
        return;
      }

      const { data: prep } = await supabase
        .from('preparation_texts')
        .select('content')
        .eq('id', ev.preparation_id)
        .single();

      if (!prep) { setState('unavailable'); return; }

      setEvent(ev);
      setContent(prep.content);
      setState('found');
    })();
  }, [eventId]);

  const formatDate = d => {
    if (!d) return null;
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (state === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.1em' }}>carregando…</span>
      </div>
    );
  }

  if (state === 'unavailable') {
    return (
      <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
        <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '2rem', color: '#c8c2b8', fontWeight: 400 }}>✦</div>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#aaa49c', letterSpacing: '0.08em', textAlign: 'center', maxWidth: '320px' }}>
          Este conteúdo não está disponível.
        </p>
      </div>
    );
  }

  const dateLabel = event.date2
    ? `${formatDate(event.date)} e ${formatDate(event.date2)}`
    : formatDate(event.date);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');

        * { box-sizing: border-box; }

        body { margin: 0; background: #fdfbf7; }

        .prep-content {
          font-family: 'IM Fell English', serif;
          font-size: 16px;
          line-height: 1.8;
          color: #3a3530;
        }
        .prep-content h1 {
          font-family: 'IM Fell English', serif;
          font-size: 1.5rem;
          font-weight: 400;
          color: #3a3530;
          margin: 2rem 0 0.6rem;
          line-height: 1.25;
        }
        .prep-content h2 {
          font-family: 'IM Fell English', serif;
          font-size: 1.2rem;
          font-weight: 400;
          color: #3a3530;
          margin: 2rem 0 0.5rem;
        }
        .prep-content h3 {
          font-family: 'Courier Prime', monospace;
          font-size: 13.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7a7268;
          margin: 2rem 0 0.4rem;
        }
        .prep-content p { margin: 0 0 1.4rem; }
        .prep-content ul, .prep-content ol {
          padding-left: 1.5rem;
          margin: 0 0 1rem;
        }
        .prep-content li { margin-bottom: 0.35rem; }
        .prep-content blockquote {
          border-left: 2px solid #c8c2b8;
          margin: 1.2rem 0;
          padding: 0.4rem 1.2rem;
          color: #8a7a6a;
          font-style: italic;
        }
        .prep-content hr {
          border: none;
          border-top: 0.5px solid #ddd8d0;
          margin: 2rem 0;
        }
        .prep-content strong { font-weight: 700; }
        .prep-content em { font-style: italic; }
        .prep-content u { text-decoration: underline; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fdfbf7' }}>
        {/* Cabeçalho */}
        <div style={{ borderBottom: '0.5px solid #e8e2d8', padding: '2.5rem 2rem 2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.8rem' }}>
            etapa inicial da cerimônia
          </div>
          <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: '2.4rem', fontWeight: 400, color: '#3a3530', margin: '0 0 0.5rem' }}>
            {event.name}
          </h1>
          {dateLabel && (
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#b0a898', letterSpacing: '0.08em' }}>
              {dateLabel}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
          <div
            className="prep-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Rodapé discreto */}
        <div style={{ borderTop: '0.5px solid #e8e2d8', padding: '1.5rem 2rem', textAlign: 'center' }}>
          <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '1.1rem', color: '#c8c2b8', fontStyle: 'italic' }}>
            ✦ journey
          </span>
        </div>
      </div>
    </>
  );
}
