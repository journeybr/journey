'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import CeremonyFormModal from '@/components/CeremonyFormModal';

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

const CoinNavIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v2M12 16v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2.5-5 2.5-5 5s.9 2 2.5 2 2.5-.9 2.5-2"/>
  </svg>
);

const DiarioNavIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
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
    fontSize: '16px',
    lineHeight: 1,
    transition: 'color 0.15s',
  },
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const defaultFichaMessage = 'Oi, [nome]!\n\nSegue o Formulário de Triagem, clicando no link abaixo:\n\n[link]\n\nPor favor preenche o mais rápido possível pra dar tempo de a gente planejar sua experiência.';
  const emptyForm = { name: '', date: '', date2: '', date3: '', image_url: '', invite_message: '', address: '', preparation_text: '', payment_text: '', ficha_message: defaultFichaMessage, pos_journey_message: '', price_1d: '', price_2d: '', linked_event_id: null, disable_auto_pair: false };
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
    const dataToInsert = {
      ...formData,
      date: formData.date || null,
      date2: formData.date2 || null,
      date3: formData.date3 || null,
      price_1d: formData.price_1d !== '' ? parseFloat(formData.price_1d) : null,
      price_2d: formData.price_2d !== '' ? parseFloat(formData.price_2d) : null,
      linked_event_id: formData.linked_event_id || null,
      disable_auto_pair: formData.disable_auto_pair || false,
    };
    const { data: newEvent, error } = await supabase.from('events').insert([dataToInsert]).select('id').single();
    if (error) { alert('Erro ao criar cerimônia: ' + error.message); }
    else {
      if (dataToInsert.linked_event_id) {
        await supabase.from('events').update({ linked_event_id: newEvent.id }).eq('id', dataToInsert.linked_event_id);
      }
      setIsModalOpen(false);
      setFormData(emptyForm);
      fetchEvents();
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const dataToUpdate = {
      ...editFormData,
      date: editFormData.date || null,
      date2: editFormData.date2 || null,
      date3: editFormData.date3 || null,
      price_1d: editFormData.price_1d !== '' ? parseFloat(editFormData.price_1d) : null,
      price_2d: editFormData.price_2d !== '' ? parseFloat(editFormData.price_2d) : null,
      linked_event_id: editFormData.linked_event_id || null,
      disable_auto_pair: editFormData.disable_auto_pair || false,
    };
    const { error } = await supabase.from('events').update(dataToUpdate).eq('id', editingEvent.id);
    if (error) { alert('Erro ao editar cerimônia: ' + error.message); }
    else {
      const oldLink = editingEvent.linked_event_id;
      const newLink = dataToUpdate.linked_event_id;
      if (oldLink && oldLink !== newLink) {
        await supabase.from('events').update({ linked_event_id: null }).eq('id', oldLink);
      }
      if (newLink) {
        await supabase.from('events').update({ linked_event_id: editingEvent.id }).eq('id', newLink);
      }
      setEditingEvent(null);
      fetchEvents();
    }
  }

  async function handleDeactivate(id) {
    if (!confirm('Concluir esta experiência? Ela será arquivada.')) return;
    const { error } = await supabase.from('events').update({ active: false }).eq('id', id);
    if (error) { alert('Erro ao concluir: ' + error.message); return; }
    // Mark confirmed participants as no longer "primeira vez"
    const { data: parts } = await supabase
      .from('event_participants')
      .select('contact_id')
      .eq('event_id', id)
      .eq('status', 'Confirmado');
    if (parts?.length) {
      await supabase.from('contacts')
        .update({ primeira_vez: false })
        .in('id', parts.map(p => p.contact_id));
    }
    fetchEvents();
  }

  async function handleReactivate(id) {
    const { error } = await supabase.from('events').update({ active: true }).eq('id', id);
    if (error) { alert('Erro ao retomar: ' + error.message); }
    else fetchEvents();
  }

  async function handleDelete(id) {
    if (!confirm('Excluir permanentemente esta cerimônia? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) { alert('Erro ao excluir: ' + error.message); }
    else fetchEvents();
  }

  async function handleChangeStatus(id, newStatus) {
    const labels = { lista_espera: 'Lista de Espera', fechada: 'Fechada para Novas Inscrições' };
    const label = newStatus ? labels[newStatus] : 'Aberta';
    if (!confirm(`Mudar o status desta cerimônia para "${label}"?`)) return;
    const { error } = await supabase.from('events').update({ ceremony_status: newStatus || null }).eq('id', id);
    if (error) { alert('Erro: ' + error.message); return; }
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ceremony_status: newStatus || null } : e));
  }

  function openEditModal(event) {
    setEditFormData({
      name: event.name || '',
      date: event.date || '',
      date2: event.date2 || '',
      date3: event.date3 || '',
      image_url: event.image_url || '',
      invite_message: event.invite_message || '',
      address: event.address || '',
      preparation_text: event.preparation_text || '',
      payment_text: event.payment_text || '',
      ficha_message: event.ficha_message || defaultFichaMessage,
      pos_journey_message: event.pos_journey_message || '',
      price_1d: event.price_1d != null ? String(event.price_1d) : '',
      price_2d: event.price_2d != null ? String(event.price_2d) : '',
      linked_event_id: event.linked_event_id || null,
      disable_auto_pair: event.disable_auto_pair || false,
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
            <PersonIcon />{!isMobile && ' Pessoas'}
          </a>
          <a href="/events" style={{ ...s.navLink, ...s.navLinkActive }}>
            <PlantIcon />{!isMobile && ' Cerimônias'}
          </a>
          <a href="/pagamentos" style={s.navLink}>
            <CoinNavIcon />{!isMobile && ' Pagamentos'}
          </a>
          <a href="/diario" style={s.navLink}>
            <DiarioNavIcon />{!isMobile && ' Diário'}
          </a>

          <a href="/settings" style={{ ...s.navLink, color: '#6a6258' }} title="Configurações">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </a>
          <a href="/settings/users" style={{ ...s.navLink, color: '#6a6258' }} title="Gestão de usuários">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {(() => {
              const placed = new Set();
              const groups = [];
              for (const ev of events) {
                if (placed.has(ev.id)) continue;
                let partner = ev.linked_event_id
                  ? events.find(e => e.id === ev.linked_event_id && !placed.has(e.id))
                  : events.find(e => e.linked_event_id === ev.id && !placed.has(e.id));
                if (!partner && !ev.disable_auto_pair && ev.date) {
                  partner = events.find(e =>
                    !placed.has(e.id) &&
                    e.id !== ev.id &&
                    !e.linked_event_id &&
                    !e.disable_auto_pair &&
                    e.date &&
                    Math.abs(new Date(e.date) - new Date(ev.date)) <= 29 * 24 * 60 * 60 * 1000
                  );
                }
                if (partner) {
                  groups.push([ev, partner]);
                  placed.add(ev.id);
                  placed.add(partner.id);
                } else {
                  groups.push([ev]);
                  placed.add(ev.id);
                }
              }
              return groups.map((group, gi) => (
                <div key={gi} style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {group.map(event => (
              <div
                key={event.id}
                style={{
                  flex: '0 0 300px',
                  maxWidth: '360px',
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
                    {event.date3 && <div><strong>D3:</strong> {new Date(event.date3).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>}
                  </div>

                  {event.ceremony_status && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{
                        fontFamily: 'sans-serif', fontSize: '8px', letterSpacing: '0.1em',
                        textTransform: 'uppercase', fontWeight: 'bold', padding: '2px 6px', borderRadius: '2px',
                        color: event.ceremony_status === 'fechada' ? '#7a1a1a' : '#6b4f00',
                        background: event.ceremony_status === 'fechada' ? '#fdf0f0' : '#fdf8e0',
                        border: `0.5px solid ${event.ceremony_status === 'fechada' ? '#e8c0c0' : '#e0d090'}`,
                      }}>
                        {event.ceremony_status === 'lista_espera' ? '⏳ Lista de Espera' : '⊘ Fechada'}
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ borderTop: '0.5px dashed #c2b59b', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#8B0000', fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: '1px' }}>
                      {event.event_participants?.[0]?.count || 0} PARTICIPANTES
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
                        title={event.ceremony_status === 'lista_espera' ? 'Remover Lista de Espera' : 'Colocar em Lista de Espera'}
                        onClick={e => { e.stopPropagation(); handleChangeStatus(event.id, event.ceremony_status === 'lista_espera' ? null : 'lista_espera'); }}
                        style={{ ...s.cardActionBtn, color: event.ceremony_status === 'lista_espera' ? '#c8a830' : '#c8c2b8' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#a88020'}
                        onMouseLeave={e => e.currentTarget.style.color = event.ceremony_status === 'lista_espera' ? '#c8a830' : '#c8c2b8'}
                      >
                        ⏳
                      </button>
                      <button
                        title={event.ceremony_status === 'fechada' ? 'Reabrir para Inscrições' : 'Fechar para Novas Inscrições'}
                        onClick={e => { e.stopPropagation(); handleChangeStatus(event.id, event.ceremony_status === 'fechada' ? null : 'fechada'); }}
                        style={{ ...s.cardActionBtn, color: event.ceremony_status === 'fechada' ? '#8B0000' : '#c8c2b8' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#8B0000'}
                        onMouseLeave={e => e.currentTarget.style.color = event.ceremony_status === 'fechada' ? '#8B0000' : '#c8c2b8'}
                      >
                        ⊘
                      </button>
                      <button
                        title="Arquivar cerimônia"
                        onClick={e => { e.stopPropagation(); handleDeactivate(event.id); }}
                        style={{ ...s.cardActionBtn, color: '#c8a8a8' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#8a7a58'}
                        onMouseLeave={e => e.currentTarget.style.color = '#c8a8a8'}
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                </div>
              </div>
                  ))}
                </div>
              ));
            })()}
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
                {showInactive ? '▾' : '▸'} Cerimônias arquivadas ({inactiveEvents.length})
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

                    <div
                    onClick={() => router.push(`/events/${event.id}`)}
                    style={{
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
                      cursor: 'pointer',
                    }}>
                      <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', color: '#3a3530', borderBottom: '1px solid #c2b59b', paddingBottom: '0.3rem', fontWeight: 'bold', lineHeight: 1.2 }}>
                        {event.name}
                      </h3>

                      <div style={{ fontSize: '0.75rem', color: '#777', marginBottom: '0.5rem' }}>
                        {event.date ? new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Sem data'}
                      </div>

                      <div style={{ borderTop: '0.5px dashed #c2b59b', paddingTop: '0.5rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#9a8a7a', fontSize: '0.65rem', fontFamily: 'sans-serif', letterSpacing: '1px' }}>
                          ARQUIVADA
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            title="Retomar experiência"
                            onClick={e => { e.stopPropagation(); handleReactivate(event.id); }}
                            style={{ ...s.cardActionBtn, color: '#8a9a88', fontSize: '11px' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#5d9470'}
                            onMouseLeave={e => e.currentTarget.style.color = '#8a9a88'}
                          >
                            ↺
                          </button>
                          <button
                            title="Excluir permanentemente"
                            onClick={e => { e.stopPropagation(); handleDelete(event.id); }}
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
          allEvents={events}
          currentEventId={null}
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
          allEvents={events}
          currentEventId={editingEvent.id}
        />
      )}
    </div>
  );
}
