'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { computeExpected, findPairPartner, soloExpected } from '@/lib/paymentCalc';
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
  { key: 'transferido',        label: 'Transferido',        icon: '⇄', color: '#5d8a9a' },
  { key: 'pago',               label: 'Pago',               icon: '◉', color: '#5d9470' },
];

const sortByName = (a, b) => (a.contacts?.nickname || a.contacts?.name || '').localeCompare(b.contacts?.nickname || b.contacts?.name || '', 'pt-BR');

// Junta os logs de várias fontes (pagamento da linha + log de cada transferência ligada a ela)
// em uma única timeline — um ícone só no nome em vez de um link "histórico" por linha.
function combineLogs(...lists) {
  return lists.flat().filter(Boolean).sort((a, b) => new Date(a.at) - new Date(b.at));
}

// Dias em que a pessoa está realmente inscrita (não o nome da cerimônia) — uma pessoa pareada
// entre 2 cerimônias só tem 1 dia confirmado em cada, então o nome completo da cerimônia ("16 e
// 17 de julho") seria enganoso.
function getEnrolledDaysLabel(rows) {
  const days = [];
  rows.forEach(row => {
    if (row.date1_confirmed && row.events?.date) days.push(row.events.date);
    if (row.date2_confirmed && row.events?.date2) days.push(row.events.date2);
    if (row.date3_confirmed && row.events?.date3) days.push(row.events.date3);
  });
  days.sort();
  const fmt = days.map(d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }));
  if (fmt.length === 0) return '—';
  if (fmt.length === 1) return fmt[0];
  return `${fmt.slice(0, -1).join(', ')} e ${fmt[fmt.length - 1]}`;
}

const WaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

function HistoryIcon({ onClick }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} title="Histórico"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '13px', color: '#9a9288', lineHeight: 1, flexShrink: 0 }}>
      ↺
    </button>
  );
}

function TransferLine({ t, direction, isLast, onCancel }) {
  const out = direction === 'out';
  const otherName = out ? (t.to_contact?.nickname || t.to_contact?.name || '—') : (t.from_contact?.nickname || t.from_contact?.name || '—');
  const color = out ? '#b07a4a' : '#5d8a6a';
  const bg = out ? '#fbf3ea' : '#eef6f0';
  const border = out ? '#e0c8a8' : '#bcdfc8';
  const statusLabel = t.status === 'pago' ? 'pago' : t.status === 'a pagar no local' ? 'no local' : t.status === 'conferir pagamento' ? 'conferir' : 'pendente';
  return (
    <div style={{ background: bg, borderLeft: `0.5px solid ${border}`, borderRight: `0.5px solid ${border}`, borderBottom: isLast ? `0.5px solid ${border}` : `0.5px dashed ${border}`, borderRadius: isLast ? '0 0 2px 2px' : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: t.observation ? '0.4rem 1rem 1px' : '0.4rem 1rem' }}>
        <span style={{ flex: 1, fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em' }}>
          {out ? '↗ transferido para' : '↙ transferido de'} {otherName} · {statusLabel}
        </span>
        <span style={{ fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", flexShrink: 0 }}>
          {out ? '-' : '+'}$ {Number(t.amount).toFixed(2)}
        </span>
        <button onClick={e => { e.stopPropagation(); onCancel(); }} title="Cancelar transferência"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8a8a8', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>
      </div>
      {t.observation && (
        <div style={{ padding: '0 1rem 0.4rem', fontSize: '9px', color, fontStyle: 'italic', opacity: 0.85 }}>
          "{t.observation}"
        </div>
      )}
    </div>
  );
}

// Marca o "pago" de uma transferência como uma linha de registro, igual a um payment_record —
// o × aqui desfaz só essa confirmação (volta a transferência para pendente), sem cancelar a
// transferência/dívida em si, que continua tendo seu próprio × no TransferLine acima.
function TransferPaidLine({ date, method, amount, isLast, onUndo }) {
  const dateStr = date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR') : '';
  return (
    <div style={{ background: '#eef6f0', borderLeft: '0.5px solid #bcdfc8', borderRight: '0.5px solid #bcdfc8', borderBottom: isLast ? '0.5px solid #bcdfc8' : '0.5px dashed #bcdfc8', borderRadius: isLast ? '0 0 2px 2px' : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem' }}>
        <span style={{ flex: 1, fontSize: '10px', color: '#5d9470', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em' }}>
          pagamento{dateStr ? ` em ${dateStr}` : ''}{method ? ` via ${method}` : ''}
        </span>
        {amount != null && (
          <span style={{ fontSize: '10px', color: '#5d9470', fontFamily: "'Courier Prime', monospace", flexShrink: 0 }}>$ {Number(amount).toFixed(2)}</span>
        )}
        <button onClick={e => { e.stopPropagation(); onUndo(); }} title="Desfazer pagamento"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8a8a8', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}

function DiscountLine({ amount, isLast, onCancel }) {
  const color = '#a08850';
  const bg = '#fdf6ea';
  const border = '#e8d8b0';
  return (
    <div style={{ background: bg, borderLeft: `0.5px solid ${border}`, borderRight: `0.5px solid ${border}`, borderBottom: isLast ? `0.5px solid ${border}` : `0.5px dashed ${border}`, borderRadius: isLast ? '0 0 2px 2px' : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem' }}>
        <span style={{ flex: 1, fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em' }}>◐ desconto</span>
        <span style={{ fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", flexShrink: 0 }}>-$ {Number(amount).toFixed(2)}</span>
        <button onClick={e => { e.stopPropagation(); onCancel(); }} title="Remover desconto"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8a8a8', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}

function BaseLine({ label, amount }) {
  return (
    <div style={{ background: '#f3f1ec', borderLeft: '0.5px solid #d0cbc2', borderRight: '0.5px solid #d0cbc2', borderBottom: '0.5px dashed #d0cbc2' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem' }}>
        <span style={{ flex: 1, fontSize: '10px', color: '#9a9288', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em', fontStyle: 'italic' }}>
          ⛯ {label}
        </span>
        <span style={{ fontSize: '10px', color: '#9a9288', fontFamily: "'Courier Prime', monospace", flexShrink: 0 }}>
          $ {Number(amount).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function PaymentRecordLine({ rec, isLast, onCancel, onConfirm }) {
  const dateStr = rec.date ? new Date(rec.date + 'T12:00:00').toLocaleDateString('pt-BR') : null;
  const bg = rec.pledge ? '#fbf6ec' : '#eef3ef';
  const color = rec.pledge ? '#8a7a58' : '#5d8a6a';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', background: bg, borderLeft: '0.5px solid #d0cbc2', borderRight: '0.5px solid #d0cbc2', borderBottom: isLast ? '0.5px solid #d0cbc2' : '0.5px dashed #d0cbc2', borderRadius: isLast ? '0 0 2px 2px' : 0 }}>
      <span style={{ flex: 1, fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em' }}>
        {rec.pledge ? 'a pagar no local' : `pagamento${dateStr ? ` em ${dateStr}` : ''}${rec.method ? ` via ${rec.method}` : ''}`}
      </span>
      <span style={{ fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", flexShrink: 0 }}>
        -$ {rec.amount != null ? Number(rec.amount).toFixed(2) : '—'}
      </span>
      {rec.pledge && onConfirm && (
        <button onClick={e => { e.stopPropagation(); onConfirm(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5d9470', fontSize: '12px', padding: '0 2px', lineHeight: 1 }} title="Confirmar recebimento">✓</button>
      )}
      <button onClick={e => { e.stopPropagation(); onCancel(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8a8a8', fontSize: '14px', padding: '0 2px', lineHeight: 1 }} title="Excluir">×</button>
    </div>
  );
}

function ResumoMetric({ label, count, total, groups, categories, expandKey, expanded, onToggle, showAmountPer = null, color = '#3a3530' }) {
  const isOpen = expanded.has(expandKey);
  const hasContent = categories ? categories.length > 0 : groups.length > 0;
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <div onClick={() => hasContent && onToggle(expandKey)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', cursor: hasContent ? 'pointer' : 'default', borderBottom: '0.5px dashed #e8e2d6' }}>
        <span style={{ fontSize: '11px', color, letterSpacing: '0.02em' }}>
          {hasContent && (
            <span style={{ display: 'inline-block', marginRight: '6px', fontSize: '9px', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>▾</span>
          )}
          {label} <span style={{ color: '#aaa49c' }}>({count})</span>
        </span>
        <span style={{ fontSize: '12px', color, fontFamily: "'Courier Prime', monospace" }}>$ {Number(total).toFixed(2)}</span>
      </div>
      {isOpen && hasContent && (
        <div style={{ padding: '4px 0 6px 1.4rem', borderLeft: '0.5px dashed #d0cbc2', marginLeft: '4px' }}>
          {categories ? categories.map((cat, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '9px', color: '#aaa49c', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 0' }}>{cat.label}</div>
              {cat.names.map((nm, j) => (
                <div key={j} style={{ fontSize: '10px', color: '#7a7268', padding: '2px 0 2px 0.6rem' }}>{nm}</div>
              ))}
            </div>
          )) : groups.map((g, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#7a7268', padding: '2px 0' }}>
              <span>{g.name}</span>
              {showAmountPer && <span style={{ fontFamily: "'Courier Prime', monospace" }}>$ {Number(g[showAmountPer] || 0).toFixed(2)}</span>}
            </div>
          ))}
        </div>
      )}
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
  const [modalAction, setModalAction] = useState(null); // 'parcelado' | 'local' | 'payment' | 'discount' | null
  const [orphanModal, setOrphanModal] = useState(null);
  const [obsModal, setObsModal] = useState(null);
  const [logModal, setLogModal] = useState(null);
  const [contactsList, setContactsList] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [orphanPayments, setOrphanPayments] = useState([]);
  const [transferModal, setTransferModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState(new Set());
  const [resumoModal, setResumoModal] = useState(false);
  const [resumoCeremonies, setResumoCeremonies] = useState(new Set());
  const [resumoExpanded, setResumoExpanded] = useState(new Set());

  // Filters
  const [personSearch, setPersonSearch] = useState('');
  const [selectedCeremonies, setSelectedCeremonies] = useState([]);
  const toggleCeremony = id => setSelectedCeremonies(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const [ceremoniesOpen, setCeremoniesOpen] = useState(false);
  const ceremoniesRef = useRef(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { checkUser(); }, []);
  useEffect(() => {
    if (!ceremoniesOpen) return;
    const handler = e => { if (ceremoniesRef.current && !ceremoniesRef.current.contains(e.target)) setCeremoniesOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ceremoniesOpen]);

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
    const [{ data }, { data: contactsData }, { data: transfersData }, { data: orphanPaymentsData }] = await Promise.all([
      supabase
        .from('event_participants')
        .select('*, contacts(id, name, nickname, phone), events!inner(id, name, date, date2, date3, price_1d, price_2d, active, payment_text, linked_event_id, disable_auto_pair)')
        .not('status', 'eq', 'desistiu')
        .is('interested_at', null),
      supabase.from('contacts').select('id, name, nickname').order('name'),
      supabase
        .from('payment_transfers')
        .select('*, from_contact:contacts!from_contact_id(id,name,nickname), to_contact:contacts!to_contact_id(id,name,nickname), events(id,name,date,date2,date3,active,linked_event_id,disable_auto_pair)')
        .eq('cancelled', false),
      supabase.from('orphan_payments').select('*').eq('cancelled', false),
    ]);
    const active = (data || []).filter(p => p.events?.active !== false && (p.date1_confirmed || p.date2_confirmed || p.date3_confirmed));
    setParticipants(active);
    setContactsList(contactsData || []);
    setTransfers((transfersData || []).filter(t => t.events?.active !== false));
    setOrphanPayments(orphanPaymentsData || []);
    setLoading(false);
  }

  // ── Transfer actions ──────────────────────────────────────────────────────
  async function createTransfer() {
    const { fromContactId, fromName, eventId, toContactId, amount, observation } = transferModal;
    if (!toContactId || !amount) return;
    const toName = contactsList.find(c => c.id === toContactId)?.name || '—';
    const logEntry = newLogEntry(`criou transferência de $${Number(amount).toFixed(2)} de ${fromName || '—'} para ${toName}`);
    const { data, error } = await supabase
      .from('payment_transfers')
      .insert({
        event_id: eventId,
        from_contact_id: fromContactId,
        to_contact_id: toContactId,
        amount: parseFloat(amount),
        observation: observation || null,
        log: [logEntry],
      })
      .select('*, from_contact:contacts!from_contact_id(id,name,nickname), to_contact:contacts!to_contact_id(id,name,nickname), events(id,name,date,date2,date3,active,linked_event_id)')
      .single();
    if (!error && data) setTransfers(prev => [...prev, data]);
    setTransferModal(null);
  }

  async function setTransferStatus(transferId, status) {
    const t = transfers.find(x => x.id === transferId);
    const today = new Date().toISOString().split('T')[0];
    const msgMap = { pago: 'marcou transferência como paga', 'a pagar no local': 'marcou transferência como a pagar no local', pendente: 'desfez status da transferência' };
    const updateData = { status, payment_date: status === 'pago' ? today : null, log: [...(t?.log || []), newLogEntry(msgMap[status] || `alterou status da transferência para ${status}`)] };
    await supabase.from('payment_transfers').update(updateData).eq('id', transferId);
    setTransfers(prev => prev.map(x => x.id === transferId ? { ...x, ...updateData } : x));
  }

  // Quem só recebeu transferências (sem linha de participante em nenhuma cerimônia) não tem onde
  // guardar um payment_record — "registrar o pagamento" aqui significa marcar as transferências
  // pendentes como pagas, uma a uma em ordem, até o valor digitado se esgotar.
  async function registerOrphanPayment(contactId, amount, date, method) {
    const { data, error } = await supabase
      .from('orphan_payments')
      .insert({ contact_id: contactId, amount: parseFloat(amount), payment_date: date || null, method: method || null })
      .select()
      .single();
    if (!error && data) setOrphanPayments(prev => [...prev, data]);
    setOrphanModal(null);
  }

  async function cancelOrphanPayment(paymentId) {
    await supabase.from('orphan_payments').update({ cancelled: true }).eq('id', paymentId);
    setOrphanPayments(prev => prev.filter(p => p.id !== paymentId));
  }

  async function unmarkTransferPaid(transferId) {
    const t = transfers.find(x => x.id === transferId);
    const updateData = { status: 'pendente', payment_date: null, payment_method: null, log: [...(t?.log || []), newLogEntry('desfez pagamento — voltou para pendente')] };
    await supabase.from('payment_transfers').update(updateData).eq('id', transferId);
    setTransfers(prev => prev.map(x => x.id === transferId ? { ...x, ...updateData } : x));
  }

  async function unmarkTransferPaidBatch(transferIds) {
    await Promise.all(transferIds.map(unmarkTransferPaid));
  }

  async function cancelTransfer(transferId) {
    if (!confirm('Cancelar esta transferência? O valor volta a ser cobrado integralmente da pessoa original.')) return;
    await supabase.from('payment_transfers').update({ cancelled: true }).eq('id', transferId);
    setTransfers(prev => prev.filter(x => x.id !== transferId));
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
    if (entry.type === 'conferido') return `${dt} — Conferido`;
    if (entry.type === 'confirmado_local') {
      const datePart = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
      return `${dt} — Confirmado por ${entry.by} em ${datePart}`;
    }
    return `${dt} — ${entry.by} ${entry.msg}`;
  }

  function newLogEntry(msg, prevState = null, extra = null) {
    const entry = { at: new Date().toISOString(), by: adminNameRef.current, msg };
    if (prevState) entry.prev = prevState;
    if (extra) Object.assign(entry, extra);
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

  async function clearDiscountRow(contactId, eventId) {
    const currentP = getParticipant(contactId, eventId);
    if (!currentP || currentP.discount == null) return;
    const prevState = { status: currentP.payment_status || 'em aberto', method: currentP.payment_method || null, records: currentP.payment_records || [], installment_count: currentP.installment_count || null, discount: currentP.discount ?? null };
    const updateData = { discount: null, payment_log: [...getLog(contactId, eventId), newLogEntry('removeu desconto', prevState)] };
    const { error } = await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    if (!error) updateLocal(contactId, eventId, updateData);
  }

  async function removeDiscount(p) {
    if (!confirm('Remover desconto?')) return;
    if (p._merged && p._secondary) {
      await Promise.all([clearDiscountRow(p.contact_id, p.event_id), clearDiscountRow(p._secondary.contact_id, p._secondary.event_id)]);
    } else {
      await clearDiscountRow(p.contact_id, p.event_id);
    }
  }

  // ── Payment actions ───────────────────────────────────────────────────────
  // "Parcelado" é a única intenção que ainda precisa ser marcada manualmente — "pago", "a pagar
  // no local" e "em aberto" são todos derivados do saldo/registros (ver entriesComputed).
  async function setParceladoRow(contactId, eventId, count) {
    const currentP = getParticipant(contactId, eventId);
    const prevState = currentP ? { status: currentP.payment_status || 'em aberto', method: currentP.payment_method || null, records: currentP.payment_records || [], installment_count: currentP.installment_count || null, discount: currentP.discount ?? null } : null;
    const updateData = { payment_status: 'parcelado', installment_count: count ? parseInt(count) : null, payment_log: [...getLog(contactId, eventId), newLogEntry(`definiu parcelamento em ${count || '?'}x`, prevState)] };
    const { error } = await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    if (!error) updateLocal(contactId, eventId, updateData);
  }
  async function setParcelado(p, count) {
    if (p._merged && p._secondary) await Promise.all([setParceladoRow(p.contact_id, p.event_id, count), setParceladoRow(p._secondary.contact_id, p._secondary.event_id, count)]);
    else await setParceladoRow(p.contact_id, p.event_id, count);
  }
  async function clearParceladoRow(contactId, eventId) {
    const currentP = getParticipant(contactId, eventId);
    if (currentP?.payment_status !== 'parcelado') return;
    const prevState = { status: currentP.payment_status || 'em aberto', method: currentP.payment_method || null, records: currentP.payment_records || [], installment_count: currentP.installment_count || null, discount: currentP.discount ?? null };
    const updateData = { payment_status: 'em aberto', installment_count: null, payment_log: [...getLog(contactId, eventId), newLogEntry('removeu parcelamento', prevState)] };
    const { error } = await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    if (!error) updateLocal(contactId, eventId, updateData);
  }
  async function clearParcelado(p) {
    if (p._merged && p._secondary) await Promise.all([clearParceladoRow(p.contact_id, p.event_id), clearParceladoRow(p._secondary.contact_id, p._secondary.event_id)]);
    else await clearParceladoRow(p.contact_id, p.event_id);
  }

  async function applyDiscountRow(contactId, eventId, amount) {
    const currentP = getParticipant(contactId, eventId);
    const prevState = currentP ? { status: currentP.payment_status || 'em aberto', method: currentP.payment_method || null, records: currentP.payment_records || [], installment_count: currentP.installment_count || null, discount: currentP.discount ?? null } : null;
    const val = parseFloat(amount);
    const updateData = { discount: val, payment_log: [...getLog(contactId, eventId), newLogEntry(`definiu desconto de $${val.toFixed(2)}`, prevState)] };
    const { error } = await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    if (!error) updateLocal(contactId, eventId, updateData);
  }
  async function applyDiscount(p, amount) {
    if (p._merged && p._secondary) await Promise.all([applyDiscountRow(p.contact_id, p.event_id, amount), applyDiscountRow(p._secondary.contact_id, p._secondary.event_id, amount)]);
    else await applyDiscountRow(p.contact_id, p.event_id, amount);
  }

  async function addLocalPledge(contactId, eventId, amount) {
    const p = getParticipant(contactId, eventId);
    const existing = p?.payment_records || [];
    const newRecords = [...existing, { amount: parseFloat(amount), date: null, method: null, pledge: 'local', cancelled: false }];
    const updateData = { payment_records: newRecords, payment_log: [...getLog(contactId, eventId), newLogEntry(`registrou $${Number(amount).toFixed(2)} a pagar no local`)] };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
  }

  async function confirmLocalPledge(contactId, eventId, index) {
    const p = getParticipant(contactId, eventId);
    const existing = p?.payment_records || [];
    const rec = existing[index];
    if (!rec) return;
    const today = new Date().toISOString().split('T')[0];
    const newRecords = existing.map((r, i) => i === index ? { ...r, pledge: false, date: today, method: 'Espécie' } : r);
    const updateData = { payment_records: newRecords, payment_log: [...getLog(contactId, eventId), newLogEntry(`confirmou recebimento de $${Number(rec.amount).toFixed(2)} no local`)] };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
  }

  function prevToLabel(prev) {
    return { 'em aberto': 'Em Aberto', 'pago': 'Pago', 'a pagar no local': 'No Local', 'parcelado': 'Parcelado', 'conferir pagamento': 'Conferir' }[prev?.status || 'em aberto'] || prev?.status || 'Em Aberto';
  }

  async function revertPayment(contactId, eventId) {
    const log = getLog(contactId, eventId);
    const last = log[log.length - 1];
    if (!last?.prev) return;
    const prev = last.prev;
    const updateData = {
      payment_status: prev.status || 'em aberto',
      payment_method: prev.method || null,
      payment_records: prev.records || [],
      installment_count: prev.installment_count || null,
      discount: prev.discount ?? null,
      payment_log: [...log, newLogEntry(`↺ retornou para ${prevToLabel(prev)}`)],
    };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
  }

  async function revertToLogEntry(contactId, eventId, entry) {
    if (!entry.prev) return;
    const prev = entry.prev;
    const log = getLog(contactId, eventId);
    const updateData = {
      payment_status: prev.status || 'em aberto',
      payment_method: prev.method || null,
      payment_records: prev.records || [],
      installment_count: prev.installment_count || null,
      discount: prev.discount ?? null,
      payment_log: [...log, newLogEntry(`↺ retornou para ${prevToLabel(prev)}`)],
    };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
    setLogModal(null);
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

  // A pessoa quita o SALDO, não cada transferência recebida individualmente — por isso, quando
  // o pagamento registrado cobre o que falta (owedBefore), as transferências de entrada ainda
  // pendentes são marcadas como pagas automaticamente, sem precisar de um botão por linha.
  // Se a linha estava em "conferir pagamento" (comprovante enviado pelo link público), registrar
  // o pagamento aqui também resolve essa pendência — sem isso a linha ficaria presa no balde
  // "conferir pagamento" mesmo com o pagamento já lançado. Para um par cross-ceremônia, a outra
  // linha (mergedSecondary) também pode estar com o mesmo comprovante pendente e precisa ser
  // revertida junto, mesmo sem receber o valor lançado aqui.
  async function addPaymentRecord(contactId, eventId, amount, date, method, owedBefore = null, inTransfersToResolve = [], mergedSecondary = null) {
    const p = getParticipant(contactId, eventId);
    const wasConferir = p?.payment_status === 'conferir pagamento';
    const existing = p?.payment_records || [];
    const newRecords = [...existing, { amount: parseFloat(amount), date: date || null, method: method || null, cancelled: false }];
    const dateStr = date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    const logMsg = `registrou pagamento de $${Number(amount).toFixed(2)}${method ? ` via ${method}` : ''}${dateStr ? ` em ${dateStr}` : ''}${wasConferir ? ' (a partir do comprovante)' : ''}`;
    const updateData = {
      payment_records: newRecords,
      payment_log: [...getLog(contactId, eventId), newLogEntry(logMsg)],
      ...(wasConferir ? { payment_status: 'em aberto', payment_method: null, comprovante_url: null } : {}),
    };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);

    if (wasConferir && mergedSecondary) {
      const sec = getParticipant(mergedSecondary.contact_id, mergedSecondary.event_id);
      if (sec?.payment_status === 'conferir pagamento') {
        const secUpdate = { payment_status: 'em aberto', payment_method: null, comprovante_url: null, payment_log: [...(sec.payment_log || []), newLogEntry('revertido para Em Aberto (comprovante registrado na cerimônia pareada)')] };
        await supabase.from('event_participants').update(secUpdate).match({ event_id: sec.event_id, contact_id: sec.contact_id });
        updateLocal(sec.contact_id, sec.event_id, secUpdate);
      }
    }

    if (owedBefore != null && owedBefore - parseFloat(amount) <= 0.005) {
      for (const t of inTransfersToResolve) {
        if (t.status !== 'pago' && t.status !== 'a pagar no local') await setTransferStatus(t.id, 'pago');
      }
    }
  }

  async function cancelInstallmentPayment(contactId, eventId, index) {
    const p = getParticipant(contactId, eventId);
    const existing = p?.payment_records || [];
    const rec = existing[index];
    const newRecords = existing.map((r, i) => i === index ? { ...r, cancelled: true } : r);
    const cancelMsg = rec?.pledge
      ? `cancelou $${Number(rec?.amount).toFixed(2)} a pagar no local`
      : `cancelou pagamento${rec?.amount != null ? ` de $${Number(rec.amount).toFixed(2)}` : ''}`;
    const updateData = { payment_records: newRecords, payment_log: [...getLog(contactId, eventId), newLogEntry(cancelMsg)] };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    updateLocal(contactId, eventId, updateData);
  }

  // ── Merged (cross-ceremony package) action handlers ──────────────────────
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


  // ── Filter + display logic ────────────────────────────────────────────────
  const allCeremonies = useMemo(() =>
    [...new Map(participants.map(p => [p.event_id, { id: p.event_id, name: p.events?.name || '—', date: p.events?.date }])).values()]
      .sort((a, b) => (a.date || '').localeCompare(b.date || '')),
    [participants]
  );

  const filtered = useMemo(() => {
    return participants.filter(p => {
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
  }, [participants, personSearch, dateFrom, dateTo]);

  const hasFilters = selectedCeremonies.length > 0 || !!personSearch || !!dateFrom || !!dateTo;

  // ── Transfer lookups ──────────────────────────────────────────────────────
  const transfersOutMap = useMemo(() => {
    const m = {};
    transfers.forEach(t => { const k = `${t.from_contact_id}-${t.event_id}`; (m[k] = m[k] || []).push(t); });
    return m;
  }, [transfers]);

  // Quem recebe não precisa estar na mesma cerimônia de quem transferiu — agrupa por pessoa, não por evento.
  const transfersInMap = useMemo(() => {
    const m = {};
    transfers.forEach(t => { const k = t.to_contact_id; (m[k] = m[k] || []).push(t); });
    return m;
  }, [transfers]);

  // Linha "âncora" de cada contato: a primeira cerimônia em que ele aparece como participante.
  // É nela que penduramos as transferências recebidas, para não duplicar a pessoa em vários cards.
  const primaryEventByContact = useMemo(() => {
    const m = {};
    participants.forEach(p => { if (!(p.contact_id in m)) m[p.contact_id] = p.event_id; });
    return m;
  }, [participants]);

  const orphanPaidByContact = useMemo(() => {
    const map = {};
    orphanPayments.forEach(p => { map[p.contact_id] = (map[p.contact_id] || 0) + Number(p.amount); });
    return map;
  }, [orphanPayments]);

  // ── Resumo de pagamentos ─────────────────────────────────────────────────
  // Agrupa por PESSOA (não por linha) — um par pareado em 29 dias conta como UM grupo de 2 dias,
  // mesmo que só uma das duas cerimônias do par esteja selecionada no resumo. Transferências são
  // calculadas TOTALMENTE separado (ver transferIncomingEntries) e nunca entram aqui — assim
  // dinheiro transferido só é contado uma vez, e sempre filtrado pela MESMA regra (event_id da
  // transferência precisa estar nas cerimônias selecionadas), nas duas pontas.
  const resumoGroups = useMemo(() => {
    if (resumoCeremonies.size === 0) return [];
    const handled = new Set();
    const groups = [];
    for (const p of participants) {
      const k = `${p.event_id}-${p.contact_id}`;
      if (handled.has(k)) continue;
      if (!p.date1_confirmed && !p.date2_confirmed) continue;
      const sameContactRows = participants.filter(x => x.contact_id === p.contact_id && !handled.has(`${x.event_id}-${x.contact_id}`));
      const partner = findPairPartner(p, sameContactRows);
      const inScope = resumoCeremonies.has(p.event_id);
      let rows, kind, price;
      if (partner) {
        handled.add(k);
        handled.add(`${partner.event_id}-${partner.contact_id}`);
        const partnerInScope = resumoCeremonies.has(partner.event_id);
        if (!inScope && !partnerInScope) continue;
        rows = [p, partner];
        kind = '2d';
        price = p.events?.price_2d ?? partner.events?.price_2d ?? null;
      } else {
        handled.add(k);
        if (!inScope) continue;
        rows = [p];
        kind = [p.date1_confirmed, p.date2_confirmed, p.date3_confirmed].filter(Boolean).length >= 2 ? '2d' : '1d';
        price = soloExpected(p);
      }
      const anchor = rows[0];
      const name = anchor.contacts?.nickname || anchor.contacts?.name || '—';
      const discount = anchor.discount || 0;
      const records = rows.flatMap(r => r.payment_records || []).filter(r => !r.cancelled);
      const pledgeRecords = records.filter(r => r.pledge);
      const realRecords = records.filter(r => !r.pledge);
      const paidSoFar = realRecords.reduce((s, r) => s + (r.amount || 0), 0);
      // Conta TODAS as transferências de saída desta pessoa cujo event_id esteja no escopo —
      // independe de o event_id da transferência coincidir com a cerimônia em que o remetente
      // participa. Sem isso, transferências com event_id "errado" somem do sumOut mas continuam
      // aparecendo em transferIncomingEntries, criando diferença no resumo.
      const contactIds = new Set(rows.map(r => r.contact_id));
      const outTransfers = transfers.filter(t => contactIds.has(t.from_contact_id) && resumoCeremonies.has(t.event_id));
      const sumOut = outTransfers.reduce((s, t) => s + Number(t.amount), 0);
      const expectedAmount = price != null ? price - sumOut : price;
      const total = expectedAmount != null ? expectedAmount - discount : null;
      let pledgedLocal = pledgeRecords.reduce((s, r) => s + (r.amount || 0), 0);
      if (pledgeRecords.length === 0 && anchor.payment_status === 'a pagar no local' && total != null) {
        pledgedLocal = Math.max(0, total - paidSoFar);
      }
      const nonPledgedRemainder = total != null ? Math.max(0, total - pledgedLocal) : null;
      const owedAberto = nonPledgedRemainder != null ? Math.max(0, nonPledgedRemainder - paidSoFar) : null;
      const isPagoPortion = owedAberto != null && owedAberto <= 0 && (paidSoFar > 0 || total <= 0);
      const methods = [...new Set(realRecords.map(r => r.method || 'Não especificado'))];
      // Quando a pessoa é emparelhada (1 dia em cada cerimônia = pacote 2d), os registros de
      // pagamento vêm de AMBAS as linhas. Se ela pagou para cada cerimônia individualmente,
      // o paidSoFar pode exceder o total do pacote. Capeia para não inflar o TOTAL A RECEBER.
      const resumoPaid = total != null ? Math.min(paidSoFar, Math.max(0, total)) : paidSoFar;
      const _excess = price != null ? Math.max(0, sumOut + discount - price) : 0;
      groups.push({ contactId: anchor.contact_id, name, kind, price, discount, paidSoFar, resumoPaid, pledgedLocal, owedAberto, owed: owedAberto, effectiveStatus: 'em aberto', _isPagoPortion: isPagoPortion, _outTransfers: outTransfers, _sumOut: sumOut, _excess, methods });
    }
    // Second pass: sub-payer is only "pago" when their consolidator's balance is zero.
    const owedMap = Object.fromEntries(groups.map(g => [g.contactId, g.owedAberto]));
    return groups.map(g => {
      if (!g._isPagoPortion) return g;
      if (g._outTransfers.length === 0) return { ...g, effectiveStatus: 'pago' };
      const allSettled = g._outTransfers.every(t => {
        const cOwed = owedMap[t.to_contact_id];
        if (cOwed === undefined) {
          const totalOwed = transfers.filter(x => x.to_contact_id === t.to_contact_id).reduce((s, x) => s + Number(x.amount), 0);
          const totalPaid = orphanPaidByContact[t.to_contact_id] || 0;
          return totalOwed > 0 && totalPaid >= totalOwed;
        }
        return cOwed != null && cOwed <= 0;
      });
      return { ...g, effectiveStatus: allSettled ? 'pago' : 'transferido' };
    });
  }, [participants, resumoCeremonies, transfersOutMap, transfers, orphanPaidByContact]);

  // Lado de quem RECEBE — sempre calculado à parte (nunca via sumIn dentro de resumoGroups),
  // pra não depender de "essa é a cerimônia âncora da pessoa" — isso é o que causava o resumo
  // bater ou não bater dependendo de QUAL combinação de cerimônias era selecionada. Toda
  // transferência cujo event_id esteja no escopo selecionado entra aqui, ponto.
  const transferIncomingEntries = useMemo(() => {
    if (resumoCeremonies.size === 0) return [];
    // Só conta transferências cujo remetente é participante de uma cerimônia no escopo —
    // garante simetria com o sumOut de resumoGroups (que também filtra por contactIds do escopo).
    // Transferências de fora do escopo (remetente não participa de nenhuma cerimônia selecionada)
    // não têm sumOut correspondente e inflariam o TOTAL A RECEBER sem reduzir o TOTAL COBRADO.
    const scopeContactIds = new Set(
      participants.filter(p => resumoCeremonies.has(p.event_id)).map(p => p.contact_id)
    );
    const byRecipient = {};
    transfers.forEach(t => {
      if (!resumoCeremonies.has(t.event_id)) return;
      if (!scopeContactIds.has(t.from_contact_id)) return;
      const key = t.to_contact_id;
      if (!byRecipient[key]) byRecipient[key] = { contactId: key, name: t.to_contact?.nickname || t.to_contact?.name || '—', transfersList: [] };
      byRecipient[key].transfersList.push(t);
    });
    return Object.values(byRecipient).map(g => {
      const total = g.transfersList.reduce((s, t) => s + Number(t.amount), 0);
      const paid = g.transfersList.filter(t => t.status === 'pago').reduce((s, t) => s + Number(t.amount), 0);
      const noLocal = g.transfersList.filter(t => t.status === 'a pagar no local').reduce((s, t) => s + Number(t.amount), 0);
      return { ...g, total, paid, noLocal, pending: total - paid - noLocal };
    });
  }, [transfers, resumoCeremonies, participants]);

  const resumoSummary = useMemo(() => {
    const byName = (a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR');
    const twoDay = [...resumoGroups.filter(g => g.kind === '2d')].sort(byName);
    const oneDay = [...resumoGroups.filter(g => g.kind === '1d')].sort(byName);
    const discounted = [...resumoGroups.filter(g => g.discount > 0)].sort(byName);
    const sumPrice = arr => arr.reduce((s, g) => s + (g.price || 0), 0);
    const totalDiscount = discounted.reduce((s, g) => s + g.discount, 0);
    const totalCobrado = sumPrice(resumoGroups) - totalDiscount;

    const aPagarGroups = resumoGroups.filter(g => g.owedAberto > 0);
    const noLocalGroups = resumoGroups.filter(g => g.pledgedLocal > 0).map(g => ({ ...g, owed: g.pledgedLocal }));
    const pagoGroups = resumoGroups.filter(g => g.resumoPaid > 0);

    const recipPending = transferIncomingEntries.filter(g => g.pending > 0).map(g => ({ name: g.name, owed: g.pending }));
    const recipNoLocal = transferIncomingEntries.filter(g => g.noLocal > 0).map(g => ({ name: g.name, owed: g.noLocal }));
    const recipPaid = transferIncomingEntries.filter(g => g.paid > 0).map(g => ({ name: g.name, paidSoFar: g.paid }));

    const aPagarAll = [...aPagarGroups, ...recipPending].sort(byName);
    const noLocalAll = [...noLocalGroups, ...recipNoLocal].sort(byName);
    const pagoAll = [...pagoGroups, ...recipPaid].sort(byName);

    const aPagar = { groups: aPagarAll, total: aPagarAll.reduce((s, g) => s + (g.owed || 0), 0) };
    const noLocal = { groups: noLocalAll, total: noLocalAll.reduce((s, g) => s + (g.owed || 0), 0) };
    const pago = { groups: pagoAll, total: pagoAll.reduce((s, g) => s + (g.resumoPaid ?? g.paidSoFar ?? 0), 0) };

    // Total pago categorizado por método — uma pessoa que pagou em 2 métodos aparece nas 2 categorias.
    const methodNames = {};
    pagoGroups.forEach(g => (g.methods || []).forEach(m => {
      if (!methodNames[m]) methodNames[m] = new Set();
      methodNames[m].add(g.name);
    }));
    if (recipPaid.length > 0) {
      methodNames['Transferência recebida'] = new Set(recipPaid.map(g => g.name));
    }
    const methodOrder = ['Câmbio', 'PIX', 'Wise', 'Espécie', 'Transferência recebida', 'Não especificado'];
    const pagoCategories = methodOrder
      .filter(m => methodNames[m]?.size > 0)
      .map(m => ({ label: m, names: [...methodNames[m]].sort((a, b) => a.localeCompare(b, 'pt-BR')) }));

    const inconsistencias = resumoGroups.filter(g => g._excess > 0).sort(byName);
    return {
      twoDay: { groups: twoDay, price: twoDay[0]?.price ?? null, total: sumPrice(twoDay) },
      oneDay: { groups: oneDay, price: oneDay[0]?.price ?? null, total: sumPrice(oneDay) },
      discounted: { groups: discounted, total: totalDiscount },
      totalCobrado,
      aPagar, noLocal, pago, pagoCategories,
      totalAReceber: aPagar.total + noLocal.total + pago.total,
      inconsistencias,
    };
  }, [resumoGroups, transferIncomingEntries]);

  const toggleResumoExpanded = (k) => setResumoExpanded(prev => {
    const next = new Set(prev);
    if (next.has(k)) next.delete(k); else next.add(k);
    return next;
  });

  const toggleResumoCeremony = (id) => setResumoCeremonies(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // Transferências cujo responsável não participa de NENHUM evento ativo — entram como linha própria,
  // agrupadas só por pessoa (independente da cerimônia de cada transferência).
  const orphanTransferEntries = useMemo(() => {
    const groups = {};
    transfers.forEach(t => {
      const isOrphan = !participants.some(p => p.contact_id === t.to_contact_id);
      if (!isOrphan) return;
      const key = t.to_contact_id;
      if (!groups[key]) {
        groups[key] = {
          _isTransferOnly: true,
          id: `transfer-group-${key}`,
          contact_id: t.to_contact_id,
          contacts: t.to_contact,
          transfersList: [],
        };
      }
      groups[key].transfersList.push(t);
    });
    return Object.values(groups).map(g => {
      const totalOwed = g.transfersList.reduce((s, t) => s + Number(t.amount), 0);
      const totalPaid = orphanPaidByContact[g.contact_id] || 0;
      const status = totalPaid >= totalOwed && totalOwed > 0 ? 'pago' : 'em aberto';
      return { ...g, payment_status: status, _totalOwed: totalOwed, _totalPaid: totalPaid };
    });
  }, [transfers, participants, orphanPaidByContact]);

  // Transferências de SAÍDA cujo event_id não corresponde a nenhuma linha ativa do remetente —
  // ficam invisíveis em qualquer card (transfersOutMap não acha onde pendurar), mesmo que o
  // remetente seja participante ativo em OUTRA cerimônia. Precisa de uma seção própria para
  // não sumir do radar — é dinheiro que ainda está sendo cobrado em algum lugar.
  const orphanOutTransferEntries = useMemo(() => {
    const groups = {};
    transfers.forEach(t => {
      const isOrphan = !participants.some(p => p.contact_id === t.from_contact_id && p.event_id === t.event_id);
      if (!isOrphan) return;
      const key = t.from_contact_id;
      if (!groups[key]) {
        groups[key] = { id: `orphan-out-${key}`, contact_id: t.from_contact_id, contacts: t.from_contact, transfersList: [] };
      }
      groups[key].transfersList.push(t);
    });
    return Object.values(groups);
  }, [transfers, participants]);

  // Independente de cerimônia — não filtra por selectedCeremony, só por pessoa/data.
  const filteredOrphans = useMemo(() => {
    return orphanTransferEntries.filter(o => {
      if (personSearch) {
        const q = personSearch.toLowerCase();
        const nm = (o.contacts?.nickname || o.contacts?.name || '').toLowerCase();
        if (!nm.includes(q)) return false;
      }
      if (dateFrom || dateTo) {
        const lastLogAt = o.transfersList.reduce((latest, t) => {
          const log = t.log || [];
          const at = log.length ? log[log.length - 1].at : t.created_at;
          return (!latest || (at && at > latest)) ? at : latest;
        }, null);
        if (!lastLogAt) return false;
        const d = lastLogAt.slice(0, 10);
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
      }
      return true;
    });
  }, [orphanTransferEntries, personSearch, dateFrom, dateTo]);

  const displayParticipants = useMemo(() => {
    const merged = new Set();
    const result = [];
    for (const p of filtered) {
      const key = `${p.event_id}-${p.contact_id}`;
      if (merged.has(key)) continue;
      const partner = findPairPartner(p, filtered);
      if (partner) {
        merged.add(key);
        merged.add(`${partner.event_id}-${partner.contact_id}`);
        const price2d = p.events?.price_2d ?? partner.events?.price_2d ?? null;
        const combinedLog = [...(p.payment_log || []), ...(partner.payment_log || [])].sort((a, b) => a.at.localeCompare(b.at));
        result.push({
          ...p,
          _merged: true,
          _secondary: partner,
          _ceremonyLabel: getEnrolledDaysLabel([p, partner]),
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
    if (selectedCeremonies.length === 0) return result;
    return result.filter(p => {
      const ids = p._merged ? [p.event_id, p._secondary.event_id] : [p.event_id];
      return ids.some(id => selectedCeremonies.includes(id));
    });
  }, [filtered, selectedCeremonies]);

  const allDisplayEntries = useMemo(() => [...displayParticipants, ...filteredOrphans], [displayParticipants, filteredOrphans]);

  // Pré-calcula transferências/saldo/status efetivo de cada linha, uma única vez, reaproveitado no
  // bucket (grupo de status) e na renderização da linha — evita recalcular tudo duas vezes.
  const entriesComputed = useMemo(() => {
    const raw = allDisplayEntries.map(p => {
      if (p._isTransferOnly) return { ...p, _statusBuckets: [p.payment_status] };
      if (p.payment_status === 'conferir pagamento') return { ...p, _statusBuckets: ['conferir pagamento'], _owedAberto: null, _pledgedLocal: 0, _paidSoFar: 0, _owed: null };
      const records = p.payment_records || [];
      const activeRecords = records.filter(r => !r.cancelled);
      const pledgeRecords = activeRecords.filter(r => r.pledge);
      const realRecords = activeRecords.filter(r => !r.pledge);
      const outTransfers = p._merged && p._secondary
        ? [...(transfersOutMap[`${p.contact_id}-${p.event_id}`] || []), ...(transfersOutMap[`${p._secondary.contact_id}-${p._secondary.event_id}`] || [])]
        : (transfersOutMap[`${p.contact_id}-${p.event_id}`] || []);
      const isPrimaryRow = primaryEventByContact[p.contact_id] === p.event_id;
      const inTransfers = isPrimaryRow ? (transfersInMap[p.contact_id] || []) : [];
      const sumOut = outTransfers.reduce((s, t) => s + Number(t.amount), 0);
      const sumIn = inTransfers.reduce((s, t) => s + Number(t.amount), 0);
      const baseExpected = p._merged ? p._expectedAmount : computeExpected(p, participants);
      const expectedAmount = baseExpected != null ? baseExpected - sumOut + sumIn : (sumIn > 0 ? sumIn : baseExpected);
      const paidSoFar = realRecords.reduce((s, r) => s + (r.amount || 0), 0);
      const total = expectedAmount != null ? expectedAmount - (p.discount || 0) : null;

      let pledgedLocal = pledgeRecords.reduce((s, r) => s + (r.amount || 0), 0);
      // Dado legado: status "a pagar no local" sem nenhum registro de pledge — trata o saldo
      // restante todo como pledge, pra continuar funcionando sem precisar migrar dados antigos.
      if (pledgeRecords.length === 0 && p.payment_status === 'a pagar no local' && total != null) {
        pledgedLocal = Math.max(0, total - paidSoFar);
      }

      const nonPledgedRemainder = total != null ? Math.max(0, total - pledgedLocal) : null;
      const owedAberto = nonPledgedRemainder != null ? Math.max(0, nonPledgedRemainder - paidSoFar) : null;
      const isPagoPortion = owedAberto != null && owedAberto <= 0 && (paidSoFar > 0 || total <= 0);

      const buckets = [];
      if (owedAberto != null && owedAberto > 0) buckets.push(p.payment_status === 'parcelado' ? 'parcelado' : 'em aberto');
      if (pledgedLocal > 0) buckets.push('a pagar no local');
      if (buckets.length === 0 && !isPagoPortion) buckets.push('em aberto');

      return {
        ...p, _outTransfers: outTransfers, _inTransfers: inTransfers, _sumOut: sumOut, _sumIn: sumIn,
        _baseExpected: baseExpected, _adjExpected: expectedAmount, _total: total,
        _paidSoFar: paidSoFar, _pledgedLocal: pledgedLocal, _owedAberto: owedAberto,
        _isPagoPortion: isPagoPortion,
        _owed: (owedAberto || 0) + pledgedLocal, _statusBuckets: [...new Set(buckets)],
      };
    });

    // Second pass: resolve sub-payer status — "transferido" until the consolidator's balance hits zero.
    const owedMap = Object.fromEntries(raw.map(e => [e.contact_id, e._owedAberto]));
    return raw.map(e => {
      if (!e._isPagoPortion) return e;
      const buckets = [...e._statusBuckets];
      const outT = e._outTransfers || [];
      if (outT.length === 0) {
        buckets.push('pago');
      } else {
        const allSettled = outT.every(t => {
          const cOwed = owedMap[t.to_contact_id];
          if (cOwed === undefined) {
            const totalOwed = transfers.filter(x => x.to_contact_id === t.to_contact_id).reduce((s, x) => s + Number(x.amount), 0);
            const totalPaid = orphanPaidByContact[t.to_contact_id] || 0;
            return totalOwed > 0 && totalPaid >= totalOwed;
          }
          return cOwed != null && cOwed <= 0;
        });
        buckets.push(allSettled ? 'pago' : 'transferido');
      }
      return { ...e, _statusBuckets: [...new Set(buckets)] };
    });
  }, [allDisplayEntries, transfersOutMap, transfersInMap, primaryEventByContact, participants, transfers, orphanPaidByContact]);

  const countsByStatus = useMemo(() => {
    const c = {};
    entriesComputed.forEach(p => { (p._statusBuckets || ['em aberto']).forEach(k => { c[k] = (c[k] || 0) + 1; }); });
    return c;
  }, [entriesComputed]);

  const toggleStatusFilter = (key) => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '5rem', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.1em' }}>
      Verificando acesso...
    </div>
  );

  // ── Payment modal participant ─────────────────────────────────────────────
  const pmP = paymentModal ? getParticipant(paymentModal.contactId, paymentModal.eventId) : null;
  const pmComputed = paymentModal
    ? (paymentModal.merged ? paymentModal.mergedEntry : entriesComputed.find(e => e.contact_id === paymentModal.contactId && e.event_id === paymentModal.eventId))
    : null;

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

      {/* Filter bar */}
      <div style={{ background: '#f0ede8', borderBottom: '0.5px solid #d0cbc2', padding: '0.6rem 2.5rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filtrar por pessoa..."
          value={personSearch}
          onChange={e => setPersonSearch(e.target.value)}
          style={{ padding: '3px 9px', background: '#fdfbf7', border: personSearch ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', color: '#3a3530', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.06em', width: '140px', outline: 'none' }}
        />
        {allCeremonies.length > 0 && (
          <div ref={ceremoniesRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setCeremoniesOpen(o => !o)}
              style={{ padding: '3px 9px', background: selectedCeremonies.length > 0 ? '#3a3530' : 'transparent', border: selectedCeremonies.length > 0 ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.06em', color: selectedCeremonies.length > 0 ? '#f7f4ee' : '#9a9288', transition: 'all 0.15s' }}
            >
              {selectedCeremonies.length === 0 ? 'Cerimônias ▾' : `${selectedCeremonies.length} selecionada${selectedCeremonies.length > 1 ? 's' : ''} ▾`}
            </button>
            {ceremoniesOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#fdfbf7', border: '0.5px solid #c8c2b8', borderRadius: '2px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 200, minWidth: '200px', padding: '4px 0' }}>
                {allCeremonies.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', letterSpacing: '0.04em' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0ede8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCeremonies.includes(c.id)}
                      onChange={() => toggleCeremony(c.id)}
                      style={{ accentColor: '#3a3530', width: '12px', height: '12px', cursor: 'pointer', flexShrink: 0 }}
                    />
                    {c.name}
                  </label>
                ))}
                {selectedCeremonies.length > 0 && (
                  <div style={{ borderTop: '0.5px solid #e0d8ce', margin: '4px 0 0' }}>
                    <button onClick={() => { setSelectedCeremonies([]); setCeremoniesOpen(false); }} style={{ width: '100%', padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#9a9288', letterSpacing: '0.08em', textAlign: 'left' }}>
                      × limpar seleção
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <span style={{ fontSize: '9px', color: '#7a7268', letterSpacing: '0.08em' }}>de</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          style={{ padding: '3px 7px', background: '#fdfbf7', border: dateFrom ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', color: '#3a3530', fontFamily: "'Courier Prime', monospace", fontSize: '9px', outline: 'none' }} />
        <span style={{ fontSize: '9px', color: '#7a7268', letterSpacing: '0.08em' }}>até</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          style={{ padding: '3px 7px', background: '#fdfbf7', border: dateTo ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', color: '#3a3530', fontFamily: "'Courier Prime', monospace", fontSize: '9px', outline: 'none' }} />
        {hasFilters && (
          <button onClick={() => { setPersonSearch(''); setSelectedCeremonies([]); setDateFrom(''); setDateTo(''); }}
            style={{ padding: '3px 8px', background: 'none', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#9a9288', letterSpacing: '0.08em' }}>
            × limpar
          </button>
        )}
        {!loading && (
          <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#aaa49c', letterSpacing: '0.06em' }}>
            {allDisplayEntries.length} participante{allDisplayEntries.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={s.content}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '0.5px solid #d0cbc2' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: '36px', fontWeight: 400, color: '#3a3530', margin: '0 0 0.5rem' }}>Pagamentos</h1>
            <button onClick={() => setResumoModal(true)}
              style={{ padding: '5px 12px', background: 'transparent', border: '0.5px solid #b8b0a4', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a7268' }}>
              ▤ resumo
            </button>
          </div>
          {!loading && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {STATUS_GROUPS.map(g => {
                const isActive = statusFilter.size === 0 || statusFilter.has(g.key);
                const isSelected = statusFilter.has(g.key);
                return (
                  <button key={g.key} onClick={() => toggleStatusFilter(g.key)} title={g.label}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 9px',
                      background: isSelected ? '#faf7f0' : 'transparent',
                      border: isSelected ? `0.5px solid ${g.color}` : '0.5px dashed #d0cbc2',
                      borderRadius: '10px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace",
                      fontSize: '10px', letterSpacing: '0.02em', color: isActive ? g.color : '#c0b8b0',
                      opacity: isActive ? 1 : 0.55,
                    }}>
                    <span>{g.icon}</span>{countsByStatus[g.key] || 0}
                  </button>
                );
              })}
              {statusFilter.size > 0 && (
                <button onClick={() => setStatusFilter(new Set())}
                  style={{ padding: '3px 8px', background: 'none', border: '0.5px dashed #c8c2b8', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#9a9288', letterSpacing: '0.06em' }}>
                  × limpar
                </button>
              )}
            </div>
          )}
        </div>

        {!loading && orphanOutTransferEntries.length > 0 && (
          <div style={{ marginBottom: '2rem', border: '0.5px solid #d9a05c', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ padding: '0.6rem 1rem', background: '#fdf6ea', borderBottom: '0.5px dashed #d9a05c', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a06030' }}>
              ⚠ transferências de saída sem cerimônia ativa correspondente — revisar
            </div>
            {orphanOutTransferEntries.map(g => {
              const name = g.contacts?.nickname || g.contacts?.name || '—';
              const list = g.transfersList;
              const total = list.reduce((s, t) => s + Number(t.amount), 0);
              const combinedLog = combineLogs(...list.map(t => t.log));
              return (
                <div key={g.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', background: '#fdfbf7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530' }}>{name}</span>
                      {combinedLog.length > 0 && <HistoryIcon onClick={() => setLogModal({ name, log: combinedLog, isMerged: true })} />}
                    </div>
                    <span style={{ fontSize: '10px', color: '#b0a898', letterSpacing: '0.04em', fontFamily: "'Courier Prime', monospace", flexShrink: 0, marginLeft: '10px' }}>$ {total.toFixed(2)}</span>
                  </div>
                  {list.map((t, i) => (
                    <TransferLine key={t.id} t={t} direction="out" isLast={i === list.length - 1}
                      onCancel={() => cancelTransfer(t.id)} />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#aaa49c', fontSize: '12px', letterSpacing: '0.08em' }}>carregando...</div>
        ) : allDisplayEntries.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#aaa49c', fontSize: '12px', letterSpacing: '0.08em', fontStyle: 'italic' }}>
            {hasFilters ? 'nenhum resultado para os filtros selecionados.' : 'nenhum participante em cerimônias ativas.'}
          </div>
        ) : (
          STATUS_GROUPS.filter(g => statusFilter.size === 0 || statusFilter.has(g.key)).map(({ key, label, icon, color }) => {
            const group = entriesComputed.filter(p => (p._statusBuckets || ['em aberto']).includes(key)).sort(sortByName);
            const isConferir = key === 'conferir pagamento';
            const isNoLocal = key === 'a pagar no local';
            const isParcelado = key === 'parcelado';
            const isPago = key === 'pago';
            const isTransferido = key === 'transferido';

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
                  if (p._isTransferOnly) {
                    const name = p.contacts?.nickname || p.contacts?.name || '—';
                    const list = p.transfersList;
                    const total = list.reduce((s, t) => s + Number(t.amount), 0);
                    const combinedLog = combineLogs(...list.map(t => t.log));
                    // Várias transferências resolvidas numa MESMA confirmação (mesmo batchId no log)
                    // mostram só uma linha "pagamento", com um × que desfaz o grupo inteiro de volta.
                    const paidGroups = {};
                    const paidGroupOrder = [];
                    list.forEach(t => {
                      if (t.status !== 'pago') return;
                      const lastEntry = t.log?.[t.log.length - 1];
                      const key = lastEntry?.batchId || t.id;
                      if (!paidGroups[key]) { paidGroups[key] = { ids: [], amount: 0, date: t.payment_date, method: t.payment_method }; paidGroupOrder.push(key); }
                      paidGroups[key].ids.push(t.id);
                      paidGroups[key].amount += Number(t.amount);
                    });
                    const paidGroupsList = paidGroupOrder.map(k => paidGroups[k]);
                    const myOrphanPayments = orphanPayments.filter(op => op.contact_id === p.contact_id);
                    const totalPaidOrphan = p._totalPaid || 0;
                    const remaining = Math.max(0, total - totalPaidOrphan);
                    return (
                      <div key={p.id} style={{ marginBottom: '10px' }}>
                        <div onClick={() => setOrphanModal({ contactId: p.contact_id, name, transfersList: list })}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', background: '#fdfbf7', border: '0.5px solid #d0cbc2', borderRadius: '2px 2px 0 0', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530' }}>{name}</span>
                            {combinedLog.length > 0 && <HistoryIcon onClick={() => setLogModal({ name, log: combinedLog, isMerged: true })} />}
                          </div>
                          <span style={{ fontSize: '10px', color: remaining === 0 ? '#6a7c45' : '#b0a898', letterSpacing: '0.04em', fontFamily: "'Courier Prime', monospace", flexShrink: 0, marginLeft: '10px' }}>$ {remaining.toFixed(2)}</span>
                        </div>
                        {list.map((t, i) => (
                          <TransferLine key={t.id} t={t} direction="in" isLast={paidGroupsList.length === 0 && myOrphanPayments.length === 0 && i === list.length - 1}
                            onCancel={() => cancelTransfer(t.id)} />
                        ))}
                        {paidGroupsList.map((g, i) => (
                          <TransferPaidLine key={i} date={g.date} method={g.method} amount={g.amount} isLast={myOrphanPayments.length === 0 && i === paidGroupsList.length - 1}
                            onUndo={() => unmarkTransferPaidBatch(g.ids)} />
                        ))}
                        {myOrphanPayments.map((op, i) => (
                          <TransferPaidLine key={op.id} date={op.payment_date} method={op.method} amount={op.amount} isLast={i === myOrphanPayments.length - 1}
                            onUndo={() => cancelOrphanPayment(op.id)} />
                        ))}
                      </div>
                    );
                  }

                  const name = p.contacts?.nickname || p.contacts?.name || '—';
                  const records = p.payment_records || [];
                  const outTransfers = p._outTransfers || [];
                  const inTransfers = p._inTransfers || [];
                  const expectedAmount = p._adjExpected;
                  const owed = p._owed;

                  const openPaymentModal = (opts = {}) => {
                    setModalAction(opts.modalAction ?? null);
                    setPaymentModal({
                      contactId: p.contact_id,
                      eventId: p.event_id,
                      merged: p._merged || false,
                      mergedEntry: p._merged ? p : null,
                      status: p.payment_status || 'em aberto',
                      method: 'Câmbio',
                      installmentCount: p.installment_count || '',
                      discountAmount: p.discount != null ? String(p.discount) : '50.00',
                      localAmount: '',
                      paymentAmount: opts.paymentAmount ?? (p._owedAberto != null ? String(p._owedAberto) : ''),
                      paymentDate: opts.paymentDate ?? '',
                    });
                  };

                  if (isConferir) {
                    const combinedLog = combineLogs(p.payment_log, ...outTransfers.map(t => t.log), ...inTransfers.map(t => t.log));
                    return (
                      <div key={`${p.event_id}-${p.contact_id}`} style={{ marginBottom: '12px', border: '0.5px solid #e8b87a', borderRadius: '2px', background: '#fefaf3' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', borderBottom: '0.5px dashed #e8b87a', cursor: 'pointer' }} onClick={() => openPaymentModal()}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530' }}>{name}</span>
                            {combinedLog.length > 0 && <HistoryIcon onClick={() => setLogModal({ name, log: combinedLog, contactId: p.contact_id, eventId: p.event_id, isMerged: !!p._merged, mergedParticipant: p._merged ? p : null })} />}
                            <button onClick={e => { e.stopPropagation(); setTransferModal({ fromContactId: p.contact_id, eventId: p.event_id, fromName: name, toContactId: '', amount: '', observation: '' }); }}
                              title="Transferir"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '15px', color: '#9a9288', lineHeight: 1, flexShrink: 0 }}>
                              ⇄
                            </button>
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
                        {[...outTransfers.map(t => ({ ...t, _dir: 'out' })), ...inTransfers.map(t => ({ ...t, _dir: 'in' }))].map(t => (
                          <TransferLine key={t.id} t={t} direction={t._dir} isLast={false}
                            onCancel={() => cancelTransfer(t.id)} />
                        ))}
                        <div style={{ padding: '0.6rem 1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button onClick={e => {
                              e.stopPropagation();
                              openPaymentModal({ modalAction: 'payment', paymentAmount: expectedAmount != null ? String(expectedAmount) : '', paymentDate: new Date().toISOString().split('T')[0] });
                            }}
                              style={{ padding: '6px 10px', background: '#5d9470', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              📝 Registrar Pagamento
                            </button>
                            <button onClick={e => { e.stopPropagation(); if (confirm('Cancelar comprovante e reverter para Em Aberto?')) cancelConferirEntry(p); }}
                              style={{ padding: '6px 10px', background: 'transparent', color: '#c0392b', border: '0.5px solid #e8b0b0', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              ✕ Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const baseExpected = p._baseExpected;
                  const ceremonyLabel = p._merged ? p._ceremonyLabel : getEnrolledDaysLabel([p]);
                  const activeRecords = records.filter(r => !r.cancelled);
                  const hasOtherLines = activeRecords.length > 0 || (outTransfers.length + inTransfers.length) > 0 || p.discount > 0;
                  const hasTransfersOrDiscount = (outTransfers.length + inTransfers.length) > 0 || p.discount > 0;
                  const noMoreBlocksAfter = !(p.payment_log?.length > 0);
                  const combinedLog = combineLogs(p.payment_log, ...outTransfers.map(t => t.log), ...inTransfers.map(t => t.log));
                  const headerAmount = isPago || isTransferido ? null : (isNoLocal ? p._pledgedLocal : p._owedAberto);

                  return (
                    <div key={`${p.event_id}-${p.contact_id}`} style={{ marginBottom: '10px' }}>
                      <div onClick={() => openPaymentModal()}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', background: '#fdfbf7', border: '0.5px solid #d0cbc2', borderRadius: hasOtherLines ? '2px 2px 0 0' : '2px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530', flexShrink: 0 }}>{name}</span>
                          {combinedLog.length > 0 && <HistoryIcon onClick={() => setLogModal({ name, log: combinedLog, contactId: p.contact_id, eventId: p.event_id, isMerged: !!p._merged, mergedParticipant: p._merged ? p : null })} />}
                          {p.payment_observation && (
                            <button onClick={e => { e.stopPropagation(); setObsModal({ name, text: p.payment_observation }); }}
                              title="Ver observação"
                              style={{ background: 'none', border: '0.5px solid #d0cbc2', borderRadius: '2px', cursor: 'pointer', padding: '1px 5px', fontFamily: "'Courier Prime', monospace", fontSize: '8px', letterSpacing: '0.08em', color: '#9a9288', textTransform: 'uppercase', lineHeight: 1.6, flexShrink: 0 }}>
                              obs
                            </button>
                          )}
                          <button onClick={e => { e.stopPropagation(); setTransferModal({ fromContactId: p.contact_id, eventId: p.event_id, fromName: name, toContactId: '', amount: '', observation: '' }); }}
                            title="Transferir"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '15px', color: '#9a9288', lineHeight: 1, flexShrink: 0 }}>
                            ⇄
                          </button>
                        </div>
                        <div
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0, marginLeft: '10px' }}>
                          {headerAmount != null && (
                            <span style={{ fontSize: '10px', color: '#b0a898', letterSpacing: '0.04em', fontFamily: "'Courier Prime', monospace" }}>$ {Number(headerAmount).toFixed(2)}</span>
                          )}
                          {isParcelado && p.installment_count > 0 && (
                            <span style={{ fontSize: '9px', color: '#7a68a4', letterSpacing: '0.04em' }}>{records.filter(r => !r.cancelled).length}/{p.installment_count} parcelas</span>
                          )}
                        </div>
                      </div>

                      {hasOtherLines && baseExpected != null && (
                        <BaseLine label={ceremonyLabel} amount={baseExpected} />
                      )}

                      {activeRecords.map((rec, i) => (
                        <PaymentRecordLine key={i} rec={rec} isLast={!hasTransfersOrDiscount && i === activeRecords.length - 1 && noMoreBlocksAfter}
                          onCancel={() => cancelInstallmentPayment(p.contact_id, p.event_id, records.indexOf(rec))}
                          onConfirm={rec.pledge ? () => confirmLocalPledge(p.contact_id, p.event_id, records.indexOf(rec)) : undefined} />
                      ))}

                      {(() => {
                        const allT = [
                          ...outTransfers.map(t => ({ ...t, _kind: 'transfer', _dir: 'out' })),
                          ...inTransfers.map(t => ({ ...t, _kind: 'transfer', _dir: 'in' })),
                          ...(p.discount > 0 ? [{ _kind: 'discount', id: 'discount', amount: p.discount }] : []),
                        ];
                        return allT.map((t, i) => {
                          const isLast = noMoreBlocksAfter && i === allT.length - 1;
                          if (t._kind === 'discount') {
                            return <DiscountLine key="discount" amount={t.amount} isLast={isLast} onCancel={() => removeDiscount(p)} />;
                          }
                          return (
                            <TransferLine key={t.id} t={t} direction={t._dir} isLast={isLast}
                              onCancel={() => cancelTransfer(t.id)} />
                          );
                        });
                      })()}

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
                <div style={{ fontSize: '9px', color: '#aaa49c', marginTop: '2px', fontStyle: 'italic' }}>{paymentModal.merged ? paymentModal.mergedEntry._ceremonyLabel : getEnrolledDaysLabel([pmP])}</div>
              </div>
              {paymentModal.status === 'conferir pagamento' && (
                <div style={{ padding: '1rem 1.5rem 0' }}>
                  <div style={{ padding: '6px 10px', background: '#fef8f0', border: '0.5px solid #e8b87a', borderRadius: '2px', fontSize: '10px', color: '#c4892a', letterSpacing: '0.04em' }}>
                    ? conferir pagamento — definido pelo viajante.
                  </div>
                </div>
              )}

              <div style={{ padding: '1rem 1.5rem 0' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Ações</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {[
                    { key: 'parcelado', icon: '◑', label: 'Parcelado', active: pmP.payment_status === 'parcelado' },
                    { key: 'local', icon: '◐', label: 'A pagar no local', active: false },
                    { key: 'payment', icon: '+', label: 'Inserir pagamento', active: false },
                    { key: 'discount', icon: '%', label: 'Inserir desconto', active: pmP.discount != null },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => setModalAction(prev => prev === opt.key ? null : opt.key)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 6px', background: modalAction === opt.key ? '#3a3530' : (opt.active ? '#faf7f0' : 'transparent'), border: modalAction === opt.key ? '0.5px solid #3a3530' : (opt.active ? '0.5px solid #b8b0a4' : '0.5px dashed #c8c2b8'), borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.02em', color: modalAction === opt.key ? '#f7f4ee' : '#7a7268', textAlign: 'center' }}>
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '9px', color: '#b0a898', marginTop: '0.5rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "Em aberto", "pago" e "transferido" são calculados automaticamente pelo saldo.
                </div>

                {modalAction === 'parcelado' && (
                  <div style={{ marginTop: '0.6rem', padding: '0.7rem 0.9rem', background: '#faf7f0', border: '0.5px solid #d0cbc2', borderRadius: '2px', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>Nº de parcelas</div>
                      <input type="number" min="2" max="99" value={paymentModal.installmentCount}
                        onChange={e => setPaymentModal(prev => ({ ...prev, installmentCount: e.target.value }))}
                        placeholder="Ex: 3" autoFocus
                        style={{ width: '90px', padding: '6px 8px', background: '#fff', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none' }} />
                    </div>
                    <button onClick={() => { if (!paymentModal.installmentCount) return; setParcelado(pmComputed || pmP, paymentModal.installmentCount); setModalAction(null); }}
                      style={{ padding: '7px 12px', background: '#7a68a4', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ok</button>
                    {pmP.payment_status === 'parcelado' && (
                      <button onClick={() => { clearParcelado(pmComputed || pmP); setModalAction(null); }}
                        style={{ padding: '7px 10px', background: 'transparent', color: '#c0392b', border: '0.5px dashed #e8b0b0', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}>remover</button>
                    )}
                  </div>
                )}

                {modalAction === 'local' && (
                  <div style={{ marginTop: '0.6rem', padding: '0.7rem 0.9rem', background: '#faf7f0', border: '0.5px solid #d0cbc2', borderRadius: '2px', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>Valor (USD)</div>
                      <input type="number" min="0" step="0.01" value={paymentModal.localAmount}
                        onChange={e => setPaymentModal(prev => ({ ...prev, localAmount: e.target.value }))}
                        placeholder="0.00" autoFocus
                        style={{ width: '90px', padding: '6px 8px', background: '#fff', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none' }} />
                    </div>
                    <button onClick={() => {
                      if (!paymentModal.localAmount) return;
                      addLocalPledge(paymentModal.contactId, paymentModal.eventId, paymentModal.localAmount);
                      setPaymentModal(prev => ({ ...prev, localAmount: '' }));
                      setModalAction(null);
                    }}
                      style={{ padding: '7px 12px', background: '#8a7a58', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ok</button>
                  </div>
                )}

                {modalAction === 'payment' && (
                  <div style={{ marginTop: '0.6rem', padding: '0.7rem 0.9rem', background: '#faf7f0', border: '0.5px solid #d0cbc2', borderRadius: '2px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      {['Câmbio', 'PIX', 'Wise', 'Espécie'].map(m => (
                        <button key={m} onClick={() => setPaymentModal(prev => ({ ...prev, method: m }))}
                          style={{ padding: '6px 10px', background: paymentModal.method === m ? '#3a3530' : 'transparent', border: paymentModal.method === m ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: paymentModal.method === m ? '#f7f4ee' : '#7a7268' }}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>Valor (USD)</div>
                        <input type="number" min="0" step="0.01" value={paymentModal.paymentAmount}
                          onChange={e => setPaymentModal(prev => ({ ...prev, paymentAmount: e.target.value }))}
                          placeholder="0.00" autoFocus
                          style={{ width: '90px', padding: '6px 8px', background: '#fff', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>Data</div>
                        <input type="date" value={paymentModal.paymentDate}
                          onChange={e => setPaymentModal(prev => ({ ...prev, paymentDate: e.target.value }))}
                          style={{ padding: '6px 8px', background: '#fff', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none' }} />
                      </div>
                      <button onClick={() => {
                        if (!paymentModal.paymentAmount || !paymentModal.paymentDate) return;
                        addPaymentRecord(paymentModal.contactId, paymentModal.eventId, paymentModal.paymentAmount, paymentModal.paymentDate, paymentModal.method, pmComputed?._owed, pmComputed?._inTransfers || [], paymentModal.merged ? paymentModal.mergedEntry?._secondary : null);
                        setPaymentModal(prev => ({ ...prev, paymentAmount: '', paymentDate: '' }));
                        setModalAction(null);
                      }}
                        style={{ padding: '7px 12px', background: '#3a3530', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        ok
                      </button>
                    </div>
                  </div>
                )}

                {modalAction === 'discount' && (
                  <div style={{ marginTop: '0.6rem', padding: '0.7rem 0.9rem', background: '#faf7f0', border: '0.5px solid #d0cbc2', borderRadius: '2px', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>Valor (USD)</div>
                      <input type="number" min="0" step="0.01" value={paymentModal.discountAmount}
                        onChange={e => setPaymentModal(prev => ({ ...prev, discountAmount: e.target.value }))}
                        autoFocus
                        style={{ width: '90px', padding: '6px 8px', background: '#fff', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none' }} />
                    </div>
                    <button onClick={() => { if (!paymentModal.discountAmount) return; applyDiscount(pmComputed || pmP, paymentModal.discountAmount); setModalAction(null); }}
                      style={{ padding: '7px 12px', background: '#8a7a58', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ok</button>
                    {pmP.discount != null && (
                      <button onClick={() => { removeDiscount(pmComputed || pmP); setModalAction(null); }}
                        style={{ padding: '7px 10px', background: 'transparent', color: '#c0392b', border: '0.5px dashed #e8b0b0', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}>remover</button>
                    )}
                  </div>
                )}
              </div>

              <div style={{ padding: '1rem 1.5rem 0' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Saldo</div>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '20px', color: '#3a3530' }}>
                  $ {pmComputed?._owed != null ? Number(pmComputed._owed).toFixed(2) : '—'}
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
                {!(pmComputed?._statusBuckets?.length === 1 && pmComputed._statusBuckets[0] === 'pago') && (
                  <button
                    onClick={() => {
                      const firstName = (pmP.contacts?.nickname || pmP.contacts?.name || '').split(' ')[0];
                      const ph = pmP.contacts?.phone?.replace(/\D/g, '');
                      if (!ph) { alert('Sem telefone cadastrado.'); return; }
                      const paymentLink = `${window.location.origin}/pagamento/${paymentModal.contactId}`;
                      const today = new Date().toISOString().split('T')[0];
                      const days = [];
                      participants.filter(x => x.contact_id === paymentModal.contactId).forEach(row => {
                        if (row.date1_confirmed && row.events?.date && row.events.date >= today) days.push(row.events.date);
                        if (row.date2_confirmed && row.events?.date2 && row.events.date2 >= today) days.push(row.events.date2);
                        if (row.date3_confirmed && row.events?.date3 && row.events.date3 >= today) days.push(row.events.date3);
                      });
                      days.sort();
                      const fmtDays = days.map(d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }));
                      const daysStr = fmtDays.length === 0 ? '(data a confirmar)' :
                        fmtDays.length === 1 ? `o dia ${fmtDays[0]}` :
                        `os dias ${fmtDays.slice(0, -1).join(', ')} e ${fmtDays[fmtDays.length - 1]}`;
                      const defaultTemplate = `[Link]\n\nOi [Nome]! Tudo bem?\n\nSua vaga está reservada para [dias_da_cerimônia].\n\nPara confirmar a vaga, vamos precisar das informações sobre pagamento, ok?\n\n*Opção 1 - Câmbio*\n\nClica aqui pra enviar uma mensagem para a Boa Viagem Câmbio pelo WhatsApp:\nhttps://wa.me/5581988664444\n\nDiga o valor em Dólar que quer enviar para Cerimônia Brasil e eles te dirão quanto custa em Real.\nManda um pix pra eles e depois nos encaminhe o comprovante através do link no final dessa mensagem!\n\n\n*Opção 2 — Pagamento em dólar no dia*\n\nVocê também pode levar o valor em cash, em dólar, no dia da cerimônia.\nSe preferir essa opção, me avise para eu deixar registrado e te lembrar no dia, através do link abaixo:\n\n[Link]`;
                      const template = pmP.events?.payment_text || defaultTemplate;
                      const msg = template
                        .replace(/\[Link\]/g, paymentLink)
                        .replace(/\[Nome\]/g, firstName)
                        .replace(/\[dias_da_cerimônia\]/g, daysStr);
                      window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    style={{ width: '100%', padding: '8px', background: 'transparent', color: '#5d9470', border: '0.5px solid #9dcfb4', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <WaIcon /> cobrar via whatsapp
                  </button>
                )}
                <button onClick={() => setPaymentModal(null)}
                  style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Orphan (transfer-only) payment modal */}
      {orphanModal && (() => {
        const totalOwed = orphanModal.transfersList.reduce((s, t) => s + Number(t.amount), 0);
        const myPayments = orphanPayments.filter(p => p.contact_id === orphanModal.contactId);
        const totalPaid = myPayments.reduce((s, p) => s + Number(p.amount), 0);
        const remaining = Math.max(0, totalOwed - totalPaid);
        return (
          <div onClick={() => setOrphanModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '340px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace", maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ padding: '1.2rem 1.5rem 0.9rem', borderBottom: '0.5px solid #d0cbc2' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Registro de pagamento</div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#3a3530', lineHeight: 1.1 }}>{orphanModal.name}</div>
                <div style={{ fontSize: '9px', color: '#aaa49c', marginTop: '2px', fontStyle: 'italic' }}>Transferências recebidas — não participa de nenhuma cerimônia</div>
              </div>

              <div style={{ padding: '1rem 1.5rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  {[['Saldo total', totalOwed], ['Pago', totalPaid], ['Restante', remaining]].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontSize: '14px', color: remaining === 0 && label === 'Restante' ? '#6a7c45' : '#3a3530' }}>$ {Number(val).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {remaining > 0 && (
                <div style={{ padding: '0 1.5rem 0' }}>
                  <button onClick={() => setOrphanModal(prev => ({ ...prev, formOpen: !prev.formOpen, method: prev.method || 'Câmbio', paymentAmount: prev.paymentAmount ?? String(remaining.toFixed(2)), paymentDate: prev.paymentDate ?? new Date().toISOString().split('T')[0] }))}
                    style={{ width: '100%', padding: '8px 10px', background: orphanModal.formOpen ? '#3a3530' : 'transparent', color: orphanModal.formOpen ? '#f7f4ee' : '#7a7268', border: orphanModal.formOpen ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span>+</span><span>Inserir pagamento</span>
                  </button>
                  {orphanModal.formOpen && (
                    <div style={{ marginTop: '0.6rem', padding: '0.7rem 0.9rem', background: '#faf7f0', border: '0.5px solid #d0cbc2', borderRadius: '2px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                        {['Câmbio', 'PIX', 'Wise', 'Espécie'].map(m => (
                          <button key={m} onClick={() => setOrphanModal(prev => ({ ...prev, method: m }))}
                            style={{ padding: '6px 10px', background: orphanModal.method === m ? '#3a3530' : 'transparent', border: orphanModal.method === m ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: orphanModal.method === m ? '#f7f4ee' : '#7a7268' }}>
                            {m}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>Valor (USD)</div>
                          <input type="number" min="0" max={remaining} step="0.01" value={orphanModal.paymentAmount}
                            onChange={e => setOrphanModal(prev => ({ ...prev, paymentAmount: e.target.value }))}
                            placeholder="0.00" autoFocus
                            style={{ width: '90px', padding: '6px 8px', background: '#fff', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '2px' }}>Data</div>
                          <input type="date" value={orphanModal.paymentDate}
                            onChange={e => setOrphanModal(prev => ({ ...prev, paymentDate: e.target.value }))}
                            style={{ padding: '6px 8px', background: '#fff', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none' }} />
                        </div>
                        <button onClick={() => {
                          if (!orphanModal.paymentAmount || !orphanModal.paymentDate) return;
                          registerOrphanPayment(orphanModal.contactId, orphanModal.paymentAmount, orphanModal.paymentDate, orphanModal.method);
                        }}
                          style={{ padding: '7px 12px', background: '#3a3530', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ok</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {myPayments.length > 0 && (
                <div style={{ padding: '1rem 1.5rem 0' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.4rem' }}>Pagamentos registrados</div>
                  {myPayments.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '0.5px solid #ece8e0' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#3a3530' }}>$ {Number(p.amount).toFixed(2)}</span>
                        {p.method && <span style={{ fontSize: '9px', color: '#aaa49c', marginLeft: '6px' }}>{p.method}</span>}
                        {p.payment_date && <span style={{ fontSize: '9px', color: '#aaa49c', marginLeft: '6px' }}>{new Date(p.payment_date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                      </div>
                      <button onClick={() => cancelOrphanPayment(p.id)}
                        style={{ fontSize: '9px', color: '#c47b5a', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>cancelar</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding: '1.5rem' }}>
                <button onClick={() => setOrphanModal(null)}
                  style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* OBS modal */}
      {/* Resumo modal */}
      {resumoModal && (
        <div onClick={() => setResumoModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace" }}>
            <div style={{ padding: '1.2rem 1.5rem 0.9rem', borderBottom: '0.5px solid #d0cbc2', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '22px', color: '#3a3530' }}>Resumo de pagamentos</div>
              <button onClick={() => setResumoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9a9288', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: '1rem 1.5rem 0' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Cerimônias</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {allCeremonies.map(c => {
                  const isSelected = resumoCeremonies.has(c.id);
                  return (
                    <button key={c.id} onClick={() => toggleResumoCeremony(c.id)}
                      style={{ padding: '4px 10px', background: isSelected ? '#3a3530' : 'transparent', border: isSelected ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: isSelected ? '#f7f4ee' : '#7a7268' }}>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '1.2rem 1.5rem 1.5rem' }}>
              {resumoCeremonies.size === 0 ? (
                <div style={{ fontSize: '11px', color: '#aaa49c', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>selecione uma ou mais cerimônias acima.</div>
              ) : (
                <>
                  <ResumoMetric label={`Pessoas de 2 dias${resumoSummary.twoDay.price != null ? ` × $${Number(resumoSummary.twoDay.price).toFixed(2)}` : ''}`}
                    count={resumoSummary.twoDay.groups.length} total={resumoSummary.twoDay.total} groups={resumoSummary.twoDay.groups}
                    expandKey="2d" expanded={resumoExpanded} onToggle={toggleResumoExpanded} />
                  <ResumoMetric label={`Pessoas de 1 dia${resumoSummary.oneDay.price != null ? ` × $${Number(resumoSummary.oneDay.price).toFixed(2)}` : ''}`}
                    count={resumoSummary.oneDay.groups.length} total={resumoSummary.oneDay.total} groups={resumoSummary.oneDay.groups}
                    expandKey="1d" expanded={resumoExpanded} onToggle={toggleResumoExpanded} />
                  <ResumoMetric label="Descontos concedidos" showAmountPer="discount"
                    count={resumoSummary.discounted.groups.length} total={resumoSummary.discounted.total} groups={resumoSummary.discounted.groups}
                    expandKey="desc" expanded={resumoExpanded} onToggle={toggleResumoExpanded} color="#8a7a58" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.7rem 0', marginTop: '0.4rem', borderTop: '0.5px solid #3a3530' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a3530', fontWeight: 'bold' }}>Total cobrado</span>
                    <span style={{ fontSize: '15px', color: '#3a3530', fontFamily: "'Courier Prime', monospace", fontWeight: 'bold' }}>$ {resumoSummary.totalCobrado.toFixed(2)}</span>
                  </div>

                  <div style={{ borderTop: '0.5px dashed #d0cbc2', margin: '1.1rem 0' }} />

                  <ResumoMetric label="Total a pagar" showAmountPer="owed" color="#b0a898"
                    count={resumoSummary.aPagar.groups.length} total={resumoSummary.aPagar.total} groups={resumoSummary.aPagar.groups}
                    expandKey="apagar" expanded={resumoExpanded} onToggle={toggleResumoExpanded} />
                  <ResumoMetric label="Total a receber no local" showAmountPer="owed" color="#8a7a58"
                    count={resumoSummary.noLocal.groups.length} total={resumoSummary.noLocal.total} groups={resumoSummary.noLocal.groups}
                    expandKey="local" expanded={resumoExpanded} onToggle={toggleResumoExpanded} />
                  <ResumoMetric label="Total pago" showAmountPer="paidSoFar" color="#5d9470"
                    count={resumoSummary.pago.groups.length} total={resumoSummary.pago.total} groups={resumoSummary.pago.groups}
                    categories={resumoSummary.pagoCategories}
                    expandKey="pago" expanded={resumoExpanded} onToggle={toggleResumoExpanded} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.7rem 0', marginTop: '0.4rem', borderTop: '0.5px solid #3a3530' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3a3530', fontWeight: 'bold' }}>Total a receber</span>
                    <span style={{ fontSize: '15px', color: resumoSummary.totalAReceber.toFixed(2) === resumoSummary.totalCobrado.toFixed(2) ? '#3a3530' : '#c4892a', fontFamily: "'Courier Prime', monospace", fontWeight: 'bold' }}>
                      $ {resumoSummary.totalAReceber.toFixed(2)}
                    </span>
                  </div>

                  {resumoSummary.inconsistencias.length > 0 && (
                    <div style={{ marginTop: '0.6rem', padding: '0.7rem 0.9rem', background: '#fef8ec', border: '0.5px solid #e8c97a', borderRadius: '2px' }}>
                      <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b07a20', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                        ⚠ Transferiu mais do que o preço cobrado
                      </div>
                      {resumoSummary.inconsistencias.map(g => (
                        <div key={g.contactId} style={{ fontSize: '10px', color: '#7a5a20', fontFamily: "'Courier Prime', monospace", display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '1px 0' }}>
                          <span>{g.name}</span>
                          <span style={{ flexShrink: 0 }}>transferiu ${g._sumOut.toFixed(2)} · cobrado ${g.price.toFixed(2)} · excesso +${g._excess.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {obsModal && (
        <div onClick={() => setObsModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '340px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace" }}>
            <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '18px', color: '#3a3530', marginBottom: '0.8rem' }}>{obsModal.name}</div>
            <p style={{ fontSize: '12px', color: '#5a5048', fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 1rem' }}>"{obsModal.text}"</p>
            <button onClick={() => setObsModal(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>fechar</button>
          </div>
        </div>
      )}

      {/* Transfer modal */}
      {transferModal && (
        <div onClick={() => setTransferModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '340px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace" }}>
            <div style={{ padding: '1.2rem 1.5rem 0.9rem', borderBottom: '0.5px solid #d0cbc2' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Transferir pagamento</div>
              <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#3a3530', lineHeight: 1.1 }}>{transferModal.fromName}</div>
            </div>
            <div style={{ padding: '1rem 1.5rem 0' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Responsável (pessoa já cadastrada)</div>
              <select value={transferModal.toContactId} onChange={e => setTransferModal(prev => ({ ...prev, toContactId: e.target.value }))}
                style={{ width: '100%', padding: '8px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none', boxSizing: 'border-box' }}>
                <option value="">selecionar pessoa...</option>
                {contactsList.filter(c => c.id !== transferModal.fromContactId).map(c => (
                  <option key={c.id} value={c.id}>{c.nickname || c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ padding: '1rem 1.5rem 0' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Valor transferido (USD)</div>
              <input type="number" min="0" step="0.01" value={transferModal.amount}
                onChange={e => setTransferModal(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                style={{ width: '100%', padding: '7px 8px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ padding: '1rem 1.5rem 0' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Observação (opcional)</div>
              <textarea value={transferModal.observation} onChange={e => setTransferModal(prev => ({ ...prev, observation: e.target.value }))} rows={2}
                placeholder="Ex: paga metade do valor de fulano"
                style={{ width: '100%', padding: '8px', background: '#faf7f0', border: '0.5px dashed #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ padding: '1rem 1.5rem 1.2rem', display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
              <button onClick={createTransfer} disabled={!transferModal.toContactId || !transferModal.amount}
                style={{ flex: 1, padding: '8px', background: (transferModal.toContactId && transferModal.amount) ? '#3a3530' : '#d0cbc2', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: (transferModal.toContactId && transferModal.amount) ? 'pointer' : 'not-allowed', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                confirmar transferência
              </button>
              <button onClick={() => setTransferModal(null)}
                style={{ padding: '8px 14px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                cancelar
              </button>
            </div>
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <div style={{ flex: 1, fontSize: '10px', color: '#3a3530', lineHeight: 1.5 }}>
                      {entry.type === 'conferido' ? 'Conferido' :
                       entry.type === 'confirmado_local' ? `Confirmado por ${entry.by} em ${new Date(entry.at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })}` :
                       <>{entry.by && <span style={{ fontWeight: 600 }}>{entry.by} </span>}{entry.msg}</>}
                      {entry.url && (
                        <a href={entry.url} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'inline-block', marginLeft: '6px', color: '#5d9470', fontSize: '9px', letterSpacing: '0.04em', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                          📎 ver comprovante
                        </a>
                      )}
                    </div>
                    {entry.prev && (logModal.isMerged ? (i === 0 && logModal.mergedParticipant) : true) && (
                      <button
                        onClick={() => {
                          if (!confirm(`Reverter para "${prevToLabel(entry.prev)}"?`)) return;
                          if (logModal.isMerged) { revertEntry(logModal.mergedParticipant); setLogModal(null); }
                          else revertToLogEntry(logModal.contactId, logModal.eventId, entry);
                        }}
                        title={`Reverter para o estado antes desta ação (${prevToLabel(entry.prev)})`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4892a', fontSize: '15px', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>↺</button>
                    )}
                  </div>
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
