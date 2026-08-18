'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const modalLabelStyle = {
  display: 'block',
  fontFamily: "'Courier Prime', monospace",
  fontSize: '10px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#7a7268',
  marginBottom: '0.4rem',
};

const modalInputStyle = {
  width: '100%',
  padding: '8px 10px',
  background: '#faf7f0',
  border: '0.5px solid #c8c2b8',
  borderRadius: '2px',
  fontFamily: "'Courier Prime', monospace",
  fontSize: '12px',
  color: '#3a3530',
  boxSizing: 'border-box',
  outline: 'none',
};

const modalSubmitStyle = {
  fontFamily: "'Courier Prime', monospace",
  fontSize: '10px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#f7f4ee',
  background: '#3a3530',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '2px',
  cursor: 'pointer',
  flex: 1,
};

const modalCancelStyle = {
  fontFamily: "'Courier Prime', monospace",
  fontSize: '10px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#7a7268',
  background: 'transparent',
  border: '0.5px dashed #b8b0a4',
  padding: '10px 16px',
  borderRadius: '2px',
  cursor: 'pointer',
  flex: 1,
};

function TemplateLoader({ category, onLoad }) {
  const [templates, setTemplates] = useState([]);
  useEffect(() => {
    supabase.from('message_templates')
      .select('id, name, content, updated_at, created_at')
      .eq('category', category)
      .order('updated_at', { ascending: false })
      .then(({ data }) => { if (data) setTemplates(data); });
  }, [category]);
  if (templates.length === 0) return null;
  const fmtDate = d => new Date(d).toLocaleDateString('pt-BR');
  return (
    <select
      defaultValue=""
      onChange={e => {
        const t = templates.find(t => t.id === e.target.value);
        if (t) { onLoad(t.content); e.target.value = ''; }
      }}
      style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.06em', color: '#aaa49c', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, outline: 'none', appearance: 'none', WebkitAppearance: 'none' }}
    >
      <option value="" disabled>↓ carregar modelo</option>
      {templates.map(t => (
        <option key={t.id} value={t.id}>
          {t.name} — {fmtDate(t.updated_at || t.created_at)}
        </option>
      ))}
    </select>
  );
}

export default function CeremonyFormModal({ data, setData, onSubmit, onClose, title, submitLabel, copySource, allEvents, currentEventId }) {
  const [prepTexts, setPrepTexts] = useState([]);
  const [priceSynced, setPriceSynced] = useState(false);

  useEffect(() => {
    supabase.from('preparation_texts').select('id, title, content, created_at').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPrepTexts(data);
    });
  }, []);

  async function syncPrice(price, partnerId) {
    setData(d => ({ ...d, price_2d: String(price) }));
    setPriceSynced(true);
    await supabase.from('events').update({ price_2d: price }).eq('id', partnerId);
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `events/${fileName}`;
      const { error } = await supabase.storage.from('event-images').upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (error) throw new Error(error.message + '. Crie o bucket "event-images" com acesso público no Supabase Storage, ou cole uma URL manualmente.');
      const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(filePath);
      setData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      alert('Aviso de upload:\n' + err.message);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', padding: '2.5rem', maxWidth: '520px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontFamily: "'IM Fell English', serif", fontSize: '2rem', fontWeight: 400, color: '#3a3530', margin: '0 0 2rem' }}>{title}</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={modalLabelStyle}>Nome da Cerimônia</label>
            <input type="text" required value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="Ex: Cerimônia da Primavera" style={modalInputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={modalLabelStyle}>Data 1 (Obrigatória)</label>
              <input type="date" required value={data.date} onChange={e => setData({ ...data, date: e.target.value })} style={modalInputStyle} />
            </div>
            <div>
              <label style={modalLabelStyle}>Data 2 (Opcional)</label>
              <input type="date" value={data.date2 || ''} onChange={e => setData({ ...data, date2: e.target.value })} style={modalInputStyle} />
            </div>
            <div>
              <label style={modalLabelStyle}>Data 3 (Opcional)</label>
              <input type="date" value={data.date3 || ''} onChange={e => setData({ ...data, date3: e.target.value })} style={modalInputStyle} />
            </div>
          </div>
          {allEvents && allEvents.filter(e => e.id !== currentEventId).length > 0 && (
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={modalLabelStyle}>Cerimônia Parceira</label>
              <select
                value={data.linked_event_id || ''}
                onChange={e => { setPriceSynced(false); setData({ ...data, linked_event_id: e.target.value || null }); }}
                style={{ ...modalInputStyle, fontFamily: "'Courier Prime', monospace", fontSize: '12px' }}
              >
                <option value="">— sem parceira —</option>
                {allEvents.filter(e => e.id !== currentEventId).map(e => (
                  <option key={e.id} value={e.id}>{e.name} — {e.date ? new Date(e.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'sem data'}</option>
                ))}
              </select>
              {data.linked_event_id ? (
                <div style={{ marginTop: '4px', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#aaa49c' }}>
                  Participantes que fizerem 1 dia em cada cerimônia serão cobrados pelo pacote de 2 dias.
                </div>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!data.disable_auto_pair}
                    onChange={e => setData({ ...data, disable_auto_pair: e.target.checked })}
                    style={{ accentColor: '#3a3530', width: '12px', height: '12px', cursor: 'pointer' }}
                  />
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#9a9288', letterSpacing: '0.04em' }}>
                    Não parear automaticamente com cerimônias próximas
                  </span>
                </label>
              )}
            </div>
          )}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={modalLabelStyle}>Imagem (Link ou Upload)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" value={data.image_url} onChange={e => setData({ ...data, image_url: e.target.value })} placeholder="Cole uma URL ou use o botão ao lado..." style={{ ...modalInputStyle, flex: 1 }} />
              <label style={{ background: 'transparent', border: '0.5px dashed #b8b0a4', padding: '8px 12px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a7268', borderRadius: '2px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                📷 enviar
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
            {data.image_url && (
              <div style={{ position: 'relative', width: '100%', height: '70px', borderRadius: '2px', overflow: 'hidden', border: '0.5px solid #c8c2b8' }}>
                <img src={data.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setData({ ...data, image_url: '' })} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(58,53,48,0.75)', color: '#f7f4ee', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={modalLabelStyle}>Preço 1 dia (USD)</label>
              <input type="number" min="0" step="0.01" value={data.price_1d} onChange={e => setData({ ...data, price_1d: e.target.value })} placeholder="0.00" style={modalInputStyle} />
            </div>
            <div>
              <label style={modalLabelStyle}>Preço 2 dias (USD)</label>
              <input type="number" min="0" step="0.01" value={data.price_2d} onChange={e => { setPriceSynced(false); setData({ ...data, price_2d: e.target.value }); }} placeholder="0.00" style={modalInputStyle} />
            </div>
          </div>
          {(() => {
            const partner = allEvents?.find(e => e.id === data.linked_event_id);
            const current2d = data.price_2d !== '' && data.price_2d != null ? parseFloat(data.price_2d) : null;
            const partner2d = partner?.price_2d ?? null;
            if (!partner || priceSynced || current2d == null || partner2d == null || current2d === partner2d) return null;
            const btnStyle = { fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.08em', padding: '6px 12px', borderRadius: '2px', cursor: 'pointer', border: '0.5px solid #c8a830', background: 'transparent', color: '#7a6820' };
            return (
              <div style={{ marginBottom: '1.2rem', background: '#fdf8e4', border: '0.5px solid #d8c870', borderRadius: '2px', padding: '0.8rem 1rem' }}>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#7a6820', letterSpacing: '0.06em', marginBottom: '0.7rem', lineHeight: 1.6 }}>
                  Preço de 2 dias difere da cerimônia parceira ({partner.name}: ${partner2d.toFixed(2)}). Escolha o valor que vale para ambas:
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button type="button" onClick={() => syncPrice(current2d, partner.id)} style={btnStyle}>
                    Usar ${current2d.toFixed(2)} (esta)
                  </button>
                  <button type="button" onClick={() => syncPrice(partner2d, partner.id)} style={btnStyle}>
                    Usar ${partner2d.toFixed(2)} ({partner.name})
                  </button>
                </div>
              </div>
            );
          })()}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '1.6rem 0 1.2rem' }}>
            <div style={{ flex: 1, height: '0.5px', background: '#e0d8ce' }} />
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0a898', whiteSpace: 'nowrap' }}>Textos da Cerimônia</span>
            <div style={{ flex: 1, height: '0.5px', background: '#e0d8ce' }} />
          </div>
          {copySource && (
            <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setData(prev => ({
                  ...prev,
                  invite_message: copySource.invite_message || prev.invite_message,
                  address: copySource.address || prev.address,
                  preparation_text: copySource.preparation_text || prev.preparation_text,
                  payment_text: copySource.payment_text || prev.payment_text,
                  ficha_message: copySource.ficha_message || prev.ficha_message,
                }))}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.08em', color: '#b0a898', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                copiar textos da última cerimônia
              </button>
            </div>
          )}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
              <label style={{ ...modalLabelStyle, marginBottom: 0 }}>Mensagem para Convidar</label>
              <TemplateLoader category="convidar" onLoad={v => setData(d => ({ ...d, invite_message: v }))} />
            </div>
            <textarea value={data.invite_message || ''} onChange={e => setData({ ...data, invite_message: e.target.value })} rows="3" placeholder="Texto que vai junto com o link de interesse ao copiar..." style={{ ...modalInputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
              <label style={{ ...modalLabelStyle, marginBottom: 0 }}>Endereço / Local</label>
              <TemplateLoader category="endereco" onLoad={v => setData(d => ({ ...d, address: v }))} />
            </div>
            <textarea value={data.address || ''} onChange={e => setData({ ...data, address: e.target.value })} rows="2" placeholder="Endereço, link do Maps, referências..." style={{ ...modalInputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
              <label style={{ ...modalLabelStyle, marginBottom: 0 }}>Texto de Preparação</label>
              <TemplateLoader category="preparacao" onLoad={v => setData(d => ({ ...d, preparation_text: v }))} />
            </div>
            <textarea value={data.preparation_text || ''} onChange={e => setData({ ...data, preparation_text: e.target.value })} rows="3" placeholder="Informações e orientações para preparação..." style={{ ...modalInputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={modalLabelStyle}>Página de Preparação</label>
            <select
              value={data.preparation_id || ''}
              onChange={e => setData({ ...data, preparation_id: e.target.value })}
              style={{ ...modalInputStyle, fontFamily: "'Courier Prime', monospace", fontSize: '12px' }}
            >
              <option value="">— nenhuma —</option>
              {prepTexts.map(t => (
                <option key={t.id} value={t.id}>{t.title} — {new Date(t.created_at).toLocaleDateString('pt-BR')}</option>
              ))}
            </select>
            {data.preparation_id && (() => {
              const sel = prepTexts.find(t => t.id === data.preparation_id);
              const preview = sel?.content?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 140);
              return (
                <>
                  <div style={{ marginTop: '4px', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#aaa49c' }}>
                    Link que será enviado: /preparacao/[id da cerimônia]
                  </div>
                  {preview && (
                    <div style={{ marginTop: '6px', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#b0a898', lineHeight: '1.6', borderLeft: '2px solid #e0d8ce', paddingLeft: '8px' }}>
                      {preview}…
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
              <label style={{ ...modalLabelStyle, marginBottom: 0 }}>Texto para Pagamento</label>
              <TemplateLoader category="pagamento" onLoad={v => setData(d => ({ ...d, payment_text: v }))} />
            </div>
            <textarea value={data.payment_text || ''} onChange={e => setData({ ...data, payment_text: e.target.value })} rows="3" placeholder="Informações sobre formas de pagamento, valores, PIX..." style={{ ...modalInputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
              <label style={{ ...modalLabelStyle, marginBottom: 0 }}>Mensagem para Enviar Ficha de Triagem</label>
              <TemplateLoader category="ficha" onLoad={v => setData(d => ({ ...d, ficha_message: v }))} />
            </div>
            <textarea value={data.ficha_message || ''} onChange={e => setData({ ...data, ficha_message: e.target.value })} rows="5" placeholder={'Oi, [nome]!\n\nSegue o Formulário de Triagem...\n\n[link]'} style={{ ...modalInputStyle, resize: 'vertical' }} />
            <div style={{ fontSize: '10px', color: '#9a9288', marginTop: '4px', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.05em' }}>Variáveis: [nome] · [link] · [nome da cerimônia] · [data da cerimônia] · [dia inscrito]</div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button type="submit" style={modalSubmitStyle}>{submitLabel}</button>
            <button type="button" onClick={onClose} style={modalCancelStyle}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
