'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=IM+Fell+English:ital@0;1&family=Courier+Prime&display=swap');
`;

const s = {
  page: {
    fontFamily: "'Courier Prime', monospace",
    background: '#f7f4ee',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '2.5rem 1.2rem 4rem',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: '#fdfbf7',
    border: '0.5px solid #c8c2b8',
    borderRadius: '3px',
    padding: '2rem 1.8rem',
    boxShadow: '0 4px 20px rgba(58,53,48,0.07)',
  },
  brand: {
    fontFamily: "'IM Fell English', serif",
    fontSize: '22px',
    color: '#3a3530',
    fontWeight: 400,
    marginBottom: '2rem',
    display: 'block',
  },
  greeting: {
    fontFamily: "'IM Fell English', serif",
    fontSize: '28px',
    color: '#3a3530',
    fontWeight: 400,
    margin: '0 0 1.5rem',
    lineHeight: 1.2,
  },
  label: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: '9px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#aaa49c',
    marginBottom: '0.4rem',
    display: 'block',
  },
  dayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 0',
    fontFamily: "'Courier Prime', monospace",
    fontSize: '13px',
    color: '#3a3530',
    borderBottom: '0.5px dashed #d0cbc2',
  },
  price: {
    fontFamily: "'IM Fell English', serif",
    fontSize: '32px',
    color: '#3a3530',
    margin: '0.3rem 0 1.5rem',
  },
  note: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: '11px',
    color: '#9a9288',
    fontStyle: 'italic',
    margin: '0 0 1.5rem',
    lineHeight: 1.6,
    letterSpacing: '0.02em',
  },
  divider: {
    border: 'none',
    borderTop: '0.5px solid #d0cbc2',
    margin: '1.5rem 0',
  },
  sectionTitle: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: '10px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#7a7268',
    marginBottom: '0.8rem',
  },
  optionBtn: {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: '0.5px dashed #b8b0a4',
    borderRadius: '2px',
    cursor: 'pointer',
    fontFamily: "'Courier Prime', monospace",
    fontSize: '12px',
    letterSpacing: '0.04em',
    color: '#3a3530',
    textAlign: 'left',
    marginBottom: '0.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.15s',
  },
  optionBtnSelected: {
    background: '#faf7f0',
    border: '0.5px solid #3a3530',
  },
  infoBox: {
    background: '#f0f5f1',
    border: '0.5px solid #9dcfb4',
    borderRadius: '2px',
    padding: '1rem 1.2rem',
    fontFamily: "'Courier Prime', monospace",
    fontSize: '12px',
    color: '#3a5040',
    lineHeight: 1.7,
    margin: '1rem 0',
    letterSpacing: '0.02em',
  },
  uploadArea: {
    border: '1.5px dashed #c8c2b8',
    borderRadius: '3px',
    padding: '1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#faf7f0',
    margin: '1rem 0',
    fontFamily: "'Courier Prime', monospace",
    fontSize: '12px',
    color: '#7a7268',
    transition: 'border-color 0.15s',
    letterSpacing: '0.04em',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: '#3a3530',
    color: '#f7f4ee',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
    fontFamily: "'Courier Prime', monospace",
    fontSize: '11px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginTop: '1rem',
  },
  thankyou: {
    textAlign: 'center',
    padding: '2rem 0',
  },
};

export default function PagamentoPage({ params }) {
  const [contactId, setContactId] = useState(null);
  const [contact, setContact] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [transfersOut, setTransfersOut] = useState([]);
  const [transfersIn, setTransfersIn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [option, setOption] = useState(null);
  const [file, setFile] = useState(null);
  const [obs, setObs] = useState('');
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    Promise.resolve(params).then(resolved => {
      if (resolved?.id) setContactId(resolved.id);
    });
  }, [params]);

  useEffect(() => {
    if (!contactId) return;
    fetchData();
  }, [contactId]);

  async function fetchData() {
    const [{ data: contactData }, { data: partsData }, { data: transfersData }] = await Promise.all([
      supabase.from('contacts').select('*').eq('id', contactId).single(),
      supabase
        .from('event_participants')
        .select('*, events(*)')
        .eq('contact_id', contactId)
        .not('status', 'eq', 'desistiu'),
      supabase
        .from('payment_transfers')
        .select('*, from_contact:contacts!from_contact_id(id,name,nickname), to_contact:contacts!to_contact_id(id,name,nickname), events(id,name,date,date2,active)')
        .or(`from_contact_id.eq.${contactId},to_contact_id.eq.${contactId}`)
        .eq('cancelled', false),
    ]);

    if (!contactData) { setNotFound(true); setLoading(false); return; }
    setContact(contactData);
    const active = (partsData || []).filter(p => p.events && p.events.active !== false);
    setParticipants(active);
    const activeTransfers = (transfersData || []).filter(t => t.events?.active !== false);
    setTransfersOut(activeTransfers.filter(t => t.from_contact_id === contactId));
    setTransfersIn(activeTransfers.filter(t => t.to_contact_id === contactId));
    setLoading(false);
  }

  const reservedDays = participants.flatMap(p => {
    const days = [];
    if (p.date1_confirmed && p.events?.date)
      days.push({ date: p.events.date, event: p.events.name });
    if (p.date2_confirmed && p.events?.date2)
      days.push({ date: p.events.date2, event: p.events.name });
    return days;
  });

  const totalDays = reservedDays.length;

  const priceEvent = participants.find(p => p.events?.price_1d || p.events?.price_2d)?.events;
  const basePrice = totalDays >= 2
    ? (priceEvent?.price_2d ?? null)
    : (priceEvent?.price_1d ?? null);

  const sumOut = transfersOut.reduce((s, t) => s + Number(t.amount), 0);
  const sumIn = transfersIn.reduce((s, t) => s + Number(t.amount), 0);
  const totalDiscount = participants.reduce((s, p) => s + (p.discount || 0), 0);
  const price = basePrice != null ? (basePrice - sumOut + sumIn - totalDiscount) : (sumIn > 0 ? sumIn : null);

  const firstName = (contact?.nickname || contact?.name || '').split(' ')[0];

  async function handleSubmit() {
    let comprovanteUrl = null;
    if (option === 'upload') {
      if (!file) return;
      setUploading(true);
      const ext = file.name.split('.').pop();
      const path = `comprovantes/${contactId}-${Date.now()}.${ext}`;
      await supabase.storage.from('event-images').upload(path, file, { cacheControl: '3600', upsert: true });
      const { data: urlData } = supabase.storage.from('event-images').getPublicUrl(path);
      comprovanteUrl = urlData?.publicUrl || null;
      setUploading(false);
    }

    const logEntry = {
      at: new Date().toISOString(),
      by: firstName || 'viajante',
      msg: option === 'upload' ? 'enviou comprovante de câmbio' : 'registrou Em Espécie',
      ...(option === 'upload' && comprovanteUrl ? { url: comprovanteUrl } : {}),
    };

    const statusData = option === 'upload'
      ? { payment_status: 'conferir pagamento', ...(comprovanteUrl ? { comprovante_url: comprovanteUrl } : {}) }
      : { payment_status: 'a pagar no local', payment_method: 'Espécie' };

    const baseExt = {};
    if (obs) baseExt.payment_observation = obs;

    const transferStatusData = option === 'upload'
      ? { status: 'conferir pagamento', ...(comprovanteUrl ? { comprovante_url: comprovanteUrl } : {}) }
      : { status: 'conferir pagamento', payment_method: 'Espécie' };

    await Promise.all([
      ...participants.map(async p => {
        const withLog = { ...statusData, ...baseExt, payment_log: [...(p.payment_log || []), logEntry] };
        const { error } = await supabase.from('event_participants').update(withLog)
          .match({ event_id: p.event_id, contact_id: p.contact_id });
        if (error) {
          // payment_log column might not exist yet — fall back to status-only update
          await supabase.from('event_participants').update({ ...statusData, ...baseExt })
            .match({ event_id: p.event_id, contact_id: p.contact_id });
        }
      }),
      ...transfersIn.filter(t => t.status === 'pendente').map(async t => {
        const withLog = { ...transferStatusData, ...(obs ? { observation: t.observation ? `${t.observation} | ${obs}` : obs } : {}), log: [...(t.log || []), logEntry] };
        await supabase.from('payment_transfers').update(withLog).eq('id', t.id);
      }),
    ]);

    setDone(true);
  }

  if (loading) {
    return (
      <div style={{ ...s.page, alignItems: 'center', justifyContent: 'center' }}>
        <style>{fonts}</style>
        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.12em' }}>
          carregando...
        </span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ ...s.page, alignItems: 'center', justifyContent: 'center' }}>
        <style>{fonts}</style>
        <div style={s.card}>
          <span style={s.brand}>Journey<span style={{ color: '#4a7a5a' }}>.</span></span>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#9a9288', letterSpacing: '0.04em' }}>
            Link não encontrado. Fala com a gente!
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ ...s.page, alignItems: 'center', justifyContent: 'center' }}>
        <style>{fonts}</style>
        <div style={{ ...s.card, ...s.thankyou }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5d9470" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
          <h2 style={{ fontFamily: "'IM Fell English', serif", fontSize: '32px', fontWeight: 400, color: '#3a3530', margin: '0 0 1rem' }}>
            Obrigado!
          </h2>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#9a9288', lineHeight: 1.7, margin: 0, letterSpacing: '0.02em' }}>
            Recebemos suas informações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{fonts}</style>
      <div style={s.card}>
        <span style={s.brand}>Journey<span style={{ color: '#4a7a5a' }}>.</span></span>

        <h1 style={s.greeting}>Olá, {firstName}!</h1>

        {/* Dias reservados */}
        <span style={s.label}>Você está com vaga reservada para</span>
        {reservedDays.length === 0 ? (
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#9a9288', letterSpacing: '0.04em' }}>
            Nenhum dia confirmado encontrado.
          </p>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            {reservedDays.map((d, i) => (
              <div key={i} style={s.dayRow}>
                <span style={{ color: '#5d9470' }}>✦</span>
                <span>
                  {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {reservedDays.filter(x => x.event !== d.event).length > 0 && (
                    <span style={{ color: '#aaa49c', fontSize: '11px', marginLeft: '6px' }}>({d.event})</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Valor */}
        {price != null && (
          <>
            <span style={s.label}>Valor</span>
            <p style={s.price}>US$ {Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </>
        )}

        <p style={s.note}>
          * Caso você tenha dúvidas sobre o dia reservado ou valor, fala com a gente!
        </p>

        <hr style={s.divider} />

        {/* Opções de pagamento */}
        <p style={s.sectionTitle}>Escolha sua forma de pagamento</p>

        <button
          style={{ ...s.optionBtn, ...(option === 'cash' ? s.optionBtnSelected : {}) }}
          onClick={() => setOption('cash')}
        >
          <span style={{ fontSize: '20px' }}>💵</span>
          Em Espécie (Dólar) no dia da cerimônia
        </button>

        <button
          style={{ ...s.optionBtn, ...(option === 'upload' ? s.optionBtnSelected : {}) }}
          onClick={() => setOption('upload')}
        >
          <span style={{ fontSize: '20px' }}>📄</span>
          Upload do Comprovante de Câmbio
        </button>

        {/* Conteúdo por opção */}
        {option === 'cash' && (
          <div style={s.infoBox}>
            Lembra de levar no dia da cerimônia, por favor!<br />
            Vamos tentar te lembrar também! 🌿
          </div>
        )}

        {option === 'upload' && (
          <label style={{ display: 'block' }}>
            <div
              style={{
                ...s.uploadArea,
                borderColor: file ? '#5d9470' : '#c8c2b8',
                color: file ? '#3a5040' : '#7a7268',
              }}
            >
              {file ? (
                <>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>✓</div>
                  <div style={{ fontSize: '15px' }}>{file.name}</div>
                  <div style={{ fontSize: '12px', color: '#aaa49c', marginTop: '4px' }}>
                    Clique para trocar o arquivo
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>📎</div>
                  <div>Clique para enviar imagem ou PDF do comprovante</div>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={e => setFile(e.target.files[0] || null)}
            />
          </label>
        )}

        {option && (
          <>
            <hr style={s.divider} />
            <p style={s.sectionTitle}>Observação (opcional)</p>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Algum recado ou dúvida para a equipe?"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#faf7f0',
                border: '0.5px dashed #c8c2b8',
                borderRadius: '2px',
                fontFamily: "'Courier Prime', monospace",
                fontSize: '12px',
                color: '#3a3530',
                lineHeight: 1.6,
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: '0.5rem',
              }}
            />
            <button
              style={{
                ...s.submitBtn,
                opacity: (option === 'upload' && !file) || uploading ? 0.5 : 1,
                cursor: (option === 'upload' && !file) || uploading ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSubmit}
              disabled={(option === 'upload' && !file) || uploading}
            >
              {uploading ? 'enviando...' : 'enviar'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
