'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const PersonIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/>
  </svg>
);
const PlantIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M12 22V10"/><path d="M12 10C10 6 6 4 3 5c0 5 4 8 9 5Z"/><path d="M12 14c2-4 6-6 9-5c0 5-4 8-9 5Z"/>
  </svg>
);
const CoinNavIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><path d="M12 6v2M12 16v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2.5-5 2.5-5 5s.9 2 2.5 2 2.5-.9 2.5-2"/>
  </svg>
);
const DiarioNavIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const s = {
  page: { minHeight: '100vh', background: '#f7f4ee', fontFamily: "'Courier Prime', monospace", color: '#3a3530' },
  nav: { position: 'sticky', top: 0, zIndex: 100, background: '#3a3530', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' },
  navBrand: { fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#f7f4ee', fontWeight: 400, textDecoration: 'none' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '1.8rem' },
  navLink: { fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0a898', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' },
  navLinkActive: { color: '#f7f4ee', borderBottom: '0.5px solid #4a7a5a', paddingBottom: '2px' },
};

const MODE_FILTERS = [
  { key: 'today',     label: 'Hoje' },
  { key: 'yesterday', label: 'Ontem' },
  { key: '5days',     label: 'Últimos 5 dias' },
  { key: 'all',       label: 'Tudo' },
  { key: 'range',     label: 'Período' },
];

export default function DiarioPage() {
  const [user, setUser] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [ceremoniaFilter, setCeremoniaFilter] = useState('');
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
    if (!user) { router.push('/login'); return; }
    setUser(user);
    fetchData();
  }

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase
      .from('event_participants')
      .select('enrollment_log, payment_log, contacts(id, name, nickname), events!inner(id, name, date, active)');

    const entries = [];
    (data || [])
      .filter(p => p.events?.active !== false)
      .forEach(p => {
        const name = p.contacts?.nickname || p.contacts?.name || '—';
        const ceremony = p.events?.name || '—';
        const eventId = p.events?.id;
        (p.enrollment_log || []).forEach(e =>
          entries.push({ ...e, _name: name, _ceremony: ceremony, _eventId: eventId, _type: 'inscrição' })
        );
        (p.payment_log || []).forEach(e =>
          entries.push({ ...e, _name: name, _ceremony: ceremony, _eventId: eventId, _type: 'pagamento' })
        );
      });

    entries.sort((a, b) => new Date(b.at) - new Date(a.at));
    setAllEntries(entries);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const todayStr     = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const fiveDaysAgo  = new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10);

  let filtered;
  if (filter === 'all') {
    filtered = allEntries;
  } else if (filter === 'today') {
    filtered = allEntries.filter(e => e.at.startsWith(todayStr));
  } else if (filter === 'yesterday') {
    filtered = allEntries.filter(e => e.at.startsWith(yesterdayStr));
  } else if (filter === '5days') {
    filtered = allEntries.filter(e => e.at.slice(0, 10) >= fiveDaysAgo);
  } else {
    filtered = allEntries.filter(e => {
      const d = e.at.slice(0, 10);
      return (!rangeFrom || d >= rangeFrom) && (!rangeTo || d <= rangeTo);
    });
  }

  if (personSearch.trim()) {
    const q = personSearch.trim().toLowerCase();
    filtered = filtered.filter(e => e._name.toLowerCase().includes(q));
  }

  if (ceremoniaFilter) {
    filtered = filtered.filter(e => e._eventId === ceremoniaFilter);
  }

  const allCeremonies = [...new Map(allEntries.map(e => [e._eventId, { id: e._eventId, name: e._ceremony }])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '5rem', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.1em' }}>
      Verificando acesso...
    </div>
  );

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.navBrand}>Journey<span style={{ color: '#4a7a5a' }}>.</span></a>
        <div style={s.navLinks}>
          <a href="/" style={s.navLink}><PersonIcon />{!isMobile && ' Pessoas'}</a>
          <a href="/events" style={s.navLink}><PlantIcon />{!isMobile && ' Cerimônias'}</a>
          <a href="/pagamentos" style={s.navLink}><CoinNavIcon />{!isMobile && ' Pagamentos'}</a>
          <a href="/diario" style={{ ...s.navLink, ...s.navLinkActive }}><DiarioNavIcon />{!isMobile && ' Diário'}</a>
          <a href="/settings/users" style={{ ...s.navLink, color: '#6a6258' }} title="Gestão de usuários">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </a>
          <button onClick={handleLogout} style={{ ...s.navLink, background: 'none', border: '0.5px dashed #5a5248', padding: '4px 10px', cursor: 'pointer' }}>sair</button>
        </div>
      </nav>

      {/* Filters bar */}
      <div style={{ background: '#f0ede8', borderBottom: '0.5px solid #d0cbc2', padding: '0.6rem 2.5rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {MODE_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{ padding: '4px 11px', borderRadius: '2px', cursor: 'pointer', border: filter === f.key ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', background: filter === f.key ? '#3a3530' : 'transparent', color: filter === f.key ? '#f7f4ee' : '#7a7268', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.15s' }}
          >
            {f.label}
          </button>
        ))}
        {filter === 'range' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
            <span style={{ fontSize: '9px', color: '#7a7268', letterSpacing: '0.08em' }}>de</span>
            <input
              type="date"
              value={rangeFrom}
              onChange={e => setRangeFrom(e.target.value)}
              style={{ padding: '3px 7px', background: '#fdfbf7', border: '0.5px solid #c8c2b8', borderRadius: '2px', color: '#3a3530', fontFamily: "'Courier Prime', monospace", fontSize: '9px' }}
            />
            <span style={{ fontSize: '9px', color: '#7a7268', letterSpacing: '0.08em' }}>até</span>
            <input
              type="date"
              value={rangeTo}
              onChange={e => setRangeTo(e.target.value)}
              style={{ padding: '3px 7px', background: '#fdfbf7', border: '0.5px solid #c8c2b8', borderRadius: '2px', color: '#3a3530', fontFamily: "'Courier Prime', monospace", fontSize: '9px' }}
            />
          </div>
        )}
        <input
          type="text"
          placeholder="Filtrar por pessoa..."
          value={personSearch}
          onChange={e => setPersonSearch(e.target.value)}
          style={{ padding: '3px 9px', background: '#fdfbf7', border: personSearch ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', color: '#3a3530', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.06em', width: '140px', outline: 'none' }}
        />
        {allCeremonies.length > 0 && (
          <select
            value={ceremoniaFilter}
            onChange={e => setCeremoniaFilter(e.target.value)}
            style={{ padding: '3px 7px', background: '#fdfbf7', border: ceremoniaFilter ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', color: ceremoniaFilter ? '#3a3530' : '#7a7268', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.06em', outline: 'none', cursor: 'pointer', maxWidth: '160px' }}
          >
            <option value="">Todas as cerimônias</option>
            {allCeremonies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        {!loading && (
          <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#aaa49c', letterSpacing: '0.06em' }}>
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={{ padding: '1.5rem 2.5rem 4rem', maxWidth: '720px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#aaa49c', fontSize: '12px', letterSpacing: '0.08em' }}>
            carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#aaa49c', fontSize: '12px', letterSpacing: '0.08em', fontStyle: 'italic' }}>
            nenhum registro para este período.
          </div>
        ) : (
          filtered.map((entry, i) => {
            const dt = new Date(entry.at).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', year: '2-digit',
              hour: '2-digit', minute: '2-digit',
              timeZone: 'America/Sao_Paulo',
            });
            const isPayment = entry._type === 'pagamento';
            return (
              <div
                key={i}
                style={{ display: 'flex', gap: '12px', padding: '0.65rem 0', borderBottom: '0.5px dashed #ddd9cf', alignItems: 'flex-start' }}
              >
                <div style={{ width: '4px', flexShrink: 0, borderRadius: '2px', background: isPayment ? '#7a68a4' : '#5d9470', alignSelf: 'stretch', marginTop: '3px', minHeight: '16px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '9px', color: '#aaa49c', letterSpacing: '0.04em', flexShrink: 0 }}>{dt}</span>
                    <span style={{ fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', color: isPayment ? '#7a68a4' : '#5d9470', background: isPayment ? '#f0eef8' : '#eef5f0', padding: '1px 5px', borderRadius: '2px', flexShrink: 0 }}>
                      {entry._type}
                    </span>
                    <a
                      href={`/events/${entry._eventId}`}
                      style={{ fontSize: '8px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#aaa49c', textDecoration: 'none', borderBottom: '0.5px dashed #c8c2b8' }}
                    >
                      {entry._ceremony}
                    </a>
                  </div>
                  <div style={{ fontSize: '12px', color: '#3a3530', lineHeight: 1.4 }}>
                    <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '14px' }}>{entry._name}</span>
                    {' · '}
                    <span style={{ fontWeight: 600 }}>{entry.by}</span>
                    {' '}
                    {entry.msg}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
