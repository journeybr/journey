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

export default function CeremonyFormModal({ data, setData, onSubmit, onClose, title, submitLabel, copySource }) {
  const [prepTexts, setPrepTexts] = useState([]);

  useEffect(() => {
    supabase.from('preparation_texts').select('id, title').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPrepTexts(data);
    });
  }, []);

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={modalLabelStyle}>Data 1 (Obrigatória)</label>
              <input type="date" required value={data.date} onChange={e => setData({ ...data, date: e.target.value })} style={modalInputStyle} />
            </div>
            <div>
              <label style={modalLabelStyle}>Data 2 (Opcional)</label>
              <input type="date" value={data.date2} onChange={e => setData({ ...data, date2: e.target.value })} style={modalInputStyle} />
            </div>
          </div>
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
            <label style={modalLabelStyle}>Mensagem para Convidar</label>
            <textarea value={data.invite_message || ''} onChange={e => setData({ ...data, invite_message: e.target.value })} rows="3" placeholder="Texto que vai junto com o link de interesse ao copiar..." style={{ ...modalInputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={modalLabelStyle}>Endereço / Local</label>
            <textarea value={data.address || ''} onChange={e => setData({ ...data, address: e.target.value })} rows="2" placeholder="Endereço, link do Maps, referências..." style={{ ...modalInputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={modalLabelStyle}>Texto de Preparação</label>
            <textarea value={data.preparation_text || ''} onChange={e => setData({ ...data, preparation_text: e.target.value })} rows="3" placeholder="Informações e orientações para preparação..." style={{ ...modalInputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={modalLabelStyle}>Texto para Pagamento</label>
            <textarea value={data.payment_text || ''} onChange={e => setData({ ...data, payment_text: e.target.value })} rows="3" placeholder="Informações sobre formas de pagamento, valores, PIX..." style={{ ...modalInputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={modalLabelStyle}>Mensagem para Enviar Ficha de Triagem</label>
            <textarea value={data.ficha_message || ''} onChange={e => setData({ ...data, ficha_message: e.target.value })} rows="5" placeholder={'Oi, [nome]!\n\nSegue o Formulário de Triagem...\n\n[link]'} style={{ ...modalInputStyle, resize: 'vertical' }} />
            <div style={{ fontSize: '10px', color: '#9a9288', marginTop: '4px', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.05em' }}>Use [nome] e [link] como variáveis.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={modalLabelStyle}>Preço 1 dia (USD)</label>
              <input type="number" min="0" step="0.01" value={data.price_1d} onChange={e => setData({ ...data, price_1d: e.target.value })} placeholder="0.00" style={modalInputStyle} />
            </div>
            <div>
              <label style={modalLabelStyle}>Preço 2 dias (USD)</label>
              <input type="number" min="0" step="0.01" value={data.price_2d} onChange={e => setData({ ...data, price_2d: e.target.value })} placeholder="0.00" style={modalInputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={modalLabelStyle}>Página de Preparação</label>
            <select
              value={data.preparation_id || ''}
              onChange={e => setData({ ...data, preparation_id: e.target.value })}
              style={{ ...modalInputStyle, fontFamily: "'Courier Prime', monospace", fontSize: '12px' }}
            >
              <option value="">— nenhuma —</option>
              {prepTexts.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            {data.preparation_id && (
              <div style={{ marginTop: '4px', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#aaa49c' }}>
                Link que será enviado: /preparacao/[id da cerimônia]
              </div>
            )}
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
