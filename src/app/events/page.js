'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const PersonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <circle cx="12" cy="7" r="4"/>
    <path d="M4 21v-1a8 8 0 0 1 16 0v1"/>
  </svg>
);

const PlantIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M12 22V10"/>
    <path d="M12 10C10 6 6 4 3 5c0 5 4 8 9 5Z"/>
    <path d="M12 14c2-4 6-6 9-5c0 5-4 8-9 5Z"/>
  </svg>
);

const s = {
  page: {
    fontFamily: "'Caveat', cursive",
    background: '#f7f4ee',
    minHeight: '100vh',
    position: 'relative',
  },
  marginLine: {
    position: 'fixed',
    left: '3.2rem',
    top: 0,
    bottom: 0,
    width: '1px',
    background: '#e8c8c8',
    opacity: 0.45,
    pointerEvents: 'none',
    zIndex: 0,
  },
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#3a3530',
    padding: '0.75rem 2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
  },
  navBrand: {
    fontFamily: "'IM Fell English', serif",
    fontSize: '20px',
    color: '#f7f4ee',
    fontWeight: 400,
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.8rem',
  },
  navLink: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#b0a898',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  navLinkActive: {
    color: '#f7f4ee',
    borderBottom: '0.5px solid #4a7a5a',
    paddingBottom: '2px',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '2.5rem 2.5rem 4rem 4.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  pageTitle: {
    fontFamily: "'IM Fell English', serif",
    fontSize: '3.5rem',
    color: '#3a3530',
    fontWeight: 400,
    lineHeight: 1.0,
    margin: '0 0 0.3rem',
  },
  pageSubtitle: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: '11px',
    color: '#aaa49c',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: '0 0 2.5rem',
  },
  addBtn: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#7a7268',
    border: '0.5px dashed #b8b0a4',
    background: 'transparent',
    padding: '8px 18px',
    borderRadius: '2px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  cardActionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 5px',
    fontFamily: "'Courier Prime', monospace",
    fontSize: '12px',
    lineHeight: 1,
    transition: 'color 0.15s',
  },
};

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

function CeremonyFormModal({ data, setData, onSubmit, onClose, title, submitLabel, copySource }) {
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
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={modalLabelStyle}>Texto para Pagamento</label>
            <textarea value={data.payment_text || ''} onChange={e => setData({ ...data, payment_text: e.target.value })} rows="3" placeholder="Informações sobre formas de pagamento, valores, PIX..." style={{ ...modalInputStyle, resize: 'vertical' }} />
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

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const emptyForm = { name: '', date: '', date2: '', image_url: '', invite_message: '', address: '', preparation_text: '', payment_text: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [editFormData, setEditFormData] = useState(emptyForm);
  const [inactiveEvents, setInactiveEvents] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { checkUser(); }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); }
    else { setUser(user); fetchEvents(); }
  }

  async function fetchEvents() {
    setLoading(true);
    const [{ data: active, error: e1 }, { data: inactive, error: e2 }] = await Promise.all([
      supabase.from('events').select('*, event_participants(count)').or('active.is.null,active.eq.true').order('date', { ascending: false }),
      supabase.from('events').select('*, event_participants(count)').eq('active', false).order('date', { ascending: false }),
    ]);
    if (!e1) setEvents(active || []);
    if (!e2) setInactiveEvents(inactive || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const dataToInsert = { ...formData, date: formData.date || null, date2: formData.date2 || null };
    const { error } = await supabase.from('events').insert([dataToInsert]);
    if (error) { alert('Erro ao criar cerimônia: ' + error.message); }
    else {
      setIsModalOpen(false);
      setFormData(emptyForm);
      fetchEvents();
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const dataToUpdate = { ...editFormData, date: editFormData.date || null, date2: editFormData.date2 || null };
    const { error } = await supabase.from('events').update(dataToUpdate).eq('id', editingEvent.id);
    if (error) { alert('Erro ao editar cerimônia: ' + error.message); }
    else { setEditingEvent(null); fetchEvents(); }
  }

  async function handleDeactivate(id) {
    const { error } = await supabase.from('events').update({ active: false }).eq('id', id);
    if (error) { alert('Erro ao desativar: ' + error.message); }
    else fetchEvents();
  }

  async function handleReactivate(id) {
    const { error } = await supabase.from('events').update({ active: true }).eq('id', id);
    if (error) { alert('Erro ao reativar: ' + error.message); }
    else fetchEvents();
  }

  async function handleDelete(id) {
    if (!confirm('Excluir permanentemente esta cerimônia? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) { alert('Erro ao excluir: ' + error.message); }
    else fetchEvents();
  }

  function openEditModal(event) {
    setEditFormData({
      name: event.name || '',
      date: event.date || '',
      date2: event.date2 || '',

      image_url: event.image_url || '',
      invite_message: event.invite_message || '',
      address: event.address || '',
      preparation_text: event.preparation_text || '',
      payment_text: event.payment_text || '',
    });
    setEditingEvent(event);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '5rem', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.1em' }}>
      Verificando acesso...
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.marginLine} />

      {/* Navbar */}
      <nav style={s.nav}>
        <a href="/" style={s.navBrand}>Journey<span style={{ color: '#4a7a5a' }}>.</span></a>
        <div style={s.navLinks}>
          <a href="/" style={s.navLink}>
            <PersonIcon /> Pessoas
          </a>
          <a href="/events" style={{ ...s.navLink, ...s.navLinkActive }}>
            <PlantIcon /> Cerimônias
          </a>

          <button onClick={handleLogout} style={{ ...s.navLink, background: 'none', border: '0.5px dashed #5a5248', padding: '4px 10px', cursor: 'pointer' }}>
            sair
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ ...s.content, padding: isMobile ? '1.5rem 1.2rem 3rem' : '2.5rem 2.5rem 4rem 4.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-end', marginBottom: '0.4rem', gap: '1rem' }}>
          <div>
            <h1 style={{ ...s.pageTitle, fontSize: isMobile ? '2.8rem' : '3.5rem' }}>Cerimônias</h1>
            {!isMobile && <p style={s.pageSubtitle}>diários dos encontros · jornadas registradas</p>}
          </div>
          <button onClick={() => setIsModalOpen(true)} style={s.addBtn}>
            + nova cerimônia
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem 0', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.1em' }}>
            Carregando cerimônias...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {events.map(event => (
              <div
                key={event.id}
                style={{
                  position: 'relative',
                  background: '#1c1c1c',
                  borderRadius: '3px 12px 12px 3px',
                  boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.4), 4px 4px 10px rgba(0,0,0,0.5)',
                  cursor: 'pointer',
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'visible',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderLeft: '4px solid #111',
                  marginTop: '10px',
                  marginBottom: '10px',
                }}
                onClick={() => router.push(`/events/${event.id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'inset -2px 0 5px rgba(0,0,0,0.4), 8px 8px 15px rgba(0,0,0,0.6)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'inset -2px 0 5px rgba(0,0,0,0.4), 4px 4px 10px rgba(0,0,0,0.5)';
                }}
              >
                {/* Spine Groove */}
                <div style={{ position: 'absolute', left: '8px', top: 0, bottom: 0, width: '3px', background: 'rgba(0,0,0,0.6)', boxShadow: '1px 0 2px rgba(255,255,255,0.05)' }} />

                {/* Elastic Band */}
                <div style={{ position: 'absolute', right: '18px', top: '-1px', bottom: '-1px', width: '12px', background: '#222', boxShadow: 'inset 0 0 4px rgba(0,0,0,0.8), -2px 0 4px rgba(0,0,0,0.4)', borderRadius: '1px', zIndex: 10 }} />

                {/* Red Ribbon */}
                <div style={{ position: 'absolute', bottom: '-15px', left: '40px', width: '14px', height: '40px', background: '#8B0000', borderBottomLeftRadius: '2px', borderBottomRightRadius: '2px', boxShadow: '2px 2px 4px rgba(0,0,0,0.4)', zIndex: 1 }} />

                {/* Ivory Label */}
                <div style={{
                  margin: '35px 45px 35px 25px',
                  background: '#f4ecd8',
                  color: '#333',
                  padding: '1rem',
                  borderRadius: '2px',
                  boxShadow: 'inset 0 0 10px rgba(200,180,150,0.1), 1px 1px 3px rgba(0,0,0,0.4)',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  zIndex: 5,
                  fontFamily: '"Times New Roman", Times, serif',
                }}>
                  {/* Image thumbnail */}
                  {event.image_url && (
                    <div style={{ width: '100%', height: '52px', overflow: 'hidden', borderRadius: '1px', marginBottom: '0.65rem', border: '0.5px solid #c2b59b' }}>
                      <img src={event.image_url} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(15%)' }} />
                    </div>
                  )}

                  <h3 style={{ margin: '0 0 0.55rem', fontSize: '1.35rem', color: '#1a1a1a', borderBottom: '1px solid #c2b59b', paddingBottom: '0.3rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                    {event.name}
                  </h3>

                  <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.55rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div><strong>D1:</strong> {event.date ? new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A definir'}</div>
                    {event.date2 && <div><strong>D2:</strong> {new Date(event.date2).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>}
                  </div>

                  {/* Footer */}
                  <div style={{ borderTop: '0.5px dashed #c2b59b', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#8B0000', fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: '1px' }}>
                      {event.event_participants?.[0]?.count || 0} PASSAPORTES
                    </span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        title="Editar cerimônia"
                        onClick={e => { e.stopPropagation(); openEditModal(event); }}
                        style={{ ...s.cardActionBtn, color: '#8a7a58' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#3a3530'}
                        onMouseLeave={e => e.currentTarget.style.color = '#8a7a58'}
                      >
                        ✎
                      </button>
                      <button
                        title="Desativar cerimônia"
                        onClick={e => { e.stopPropagation(); handleDeactivate(event.id); }}
                        style={{ ...s.cardActionBtn, color: '#c8a8a8' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#8a7a58'}
                        onMouseLeave={e => e.currentTarget.style.color = '#c8a8a8'}
                      >
                        ○
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#b0a898', fontStyle: 'italic', padding: '2rem 0' }}>
                Nenhuma cerimônia criada ainda.
              </div>
            )}
          </div>
        )}

        {/* Journey desativadas */}
        {(inactiveEvents.length > 0 || showInactive) && (
          <div style={{ marginTop: '4rem' }}>
            <button
              onClick={() => setShowInactive(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, marginBottom: showInactive ? '2rem' : 0 }}
            >
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c' }}>
                {showInactive ? '▾' : '▸'} Journey desativadas ({inactiveEvents.length})
              </span>
            </button>

            {showInactive && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
                {inactiveEvents.map(event => (
                  <div
                    key={event.id}
                    style={{
                      position: 'relative',
                      background: '#2a2826',
                      borderRadius: '3px 12px 12px 3px',
                      boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.3), 2px 2px 6px rgba(0,0,0,0.3)',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'visible',
                      borderLeft: '4px solid #1a1a1a',
                      marginTop: '10px',
                      marginBottom: '10px',
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ position: 'absolute', left: '8px', top: 0, bottom: 0, width: '3px', background: 'rgba(0,0,0,0.5)' }} />
                    <div style={{ position: 'absolute', right: '18px', top: '-1px', bottom: '-1px', width: '12px', background: '#1e1e1e', borderRadius: '1px', zIndex: 10 }} />

                    <div style={{
                      margin: '30px 45px 30px 25px',
                      background: '#e8e0d0',
                      color: '#555',
                      padding: '1rem',
                      borderRadius: '2px',
                      boxShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      zIndex: 5,
                      fontFamily: '"Times New Roman", Times, serif',
                      filter: 'grayscale(40%)',
                    }}>
                      <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', color: '#3a3530', borderBottom: '1px solid #c2b59b', paddingBottom: '0.3rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                        {event.name}
                      </h3>

                      <div style={{ fontSize: '0.75rem', color: '#777', marginBottom: '0.5rem' }}>
                        {event.date ? new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Sem data'}
                      </div>

                      <div style={{ borderTop: '0.5px dashed #c2b59b', paddingTop: '0.5rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#9a8a7a', fontSize: '0.65rem', fontFamily: 'sans-serif', letterSpacing: '1px' }}>
                          DESATIVADA
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            title="Reativar cerimônia"
                            onClick={() => handleReactivate(event.id)}
                            style={{ ...s.cardActionBtn, color: '#8a9a88', fontSize: '11px' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#5d9470'}
                            onMouseLeave={e => e.currentTarget.style.color = '#8a9a88'}
                          >
                            ↺
                          </button>
                          <button
                            title="Excluir permanentemente"
                            onClick={() => handleDelete(event.id)}
                            style={{ ...s.cardActionBtn, color: '#c8a8a8', fontSize: '11px' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
                            onMouseLeave={e => e.currentTarget.style.color = '#c8a8a8'}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ position: 'fixed', bottom: '1.5rem', right: '2rem', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#c8c2b8', letterSpacing: '0.12em', pointerEvents: 'none' }}>
          journey · cerimônias
        </div>
      </div>

      {isModalOpen && (
        <CeremonyFormModal
          data={formData}
          setData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
          title="Nova Cerimônia"
          submitLabel="Criar Cerimônia"
          copySource={events[0] || null}
        />
      )}

      {editingEvent && (
        <CeremonyFormModal
          data={editFormData}
          setData={setEditFormData}
          onSubmit={handleUpdate}
          onClose={() => setEditingEvent(null)}
          title="Editar Cerimônia"
          submitLabel="Salvar Alterações"
          copySource={events.find(e => e.id !== editingEvent.id) || null}
        />
      )}
    </div>
  );
}
