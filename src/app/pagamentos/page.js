'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
const GearIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const STATUS_GROUPS = [
  { key: 'em aberto',          label: 'Em aberto',          icon: '◎', color: '#b0a898' },
  { key: 'conferir pagamento', label: 'Conferir Pagamento', icon: '?', color: '#c4892a' },
  { key: 'a pagar no local',   label: 'A pagar no local',   icon: '◐', color: '#8a7a58' },
  { key: 'parcelado',          label: 'Parcelado',          icon: '◑', color: '#7a68a4' },
  { key: 'pago',               label: 'Pago',               icon: '◉', color: '#5d9470' },
];

// Cross-ceremony pricing: if contact has a day in another active ceremony within 29 days,
// expected per ceremony = price_2d / 2 (instead of price_1d)
function computeExpected(p, allParticipants) {
  const otherParts = allParticipants.filter(x =>
    x.contact_id === p.contact_id &&
    x.event_id !== p.event_id &&
    x.events?.active !== false
  );
  const thisDays = [];
  if (p.date1_confirmed && p.events?.date) thisDays.push(p.events.date);
  if (p.date2_confirmed && p.events?.date2) thisDays.push(p.events.date2);
  for (const op of otherParts) {
    const otherDays = [];
    if (op.date1_confirmed && op.events?.date) otherDays.push(op.events.date);
    if (op.date2_confirmed && op.events?.date2) otherDays.push(op.events.date2);
    for (const d1 of thisDays) {
      for (const d2 of otherDays) {
        if (Math.abs(new Date(d1) - new Date(d2)) / 86400000 <= 29) {
          return p.events?.price_2d != null ? p.events.price_2d / 2 : (p.events?.price_1d ?? null);
        }
      }
    }
  }
  return (p.date2_confirmed && p.events?.price_2d) ? p.events.price_2d : (p.events?.price_1d ?? null);
}

function LogFooter({ log, fmtLog, onOpenModal, onRevert }) {
  const last = log[log.length - 1];
  const canRevert = !!last?.prev;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '9px', color: '#b0a898', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em', lineHeight: 1.5, flex: 1 }}>
          {fmtLog(last)}
        </span>
        {canRevert && onRevert && (
          <button onClick={e => { e.stopPropagation(); if (confirm('Retornar ao status anterior?')) onRevert(); }}
            title="Retornar ao status anterior"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4892a', fontSize: '15px', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>↺</button>
        )}
      </div>
      <button onClick={e => { e.stopPropagation(); onOpenModal(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#9a9288', letterSpacing: '0.06em', padding: '0', textDecoration: 'underline', textUnderlineOffset: '2px', textAlign: 'left' }}>
        histórico{log.length > 1 ? ` (${log.length})` : ''}
      </button>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f7f4ee', fontFamily: "'Courier Prime', monospace", color: '#3a3530' },
  nav: { position: 'sticky', top: 0, zIndex: 100, background: '#3a3530', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' },
  navBrand: { fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#f7f4ee', fontWeight: 400, textDecoration: 'none' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '1.8rem' },
  navLink: { fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0a898', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' },
  navLinkActive: { color: '#f7f4ee', borderBottom: '0.5px solid #4a7a5a', paddingBottom: '2px' },
  content: { padding: '2rem 2.5rem 4rem', maxWidth: '620px', margin: '0 auto' },
};

export default function PagamentosPage() {
  const [user, setUser] = useState(null);
  const [adminName, setAdminName] = useState('admin');
  const adminNameRef = useRef('admin');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Payment management modals
  const [paymentModal, setPaymentModal] = useState(null);
  const [obsModal, setObsModal] = useState(null);
  const [logModal, setLogModal] = useState(null);
  const [confirmPartialModal, setConfirmPartialModal] = useState(null);
  const [registerInstallment, setRegisterInstallment] = useState(null);

  // Filters
  const [personSearch, setPersonSearch] = useState('');
  const [selectedCeremonies, setSelectedCeremonies] = useState(new Set());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    const name = (user.email || 'admin').split('@')[0];
    setAdminName(name);
    adminNameRef.current = name;
    fetchData();
  }

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase
      .from('event_participants')
      .select('*, contacts(id, name, nickname, phone), events!inner(id, name, date, date2, price_1d, price_2d, active)')
      .not('status', 'eq', 'desistiu');
    const active = (data || []).filter(p => p.events?.active !== false);
    setParticipants(active);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  function fmtLog(entry) {
    if (!entry) return '';
    const d = new Date(entry.at);
    const dt = d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
    return `${dt} — ${entry.by} ${entry.msg}`;
  }

  function newLogEntry(msg, prevState = null) {
    const entry = { at: new Date().toISOString(), by: adminNameRef.current, msg };
    if (prevState) entry.prev = prevState;
    return entry;
  }

  function getParticipant(contactId, eventId) {
    return participants.find(p => p.contact_id === contactId && p.event_id === eventId);
  }

  function getLog(contactId, eventId) {
    return getParticipant(contactId, eventId)?.payment_log || [];
  }

  function updateLocal(contactId, eventId, fields) {
    setParticipants(prev => prev.map(p =>
      p.contact_id === contactId && p.event_id === eventId ? { ...p, ...fields } : p
    ));
  }

  // ── Payment actions ───────────────────────────────────────────────────────
  async function updatePayment(contactId, eventId, paymentStatus, paymentMethod, options = {}) {
    const { installmentCount, discount, applyDiscount, paymentAmount, paymentDate } = options;
    const currentP = getParticipant(contactId, eventId);
    const prevState = currentP ? {
      status: currentP.payment_status || 'em aberto',
      method: currentP.payment_method || null,
      records: currentP.payment_records || [],
      installment_count: currentP.installment_count || null,
      discount: currentP.discount ?? null,
    } : null;

    const updateData = { payment_status: paymentStatus, payment_method: paymentMethod };
    let logMsg = '';
    if (paymentStatus === 'pago') {
      const amount = paymentAmount !== '' && paymentAmount != null ? parseFloat(paymentAmount) : null;
      updateData.payment_records = [{ amount, date: paymentDate || null, cancelled: false }];
      updateData.installment_count = null;
      logMsg = `registrou pagamento via ${paymentMethod || '—'}${amount != null ? ` · $${Number(amount).toFixed(2)}` : ''}${paymentDate ? ` em ${new Date(paymentDate + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}`;
    } else if (paymentStatus === 'parcelado') {
      updateData.installment_count = installmentCount ? parseInt(installmentCount) : null;
      logMsg = `definiu parcelamento em ${installmentCount || '?'}x`;
    } else if (paymentStatus === 'em aberto') {
      updateData.installment_count = null;
      updateData.payment_records = [];
      logMsg = 'reverteu para Em Aberto';
    } else if (paymentStatus === 'a pagar no local') {
      updateData.installment_count = null;
      updateData.payment_records = [];
      logMsg = 'registrou A Pagar no Local';
    } else {
      logMsg = `alterou status para ${paymentStatus}`;
    }
    updateData.discount = applyDiscount && discount !== '' && discount != null ? parseFloat(discount) : null;
    updateData.payment_log = [...getLog(contactId, eventId), newLogEntry(logMsg, prevState)];

    const { error } = await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    if (!error) updateLocal(contactId, eventId, updateData);
  }

  async function revertPayment(contactId, eventId) {
    const log = getLog(contactId, eventId);
    const last = log[log.length - 1];
    if (!last?.prev) return;
    const prev = last.prev;
    const toLabel = { 'em aberto': 'Em Aberto', 'pago': 'Pago', 'a pagar no local': 'No Local', 'parcelado': 'Parcelado', 'conferir pagamento': 'Conferir' }[prev.status || 'em aberto'] || prev.status;
    const updateData = {
      payment_status: prev.status || 'em aberto',
      payment_method: prev.method || null,
      payment_records: prev.records || [],
      installment_count: prev.installment_count || null,
      discount: prev.discount ?? null,
      payment_log: [...log, newLogEntry(`↺ retornou para ${toLabel}`)],
    };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
  }

  async function confirmPayment(contactId, eventId) {
    const today = new Date().toISOString().split('T')[0];
    const p = getParticipant(contactId, eventId);
    const prevState = p ? { status: p.payment_status || 'em aberto', method: p.payment_method || null, records: p.payment_records || [], installment_count: p.installment_count || null, discount: p.discount ?? null } : null;
    const amount = computeExpected(p, participants);
    const updateData = {
      payment_status: 'pago',
      payment_method: 'Câmbio',
      payment_records: [{ amount, date: today, cancelled: false }],
      installment_count: null,
      payment_log: [...getLog(contactId, eventId), newLogEntry('confirmou comprovante — pago via Câmbio', prevState)],
    };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
  }

  async function cancelConferirPayment(contactId, eventId) {
    const p = getParticipant(contactId, eventId);
    const existingUrl = p?.comprovante_url;
    const prevState = p ? { status: p.payment_status || 'em aberto', method: p.payment_method || null, records: p.payment_records || [], installment_count: p.installment_count || null, discount: p.discount ?? null } : null;
    const logMsg = existingUrl
      ? `cancelou comprovante — revertido para Em Aberto · ${existingUrl}`
      : 'cancelou comprovante — revertido para Em Aberto';
    const updateData = { payment_status: 'em aberto', payment_method: null, comprovante_url: null, payment_log: [...getLog(contactId, eventId), newLogEntry(logMsg, prevState)] };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
  }

  async function confirmPartialPayment(contactId, eventId, amount) {
    const p = getParticipant(contactId, eventId);
    const prevState = p ? { status: p.payment_status || 'em aberto', method: p.payment_method || null, records: p.payment_records || [], installment_count: p.installment_count || null, discount: p.discount ?? null } : null;
    const today = new Date().toISOString().split('T')[0];
    const updateData = {
      payment_status: 'parcelado',
      payment_method: 'Câmbio',
      payment_records: [{ amount: parseFloat(amount), date: today, cancelled: false }],
      installment_count: null,
      payment_log: [...getLog(contactId, eventId), newLogEntry(`registrou pagamento parcial de $${Number(amount).toFixed(2)} via Câmbio`, prevState)],
    };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
    setConfirmPartialModal(null);
  }

  async function addInstallmentPayment(contactId, eventId, amount, date) {
    const p = getParticipant(contactId, eventId);
    const existing = p?.payment_records || [];
    const newRecords = [...existing, { amount: parseFloat(amount), date: date || null, cancelled: false }];
    const dateStr = date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    const updateData = { payment_records: newRecords, payment_log: [...getLog(contactId, eventId), newLogEntry(`registrou parcela de $${Number(amount).toFixed(2)}${dateStr ? ` em ${dateStr}` : ''}`)] };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
  }

  async function cancelInstallmentPayment(contactId, eventId, index) {
    const p = getParticipant(contactId, eventId);
    const existing = p?.payment_records || [];
    const rec = existing[index];
    const newRecords = existing.map((r, i) => i === index ? { ...r, cancelled: true } : r);
    const allCancelled = newRecords.every(r => r.cancelled);
    const cancelMsg = `cancelou pagamento${rec?.amount != null ? ` de $${Number(rec.amount).toFixed(2)}` : ''}${allCancelled ? ' — revertido para Em Aberto' : ''}`;
    const updateData = { payment_records: newRecords, payment_log: [...getLog(contactId, eventId), newLogEntry(cancelMsg)] };
    if (allCancelled) updateData.payment_status = 'em aberto';
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
  }

  // ── Merged (cross-ceremony package) action handlers ──────────────────────
  async function confirmPaymentEntry(p) {
    if (!p._merged) { await confirmPayment(p.contact_id, p.event_id); return; }
    const today = new Date().toISOString().split('T')[0];
    const half = p._expectedAmount != null ? p._expectedAmount / 2 : null;
    const doRow = async (rowP) => {
      const actual = getParticipant(rowP.contact_id, rowP.event_id);
      const prevState = actual ? { status: actual.payment_status || 'em aberto', method: actual.payment_method || null, records: actual.payment_records || [], installment_count: actual.installment_count || null, discount: actual.discount ?? null } : null;
      const updateData = { payment_status: 'pago', payment_method: 'Câmbio', payment_records: [{ amount: half, date: today, cancelled: false }], installment_count: null, payment_log: [...(actual?.payment_log || []), newLogEntry('confirmou comprovante — pago via Câmbio (pacote)', prevState)] };
      await supabase.from('event_participants').update(updateData).match({ event_id: rowP.event_id, contact_id: rowP.contact_id });
      updateLocal(rowP.contact_id, rowP.event_id, updateData);
    };
    await Promise.all([doRow(p), doRow(p._secondary)]);
  }

  async function cancelConferirEntry(p) {
    if (!p._merged) { await cancelConferirPayment(p.contact_id, p.event_id); return; }
    const doRow = async (rowP) => {
      const actual = getParticipant(rowP.contact_id, rowP.event_id);
      const existingUrl = actual?.comprovante_url;
      const prevState = actual ? { status: actual.payment_status || 'em aberto', method: actual.payment_method || null, records: actual.payment_records || [], installment_count: actual.installment_count || null, discount: actual.discount ?? null } : null;
      const logMsg = existingUrl ? `cancelou comprovante — revertido para Em Aberto · ${existingUrl}` : 'cancelou comprovante — revertido para Em Aberto';
      const updateData = { payment_status: 'em aberto', payment_method: null, comprovante_url: null, payment_log: [...(actual?.payment_log || []), newLogEntry(logMsg, prevState)] };
      await supabase.from('event_participants').update(updateData).match({ event_id: rowP.event_id, contact_id: rowP.contact_id });
      updateLocal(rowP.contact_id, rowP.event_id, updateData);
    };
    await Promise.all([doRow(p), doRow(p._secondary)]);
  }

  async function confirmPartialEntry(entry, amount) {
    if (!entry._merged) { await confirmPartialPayment(entry.contact_id, entry.event_id, amount); return; }
    const today = new Date().toISOString().split('T')[0];
    const half = parseFloat(amount) / 2;
    const doRow = async (rowP) => {
      const actual = getParticipant(rowP.contact_id, rowP.event_id);
      const prevState = actual ? { status: actual.payment_status || 'em aberto', method: actual.payment_method || null, records: actual.payment_records || [], installment_count: actual.installment_count || null, discount: actual.discount ?? null } : null;
      const updateData = { payment_status: 'parcelado', payment_method: 'Câmbio', payment_records: [{ amount: half, date: today, cancelled: false }], installment_count: null, payment_log: [...(actual?.payment_log || []), newLogEntry(`registrou pagamento parcial de $${Number(half).toFixed(2)} via Câmbio (pacote)`, prevState)] };
      await supabase.from('event_participants').update(updateData).match({ event_id: rowP.event_id, contact_id: rowP.contact_id });
      updateLocal(rowP.contact_id, rowP.event_id, updateData);
    };
    await Promise.all([doRow(entry), doRow(entry._secondary)]);
    setConfirmPartialModal(null);
  }

  async function revertEntry(p) {
    if (!p._merged) { await revertPayment(p.contact_id, p.event_id); return; }
    const doRow = async (rowP) => {
      const actual = getParticipant(rowP.contact_id, rowP.event_id);
      const log = actual?.payment_log || [];
      const last = log[log.length - 1];
      if (!last?.prev) return;
      const prev = last.prev;
      const toLabel = { 'em aberto': 'Em Aberto', 'pago': 'Pago', 'a pagar no local': 'No Local', 'parcelado': 'Parcelado', 'conferir pagamento': 'Conferir' }[prev.status || 'em aberto'] || prev.status;
      const updateData = { payment_status: prev.status || 'em aberto', payment_method: prev.method || null, payment_records: prev.records || [], installment_count: prev.installment_count || null, discount: prev.discount ?? null, payment_log: [...log, newLogEntry(`↺ retornou para ${toLabel}`)] };
      await supabase.from('event_participants').update(updateData).match({ event_id: rowP.event_id, contact_id: rowP.contact_id });
      updateLocal(rowP.contact_id, rowP.event_id, updateData);
    };
    await Promise.all([doRow(p), doRow(p._secondary)]);
  }

  async function updatePaymentMerged(p, paymentStatus, paymentMethod, options = {}) {
    const { installmentCount, discount, applyDiscount, paymentAmount, paymentDate } = options;
    const totalAmt = paymentAmount !== '' && paymentAmount != null ? parseFloat(paymentAmount) : null;
    const half = totalAmt != null ? totalAmt / 2 : null;
    const doRow = async (rowP, amount) => {
      const actual = getParticipant(rowP.contact_id, rowP.event_id);
      const prevState = actual ? { status: actual.payment_status || 'em aberto', method: actual.payment_method || null, records: actual.payment_records || [], installment_count: actual.installment_count || null, discount: actual.discount ?? null } : null;
      const updateData = { payment_status: paymentStatus, payment_method: paymentMethod };
      let logMsg = '';
      if (paymentStatus === 'pago') {
        updateData.payment_records = [{ amount, date: paymentDate || null, cancelled: false }];
        updateData.installment_count = null;
        logMsg = `registrou pagamento via ${paymentMethod || '—'}${amount != null ? ` · $${Number(amount).toFixed(2)}` : ''}${paymentDate ? ` em ${new Date(paymentDate + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''} (pacote)`;
      } else if (paymentStatus === 'parcelado') {
        updateData.installment_count = installmentCount ? parseInt(installmentCount) : null;
        logMsg = `definiu parcelamento em ${installmentCount || '?'}x (pacote)`;
      } else if (paymentStatus === 'em aberto') {
        updateData.installment_count = null; updateData.payment_records = [];
        logMsg = 'reverteu para Em Aberto';
      } else if (paymentStatus === 'a pagar no local') {
        updateData.installment_count = null; updateData.payment_records = [];
        logMsg = 'registrou A Pagar no Local';
      } else { logMsg = `alterou status para ${paymentStatus}`; }
      updateData.discount = applyDiscount && discount !== '' && discount != null ? parseFloat(discount) : null;
      updateData.payment_log = [...(actual?.payment_log || []), newLogEntry(logMsg, prevState)];
      await supabase.from('event_participants').update(updateData).match({ event_id: rowP.event_id, contact_id: rowP.contact_id });
      updateLocal(rowP.contact_id, rowP.event_id, updateData);
    };
    await Promise.all([doRow(p, half), doRow(p._secondary, half)]);
  }

  // ── Filter + display logic ────────────────────────────────────────────────
  const allCeremonies = useMemo(() =>
    [...new Map(participants.map(p => [p.event_id, { id: p.event_id, name: p.events?.name || '—', date: p.events?.date }])).values()]
      .sort((a, b) => (a.date || '').localeCompare(b.date || '')),
    [participants]
  );

  const filtered = useMemo(() => {
    return participants.filter(p => {
      if (selectedCeremonies.size > 0 && !selectedCeremonies.has(p.event_id)) return false;
      if (personSearch) {
        const q = personSearch.toLowerCase();
        const name = (p.contacts?.nickname || p.contacts?.name || '').toLowerCase();
        if (!name.includes(q)) return false;
      }
      if (dateFrom || dateTo) {
        const lastLogAt = p.payment_log?.length ? p.payment_log[p.payment_log.length - 1].at : null;
        if (!lastLogAt) return false;
        const d = lastLogAt.slice(0, 10);
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
      }
      return true;
    });
  }, [participants, selectedCeremonies, personSearch, dateFrom, dateTo]);

  const hasFilters = selectedCeremonies.size > 0 || personSearch || dateFrom || dateTo;

  const displayParticipants = useMemo(() => {
    if (selectedCeremonies.size > 0) return filtered;
    const merged = new Set();
    const result = [];
    for (const p of filtered) {
      const key = `${p.event_id}-${p.contact_id}`;
      if (merged.has(key)) continue;
      const partner = filtered.find(x => {
        if (x.contact_id !== p.contact_id || x.event_id === p.event_id) return false;
        const td = [];
        if (p.date1_confirmed && p.events?.date) td.push(p.events.date);
        if (p.date2_confirmed && p.events?.date2) td.push(p.events.date2);
        const od = [];
        if (x.date1_confirmed && x.events?.date) od.push(x.events.date);
        if (x.date2_confirmed && x.events?.date2) od.push(x.events.date2);
        for (const d1 of td) for (const d2 of od)
          if (Math.abs(new Date(d1) - new Date(d2)) / 86400000 <= 29) return true;
        return false;
      });
      if (partner) {
        merged.add(key);
        merged.add(`${partner.event_id}-${partner.contact_id}`);
        const price2d = p.events?.price_2d ?? partner.events?.price_2d ?? null;
        const combinedLog = [...(p.payment_log || []), ...(partner.payment_log || [])].sort((a, b) => a.at.localeCompare(b.at));
        result.push({
          ...p,
          _merged: true,
          _secondary: partner,
          _ceremonyLabel: `${p.events?.name || '—'} + ${partner.events?.name || '—'}`,
          _expectedAmount: price2d,
          payment_log: combinedLog,
          payment_records: [...(p.payment_records || []), ...(partner.payment_records || [])],
          comprovante_url: p.comprovante_url || partner.comprovante_url,
          payment_observation: p.payment_observation || partner.payment_observation,
        });
      } else {
        result.push(p);
      }
    }
    return result;
  }, [filtered, selectedCeremonies]);

  const totalPago      = displayParticipants.filter(p => p.payment_status === 'pago').length;
  const totalParcelado = displayParticipants.filter(p => p.payment_status === 'parcelado').length;
  const totalNoLocal   = displayParticipants.filter(p => p.payment_status === 'a pagar no local').length;
  const totalConferir  = displayParticipants.filter(p => p.payment_status === 'conferir pagamento').length;
  const totalAberto    = displayParticipants.filter(p => !p.payment_status || p.payment_status === 'em aberto').length;

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '5rem', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.1em' }}>
      Verificando acesso...
    </div>
  );

  // ── Payment modal participant ─────────────────────────────────────────────
  const pmP = paymentModal ? getParticipant(paymentModal.contactId, paymentModal.eventId) : null;
  const discountVal = paymentModal?.applyDiscount ? paymentModal.discount : '';
  const canSave = paymentModal?.status !== 'pago' || (!!paymentModal?.method && !!paymentModal?.paymentDate);

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <a href="/" style={s.navBrand}>Journey<span style={{ color: '#4a7a5a' }}>.</span></a>
        <div style={s.navLinks}>
          <a href="/" style={s.navLink}><PersonIcon />{!isMobile && ' Pessoas'}</a>
          <a href="/events" style={s.navLink}><PlantIcon />{!isMobile && ' Cerimônias'}</a>
          <a href="/pagamentos" style={{ ...s.navLink, ...s.navLinkActive }}><CoinNavIcon />{!isMobile && ' Pagamentos'}</a>
          <a href="/diario" style={s.navLink}><DiarioNavIcon />{!isMobile && ' Diário'}</a>
          <a href="/settings/users" style={{ ...s.navLink, color: '#6a6258' }} title="Gestão de usuários"><GearIcon /></a>
          <button onClick={handleLogout} style={{ ...s.navLink, background: 'none', border: '0.5px dashed #5a5248', padding: '4px 10px', cursor: 'pointer' }}>sair</button>
        </div>
      </nav>

      <div style={s.content}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '0.5px solid #d0cbc2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: '36px', fontWeight: 400, color: '#3a3530', margin: '0 0 0.5rem' }}>Pagamentos</h1>
            <button onClick={() => setFiltersOpen(f => !f)}
              style={{ background: 'none', border: `0.5px ${hasFilters ? 'solid #5d9470' : 'dashed #b0a898'}`, borderRadius: '2px', color: hasFilters ? '#5d9470' : '#9a9288', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 10px', marginTop: '6px', flexShrink: 0 }}>
              {hasFilters ? '● filtros' : '○ filtros'}
            </button>
          </div>
          {!loading && (
            <div style={{ fontSize: '10px', color: '#b0a898', letterSpacing: '0.06em', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: '#5d9470' }}>◉ {totalPago}</span>·
              <span style={{ color: '#7a68a4' }}>◑ {totalParcelado}</span>·
              <span style={{ color: '#8a7a58' }}>◐ {totalNoLocal}</span>·
              <span style={{ color: '#c4892a' }}>? {totalConferir}</span>·
              <span>◎ {totalAberto}</span>
            </div>
          )}
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div style={{ background: '#fdfbf7', border: '0.5px solid #d0cbc2', borderRadius: '2px', padding: '1.2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9288', marginBottom: '0.5rem' }}>Pessoa</div>
                <input value={personSearch} onChange={e => setPersonSearch(e.target.value)} placeholder="buscar por nome..."
                  style={{ width: '100%', padding: '7px 10px', background: '#f7f4ee', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9288', marginBottom: '0.5rem' }}>Intervalo de log</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    style={{ flex: 1, padding: '7px 6px', background: '#f7f4ee', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', outline: 'none' }} />
                  <span style={{ color: '#b0a898', fontSize: '10px' }}>—</span>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    style={{ flex: 1, padding: '7px 6px', background: '#f7f4ee', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', outline: 'none' }} />
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9288', marginBottom: '0.5rem' }}>Cerimônia</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {allCeremonies.map(c => {
                  const checked = selectedCeremonies.has(c.id);
                  return (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '4px 8px', background: checked ? '#f0f5f1' : '#f7f4ee', border: `0.5px ${checked ? 'solid #5d9470' : 'dashed #c8c2b8'}`, borderRadius: '2px' }}>
                      <input type="checkbox" checked={checked}
                        onChange={() => {
                          setSelectedCeremonies(prev => {
                            const next = new Set(prev);
                            checked ? next.delete(c.id) : next.add(c.id);
                            return next;
                          });
                        }}
                        style={{ accentColor: '#5d9470', margin: 0 }} />
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: checked ? '#3a5040' : '#7a7268' }}>{c.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            {hasFilters && (
              <button onClick={() => { setPersonSearch(''); setSelectedCeremonies(new Set()); setDateFrom(''); setDateTo(''); }}
                style={{ marginTop: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#9a9288', letterSpacing: '0.1em', textTransform: 'uppercase', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                limpar filtros
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#aaa49c', fontSize: '12px', letterSpacing: '0.08em' }}>carregando...</div>
        ) : displayParticipants.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#aaa49c', fontSize: '12px', letterSpacing: '0.08em', fontStyle: 'italic' }}>
            {hasFilters ? 'nenhum resultado para os filtros selecionados.' : 'nenhum participante em cerimônias ativas.'}
          </div>
        ) : (
          STATUS_GROUPS.map(({ key, label, icon, color }) => {
            const group = displayParticipants.filter(p => (p.payment_status || 'em aberto') === key);
            const isConferir = key === 'conferir pagamento';
            const isParcelado = key === 'parcelado';
            const isPago = key === 'pago';

            return (
              <div key={key} style={{ marginBottom: '2.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.9rem', paddingBottom: '0.5rem', borderBottom: `0.5px solid ${color}` }}>
                  <span style={{ color, fontSize: '16px' }}>{icon}</span>
                  <span style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color, fontWeight: 'bold' }}>{label}</span>
                  <span style={{ fontSize: '10px', color: '#b0a898', marginLeft: '2px' }}>({group.length})</span>
                </div>

                {group.length === 0 ? (
                  <div style={{ fontSize: '10px', color: '#c0b8b0', fontStyle: 'italic', padding: '0.4rem 0' }}>nenhum</div>
                ) : group.map(p => {
                  const name = p.contacts?.nickname || p.contacts?.name || '—';
                  const ceremonyName = p.events?.name || '—';
                  const records = p.payment_records || [];
                  const expectedAmount = p._merged ? p._expectedAmount : computeExpected(p, participants);
                  const paidSoFar = records.filter(r => !r.cancelled).reduce((s, r) => s + (r.amount || 0), 0);
                  const owed = expectedAmount != null ? Math.max(0, expectedAmount - paidSoFar) : null;
                  const isCross = !p._merged && (() => {
                    const others = participants.filter(x => x.contact_id === p.contact_id && x.event_id !== p.event_id && x.events?.active !== false);
                    const thisDays = [];
                    if (p.date1_confirmed && p.events?.date) thisDays.push(p.events.date);
                    if (p.date2_confirmed && p.events?.date2) thisDays.push(p.events.date2);
                    for (const op of others) {
                      const od = [];
                      if (op.date1_confirmed && op.events?.date) od.push(op.events.date);
                      if (op.date2_confirmed && op.events?.date2) od.push(op.events.date2);
                      for (const d1 of thisDays) for (const d2 of od)
                        if (Math.abs(new Date(d1) - new Date(d2)) / 86400000 <= 29) return true;
                    }
                    return false;
                  })();

                  const CeremonyTag = () => (
                    <span style={{ fontSize: '9px', letterSpacing: '0.08em', color: (p._merged || isCross) ? '#7a68a4' : '#9a9288', background: (p._merged || isCross) ? '#f0eef8' : '#f0ece6', border: `0.5px solid ${(p._merged || isCross) ? '#c8b8e8' : '#d0cbc2'}`, borderRadius: '2px', padding: '1px 6px', fontStyle: 'italic', flexShrink: 0 }}>
                      {p._merged ? p._ceremonyLabel : ceremonyName}{!p._merged && isCross ? ' ½' : ''}
                    </span>
                  );

                  const openPaymentModal = () => setPaymentModal({
                    contactId: p.contact_id,
                    eventId: p.event_id,
                    merged: p._merged || false,
                    mergedEntry: p._merged ? p : null,
                    status: p.payment_status || 'em aberto',
                    method: p.payment_method || null,
                    installmentCount: p.installment_count || '',
                    discount: p.discount != null ? String(p.discount) : '',
                    applyDiscount: p.discount != null,
                    paymentRecords: p.payment_records || [],
                    paymentAmount: expectedAmount != null ? String(expectedAmount) : '',
                    paymentDate: '',
                  });

                  if (isConferir) {
                    return (
                      <div key={`${p.event_id}-${p.contact_id}`} style={{ marginBottom: '12px', border: '0.5px solid #e8b87a', borderRadius: '2px', background: '#fefaf3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', borderBottom: '0.5px dashed #e8b87a', cursor: 'pointer' }} onClick={openPaymentModal}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530' }}>{name}</span>
                            <CeremonyTag />
                          </div>
                          {expectedAmount != null && (
                            <span style={{ fontSize: '10px', color: '#c4892a', fontFamily: "'Courier Prime', monospace", flexShrink: 0, marginLeft: '10px' }}>
                              $ {Number(expectedAmount).toFixed(2)} esperado
                            </span>
                          )}
                        </div>
                        {p.comprovante_url && (
                          <div style={{ padding: '0.4rem 1rem', borderBottom: '0.5px dashed #e8b87a' }}>
                            <a href={p.comprovante_url} target="_blank" rel="noreferrer"
                              style={{ fontSize: '10px', color: '#5d9470', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.04em', textDecoration: 'underline' }}
                              onClick={e => e.stopPropagation()}>
                              📎 ver comprovante
                            </a>
                          </div>
                        )}
                        {p.payment_observation && (
                          <div style={{ padding: '0.4rem 1rem', borderBottom: '0.5px dashed #e8b87a', fontSize: '10px', color: '#6a5a40', fontFamily: "'Courier Prime', monospace", fontStyle: 'italic', lineHeight: 1.5 }}>
                            "{p.payment_observation}"
                          </div>
                        )}
                        <div style={{ padding: '0.6rem 1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button onClick={e => { e.stopPropagation(); confirmPaymentEntry(p); }}
                              style={{ padding: '6px 10px', background: '#5d9470', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              ✓ Câmbio Total
                            </button>
                            <button onClick={e => { e.stopPropagation(); setConfirmPartialModal({ entry: p, amount: '' }); }}
                              style={{ padding: '6px 10px', background: '#7a68a4', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              ◑ Parcial
                            </button>
                            <button onClick={e => { e.stopPropagation(); if (confirm('Cancelar comprovante e reverter para Em Aberto?')) cancelConferirEntry(p); }}
                              style={{ padding: '6px 10px', background: 'transparent', color: '#c0392b', border: '0.5px solid #e8b0b0', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              ✕ Cancelar
                            </button>
                          </div>
                          {confirmPartialModal?.entry?.contact_id === p.contact_id && confirmPartialModal?.entry?.event_id === p.event_id && (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '6px 0' }}>
                              <input type="number" min="0" step="0.01" value={confirmPartialModal.amount}
                                onChange={e => setConfirmPartialModal(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="Valor recebido (USD)" autoFocus
                                style={{ flex: 1, padding: '5px 8px', background: '#faf7f0', border: '0.5px solid #b8a8d8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', outline: 'none' }} />
                              <button onClick={e => { e.stopPropagation(); if (confirmPartialModal.amount) confirmPartialEntry(confirmPartialModal.entry, confirmPartialModal.amount); }}
                                style={{ padding: '5px 12px', background: '#7a68a4', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}>ok</button>
                              <button onClick={e => { e.stopPropagation(); setConfirmPartialModal(null); }}
                                style={{ padding: '5px 8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}>×</button>
                            </div>
                          )}
                          {(p.payment_log?.length > 0) && (
                            <LogFooter log={p.payment_log} fmtLog={fmtLog}
                              onOpenModal={() => setLogModal({ name, log: p.payment_log })}
                              onRevert={() => revertEntry(p)} />
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={`${p.event_id}-${p.contact_id}`} style={{ marginBottom: '10px' }}>
                      <div onClick={openPaymentModal}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', background: '#fdfbf7', border: '0.5px solid #d0cbc2', borderRadius: records.length > 0 && (isParcelado || isPago) ? '2px 2px 0 0' : '2px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530', flexShrink: 0 }}>{name}</span>
                          <CeremonyTag />
                          {p.payment_observation && (
                            <button onClick={e => { e.stopPropagation(); setObsModal({ name, text: p.payment_observation }); }}
                              title="Ver observação"
                              style={{ background: 'none', border: '0.5px solid #d0cbc2', borderRadius: '2px', cursor: 'pointer', padding: '1px 5px', fontFamily: "'Courier Prime', monospace", fontSize: '8px', letterSpacing: '0.08em', color: '#9a9288', textTransform: 'uppercase', lineHeight: 1.6, flexShrink: 0 }}>
                              obs
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0, marginLeft: '10px' }}>
                          {!isPago && owed != null && (
                            <span style={{ fontSize: '10px', color: '#b0a898', letterSpacing: '0.04em', fontFamily: "'Courier Prime', monospace" }}>$ {Number(owed).toFixed(2)}</span>
                          )}
                          {isParcelado && p.installment_count > 0 && (
                            <span style={{ fontSize: '9px', color: '#7a68a4', letterSpacing: '0.04em' }}>{records.filter(r => !r.cancelled).length}/{p.installment_count} parcelas</span>
                          )}
                          {isPago && p.payment_method && (
                            <span style={{ fontSize: '9px', color: '#9a9288', letterSpacing: '0.06em' }}>via {p.payment_method}</span>
                          )}
                          {isPago && p.discount != null && (
                            <span style={{ fontSize: '9px', color: '#8a7a58' }}>desc. $ {Number(p.discount).toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      {(isParcelado || isPago) && records.map((rec, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', background: rec.cancelled ? '#f5f0f0' : '#f5f0f8', borderLeft: '0.5px solid #d0cbc2', borderRight: '0.5px solid #d0cbc2', borderBottom: '0.5px dashed #d0cbc2' }}>
                          <span style={{ flex: 1, fontSize: '11px', color: rec.cancelled ? '#c0b8b0' : '#3a3530', textDecoration: rec.cancelled ? 'line-through' : 'none', fontFamily: "'Courier Prime', monospace" }}>
                            {rec.amount != null ? `$ ${Number(rec.amount).toFixed(2)}` : '—'}
                            {rec.date ? ` · ${new Date(rec.date + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}
                            {rec.cancelled ? ' (cancelado)' : ''}
                          </span>
                          {!rec.cancelled && (
                            <button onClick={e => { e.stopPropagation(); cancelInstallmentPayment(p.contact_id, p.event_id, i); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8a8a8', fontSize: '14px', padding: '0 2px', lineHeight: 1 }} title="Cancelar">×</button>
                          )}
                        </div>
                      ))}

                      {isParcelado && (
                        <div style={{ borderLeft: '0.5px solid #d0cbc2', borderRight: '0.5px solid #d0cbc2', borderBottom: '0.5px solid #d0cbc2', borderRadius: '0 0 2px 2px', background: '#fdfbf7' }}>
                          {registerInstallment?.contactId === p.contact_id && registerInstallment?.eventId === p.event_id ? (
                            <div style={{ padding: '0.6rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                              <div>
                                <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>Valor (USD)</div>
                                <input type="number" min="0" step="0.01" value={registerInstallment.amount}
                                  onChange={e => setRegisterInstallment(prev => ({ ...prev, amount: e.target.value }))}
                                  placeholder="0.00" autoFocus
                                  style={{ width: '80px', padding: '5px 7px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', outline: 'none' }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>Data</div>
                                <input type="date" value={registerInstallment.date}
                                  onChange={e => setRegisterInstallment(prev => ({ ...prev, date: e.target.value }))}
                                  style={{ padding: '5px 7px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', outline: 'none' }} />
                              </div>
                              <button onClick={() => { if (!registerInstallment.amount || !registerInstallment.date) return; addInstallmentPayment(p.contact_id, p.event_id, registerInstallment.amount, registerInstallment.date); setRegisterInstallment(null); }}
                                style={{ padding: '5px 12px', background: '#7a68a4', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ok</button>
                              <button onClick={() => setRegisterInstallment(null)}
                                style={{ padding: '5px 8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}>×</button>
                            </div>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setRegisterInstallment({ contactId: p.contact_id, eventId: p.event_id, amount: '', date: '' }); }}
                              style={{ width: '100%', padding: '0.45rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a68a4', textAlign: 'left' }}>
                              + registrar parcela
                            </button>
                          )}
                        </div>
                      )}

                      {(p.payment_log?.length > 0) && (
                        <div style={{ borderLeft: '0.5px solid #d0cbc2', borderRight: '0.5px solid #d0cbc2', borderBottom: '0.5px solid #d0cbc2', borderRadius: '0 0 2px 2px', padding: '0.35rem 1rem' }}>
                          <LogFooter log={p.payment_log} fmtLog={fmtLog}
                            onOpenModal={() => setLogModal({ name, log: p.payment_log })}
                            onRevert={() => revertEntry(p)} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Payment modal */}
      {paymentModal && pmP && (() => {
        return (
          <div onClick={() => setPaymentModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '340px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace", maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ padding: '1.2rem 1.5rem 0.9rem', borderBottom: '0.5px solid #d0cbc2' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Registro de pagamento</div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#3a3530', lineHeight: 1.1 }}>{pmP.contacts?.nickname || pmP.contacts?.name}</div>
                <div style={{ fontSize: '9px', color: '#aaa49c', marginTop: '2px', fontStyle: 'italic' }}>{paymentModal.merged ? paymentModal.mergedEntry._ceremonyLabel : pmP.events?.name}</div>
              </div>
              <div style={{ padding: '1rem 1.5rem 0' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Status</div>
                {paymentModal.status === 'conferir pagamento' && (
                  <div style={{ padding: '6px 10px', background: '#fef8f0', border: '0.5px solid #e8b87a', borderRadius: '2px', fontSize: '10px', color: '#c4892a', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    ? conferir pagamento — definido pelo viajante.
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[
                    { val: 'em aberto', icon: '◎', color: '#b0a898' },
                    { val: 'pago', icon: '◉', color: '#5d9470' },
                    { val: 'a pagar no local', icon: '◐', color: '#8a7a58' },
                    { val: 'parcelado', icon: '◑', color: '#7a68a4' },
                  ].map(opt => (
                    <button key={opt.val} onClick={() => setPaymentModal(prev => ({ ...prev, status: opt.val, method: opt.val !== 'pago' ? null : prev.method }))}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: paymentModal.status === opt.val ? '#faf7f0' : 'transparent', border: paymentModal.status === opt.val ? '0.5px solid #b8b0a4' : '0.5px dashed #d0cbc2', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '11px', letterSpacing: '0.04em', color: opt.color, textAlign: 'left', width: '100%' }}>
                      <span style={{ fontSize: '14px' }}>{opt.icon}</span>
                      {opt.val}
                      {paymentModal.status === opt.val && <span style={{ marginLeft: 'auto', color: '#3a3530' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
              {paymentModal.status === 'parcelado' && (
                <div style={{ padding: '1rem 1.5rem 0' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Nº de parcelas</div>
                  <input type="number" min="2" max="99" value={paymentModal.installmentCount}
                    onChange={e => setPaymentModal(prev => ({ ...prev, installmentCount: e.target.value }))}
                    placeholder="Ex: 3"
                    style={{ width: '120px', padding: '7px 8px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none' }} />
                </div>
              )}
              {paymentModal.status === 'pago' && (
                <div style={{ padding: '1rem 1.5rem 0' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Forma de pagamento</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem' }}>
                    {['Câmbio', 'PIX', 'Wise', 'Espécie'].map(m => (
                      <button key={m} onClick={() => setPaymentModal(prev => ({ ...prev, method: m, applyDiscount: m === 'Espécie' ? prev.applyDiscount : false, discount: m === 'Espécie' ? (prev.discount || '50.00') : '' }))}
                        style={{ padding: '6px 10px', background: paymentModal.method === m ? '#3a3530' : 'transparent', border: paymentModal.method === m ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: paymentModal.method === m ? '#f7f4ee' : '#7a7268' }}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Valor (USD)</div>
                      <input type="number" min="0" step="0.01" value={paymentModal.paymentAmount}
                        onChange={e => setPaymentModal(prev => ({ ...prev, paymentAmount: e.target.value }))}
                        placeholder="0.00"
                        style={{ width: '100%', padding: '7px 8px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Data *</div>
                      <input type="date" value={paymentModal.paymentDate}
                        onChange={e => setPaymentModal(prev => ({ ...prev, paymentDate: e.target.value }))}
                        style={{ width: '100%', padding: '7px 8px', background: '#faf7f0', border: `0.5px solid ${paymentModal.paymentDate ? '#c8c2b8' : '#e8a0a0'}`, borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                  </div>
                  {paymentModal.method === 'Espécie' && (
                    <div style={{ marginTop: '0.8rem', padding: '0.7rem 0.9rem', background: '#faf7f0', border: '0.5px solid #d0cbc2', borderRadius: '2px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!paymentModal.applyDiscount}
                          onChange={e => setPaymentModal(prev => ({ ...prev, applyDiscount: e.target.checked, discount: e.target.checked ? (prev.discount || '50.00') : '' }))}
                          style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a7268' }}>Aplicar desconto?</span>
                      </label>
                      {paymentModal.applyDiscount && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#7a7268' }}>USD</span>
                          <input type="number" min="0" step="0.01" value={paymentModal.discount}
                            onChange={e => setPaymentModal(prev => ({ ...prev, discount: e.target.value }))}
                            style={{ width: '90px', padding: '5px 8px', background: '#fff', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none' }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div style={{ padding: '1rem 1.5rem 1.2rem', display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
                <button onClick={() => { if (!canSave) return; const opts = { installmentCount: paymentModal.installmentCount, discount: discountVal, applyDiscount: paymentModal.applyDiscount, paymentAmount: paymentModal.paymentAmount, paymentDate: paymentModal.paymentDate }; if (paymentModal.merged && paymentModal.mergedEntry) { updatePaymentMerged(paymentModal.mergedEntry, paymentModal.status, paymentModal.method, opts); } else { updatePayment(paymentModal.contactId, paymentModal.eventId, paymentModal.status, paymentModal.method, opts); } setPaymentModal(null); }}
                  disabled={!canSave}
                  style={{ flex: 1, padding: '8px', background: canSave ? '#3a3530' : '#d0cbc2', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  salvar
                </button>
                <button onClick={() => setPaymentModal(null)}
                  style={{ padding: '8px 14px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  cancelar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* OBS modal */}
      {obsModal && (
        <div onClick={() => setObsModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '340px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace" }}>
            <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '18px', color: '#3a3530', marginBottom: '0.8rem' }}>{obsModal.name}</div>
            <p style={{ fontSize: '12px', color: '#5a5048', fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 1rem' }}>"{obsModal.text}"</p>
            <button onClick={() => setObsModal(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>fechar</button>
          </div>
        </div>
      )}

      {/* Log modal */}
      {logModal && (
        <div onClick={() => setLogModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace", maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.5rem 0.8rem', borderBottom: '0.5px solid #d0cbc2', flexShrink: 0 }}>
              <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '18px', color: '#3a3530' }}>{logModal.name}</div>
              <div style={{ fontSize: '9px', color: '#aaa49c', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>histórico de pagamento</div>
            </div>
            <div style={{ overflowY: 'auto', padding: '0.8rem 1.5rem', flex: 1 }}>
              {[...logModal.log].reverse().map((entry, i) => (
                <div key={i} style={{ padding: '0.5rem 0', borderBottom: '0.5px dashed #d0cbc2' }}>
                  <div style={{ fontSize: '10px', color: '#3a3530', lineHeight: 1.5 }}>{entry.msg}</div>
                  <div style={{ fontSize: '9px', color: '#aaa49c', marginTop: '1px' }}>{fmtLog(entry).split(' — ')[0]}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0.8rem 1.5rem', borderTop: '0.5px solid #d0cbc2', flexShrink: 0 }}>
              <button onClick={() => setLogModal(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
