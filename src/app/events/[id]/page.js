'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CeremonyFormModal from '@/components/CeremonyFormModal';

const ForwardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <polyline points="15 14 20 9 15 4"/>
    <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const WaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

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

const ClockIcon = ({ active }) => active ? (
  <svg width="14" height="14" viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" fill="#5d9470"/>
    <polyline points="12 6 12 12 16 14" fill="none" stroke="#f7f4ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
) : (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const PinIcon = ({ active }) => active ? (
  <svg width="14" height="14" viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#5d9470"/>
    <circle cx="12" cy="10" r="3" fill="#f7f4ee"/>
  </svg>
) : (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const TransferIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const PillIcon = ({ status = 'pending', size = 22, strokeColor }) => {
  const isOk = status === 'ok';
  const isAttn = status === 'attention';
  const isWarn = status === 'warn';
  const fill = isOk ? '#5d9470' : isAttn ? '#c0392b' : isWarn ? '#e0a820' : 'none';
  const stroke = (!isOk && !isAttn && !isWarn) ? (strokeColor || '#c8c2b8') : 'none';
  const lineColor = (!isOk && !isAttn && !isWarn) ? (strokeColor || '#c8c2b8') : 'rgba(255,255,255,0.5)';
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block', flexShrink: 0 }}>
      <g transform="rotate(-38 8 8)">
        <rect x="1.5" y="5.5" width="13" height="5" rx="2.5" fill={fill} stroke={stroke} strokeWidth="0.9"/>
        <line x1="8" y1="5.5" x2="8" y2="10.5" stroke={lineColor} strokeWidth="0.7"/>
      </g>
    </svg>
  );
};

const CoinIcon = ({ status = 'em aberto' }) => {
  const isPago = status === 'pago';
  const isTransferido = status === 'transferido';
  const isLocal = status === 'a pagar no local';
  const isParcelado = status === 'parcelado';
  const isConferir = status === 'conferir pagamento';
  const isActive = isPago || isTransferido || isLocal || isParcelado || isConferir;
  const bg = isPago ? '#5d9470' : isTransferido ? '#b8960a' : isLocal ? '#8a7a58' : isParcelado ? '#7a68a4' : isConferir ? '#c4892a' : 'none';
  const fg = isActive ? '#f7f4ee' : '#c8c2b8';
  const symbol = isConferir ? '?' : '$';
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="10" cy="10" r="8.5" fill={bg} stroke={isActive ? 'none' : '#c8c2b8'} strokeWidth="0.9"/>
      <text x="10" y="10" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="normal" fontFamily="Georgia, serif" fill={fg}>{symbol}</text>
    </svg>
  );
};

// Dias em que a pessoa está inscrita nesta cerimônia (não o nome da cerimônia) — alguém pareado
// com outra cerimônia só tem 1 dia confirmado aqui, então o nome completo seria enganoso.
function getEnrolledDaysLabel(p, event) {
  const days = [];
  if (p?.date1_confirmed && event?.date) days.push(event.date);
  if (p?.date2_confirmed && event?.date2) days.push(event.date2);
  days.sort();
  const fmt = days.map(d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }));
  if (fmt.length === 0) return event?.name || 'Cerimônia';
  if (fmt.length === 1) return fmt[0];
  return `${fmt.slice(0, -1).join(', ')} e ${fmt[fmt.length - 1]}`;
}

function resolveVars(text, { firstName, p, event, pageUrl }) {
  const eventDates = [event?.date, event?.date2].filter(Boolean)
    .map(d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
  const dataCerimonia = eventDates.length > 1 ? `${eventDates[0]} e ${eventDates[1]}` : (eventDates[0] || '');
  const diaInscrito = getEnrolledDaysLabel(p, event);
  let msg = text
    .replace(/\[nome\]/gi, firstName || '')
    .replace(/\[nome da cerimônia\]/gi, event?.name || '')
    .replace(/\[data da cerimônia\]/gi, dataCerimonia)
    .replace(/\[dia inscrito\]/gi, diaInscrito);
  if (pageUrl) {
    msg = /\[link\]/i.test(msg) ? msg.replace(/\[link\]/gi, pageUrl) : msg + '\n\n' + pageUrl;
  } else {
    msg = msg.replace(/\[link\]/gi, '');
  }
  return msg;
}

// Linhas de memória de cálculo (somente leitura) — mesmo visual da tela de Pagamentos, mas sem
// botões de ação aqui: gerenciar transferência/pagamento continua sendo feito nos lugares de sempre.
function CalcBaseLine({ label, amount }) {
  return (
    <div style={{ background: '#f3f1ec', borderLeft: '0.5px solid #d0cbc2', borderRight: '0.5px solid #d0cbc2', borderBottom: '0.5px dashed #d0cbc2' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem' }}>
        <span style={{ flex: 1, fontSize: '10px', color: '#9a9288', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em', fontStyle: 'italic' }}>⛯ {label}</span>
        <span style={{ fontSize: '10px', color: '#9a9288', fontFamily: "'Courier Prime', monospace", flexShrink: 0 }}>$ {Number(amount).toFixed(2)}</span>
      </div>
    </div>
  );
}

function CalcRecordLine({ rec, isLast }) {
  const dateStr = rec.date ? new Date(rec.date + 'T12:00:00').toLocaleDateString('pt-BR') : null;
  const bg = rec.pledge ? '#fbf6ec' : '#eef3ef';
  const color = rec.pledge ? '#8a7a58' : '#5d8a6a';
  return (
    <div style={{ background: bg, borderLeft: '0.5px solid #d0cbc2', borderRight: '0.5px solid #d0cbc2', borderBottom: isLast ? '0.5px solid #d0cbc2' : '0.5px dashed #d0cbc2', borderRadius: isLast ? '0 0 2px 2px' : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem' }}>
        <span style={{ flex: 1, fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em' }}>
          {rec.pledge ? 'a pagar no local' : `pagamento${dateStr ? ` em ${dateStr}` : ''}${rec.method ? ` via ${rec.method}` : ''}`}
        </span>
        <span style={{ fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", flexShrink: 0 }}>-$ {Number(rec.amount).toFixed(2)}</span>
      </div>
    </div>
  );
}

function CalcTransferLine({ t, direction, isLast }) {
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
        <span style={{ fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", flexShrink: 0 }}>{out ? '-' : '+'}$ {Number(t.amount).toFixed(2)}</span>
      </div>
      {t.observation && (
        <div style={{ padding: '0 1rem 0.4rem', fontSize: '9px', color, fontStyle: 'italic', opacity: 0.85 }}>"{t.observation}"</div>
      )}
    </div>
  );
}

function CalcDiscountLine({ amount, isLast }) {
  const color = '#a08850';
  const bg = '#fdf6ea';
  const border = '#e8d8b0';
  return (
    <div style={{ background: bg, borderLeft: `0.5px solid ${border}`, borderRight: `0.5px solid ${border}`, borderBottom: isLast ? `0.5px solid ${border}` : `0.5px dashed ${border}`, borderRadius: isLast ? '0 0 2px 2px' : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem' }}>
        <span style={{ flex: 1, fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em' }}>◐ desconto</span>
        <span style={{ fontSize: '10px', color, fontFamily: "'Courier Prime', monospace", flexShrink: 0 }}>-$ {Number(amount).toFixed(2)}</span>
      </div>
    </div>
  );
}

const DocumentIcon = ({ active }) => active ? (
  <svg width="14" height="14" viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#5d9470"/>
    <polyline points="14 2 14 8 20 8" fill="none" stroke="#f7f4ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" stroke="#f7f4ee" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="17" x2="8" y2="17" stroke="#f7f4ee" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
) : (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

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
          <button
            onClick={e => { e.stopPropagation(); if (confirm('Retornar ao status anterior?')) onRevert(); }}
            title="Retornar ao status anterior"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4892a', fontSize: '15px', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
          >↺</button>
        )}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onOpenModal(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#9a9288', letterSpacing: '0.06em', padding: '0', textDecoration: 'underline', textUnderlineOffset: '2px', textAlign: 'left' }}
      >
        histórico{log.length > 1 ? ` (${log.length})` : ''}
      </button>
    </div>
  );
}

// ── Estilos como objeto JS (Moleskine Theme) ──────────────────────────────
const s = {
  page: {
    fontFamily: "'Caveat', cursive",
    background: "#f7f4ee",
    minHeight: "100vh",
    padding: "0",
    boxSizing: "border-box",
    position: "relative",
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
    borderBottom: '0.5px solid #5d9470',
    paddingBottom: '2px',
  },
  marginLine: {
    position: "absolute",
    left: "3.2rem",
    top: 0,
    bottom: 0,
    width: "1px",
    background: "#e8c8c8",
    opacity: 0.45,
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    zIndex: 1,
    paddingLeft: "1.5rem",
    padding: "2rem 2.5rem 4rem",
    maxWidth: "900px",
    margin: "0 auto",
  },
  back: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: "11px",
    color: "#aaa49c",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "1.4rem",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontFamily: "'IM Fell English', serif",
    fontSize: "52px",
    color: "#3a3530",
    fontWeight: 400,
    lineHeight: 1.05,
    margin: 0,
  },
  actionsCol: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "6px",
  },
  btn: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: "10px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#7a7268",
    border: "0.5px dashed #b8b0a4",
    background: "transparent",
    padding: "6px 13px",
    borderRadius: "2px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    whiteSpace: "nowrap",
  },
  datesRow: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: "12px",
    color: "#9a9288",
    display: "flex",
    gap: "1.5rem",
    marginTop: "6px",
    marginBottom: "2rem",
    letterSpacing: "0.06em",
  },
  dateLabel: {
    color: "#7a7268",
    fontWeight: "bold",
    marginRight: "5px",
  },
  divider: {
    border: "none",
    borderTop: "0.5px solid #c8c2b8",
    margin: "0 0 1.5rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "6px",
  },
  sectionTitle: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#6a6460",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionNote: {
    fontFamily: "'Caveat', cursive",
    fontSize: "13px",
    color: "#b0a898",
    fontStyle: "italic",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "160px 70px 58px 58px 98px 100px 38px 38px 58px",
    fontFamily: "'Courier Prime', monospace",
    fontSize: "9px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#9a9288",
    paddingBottom: "8px",
    borderBottom: "0.5px solid #d0cbc2",
    gap: "8px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "160px 70px 58px 58px 98px 100px 38px 38px 58px",
    padding: "14px 0",
    borderBottom: "0.5px dashed #ddd9cf",
    gap: "8px",
    alignItems: "center",
  },
  travelerName: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: "14px",
    color: "#3a3530",
    fontWeight: 600,
    lineHeight: 1.1,
  },
  travelerPhone: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: "10px",
    color: "#9a9288",
    marginTop: "2px",
  },
  daysCell: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },
  dayTag: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: "10px",
    color: "#8a8278",
    border: "0.5px solid #c8c2b8",
    padding: "2px 5px",
    borderRadius: "2px",
  },
  statusIcons: {
    display: "flex",
    gap: "9px",
    alignItems: "center",
    color: "#c0b8b0",
    fontSize: "14px",
    cursor: "pointer",
  },
  medConfirmed: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "'Courier Prime', monospace",
    fontSize: "10px",
    padding: "3px 8px",
    borderRadius: "2px",
    border: "0.5px solid #9dcfb4",
    color: "#5d9470",
    background: "#eef7f2",
  },
  medSent: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "'Courier Prime', monospace",
    fontSize: "10px",
    padding: "3px 8px",
    borderRadius: "2px",
    border: "0.5px solid #c8c2b8",
    color: "#9a9288",
    background: "transparent",
  },
  paidCell: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: "10px",
    color: "#9a9288",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    letterSpacing: "0.06em",
    whiteSpace: "nowrap",
  },
  vagaReservado: {
    display: "inline-block",
    fontFamily: "'Courier Prime', monospace",
    fontSize: "10px",
    color: "#8a7a58",
    border: "0.5px solid #c8b888",
    padding: "3px 8px",
    borderRadius: "2px",
    letterSpacing: "0.04em",
    background: "#faf7f0",
  },
  vagaLivre: {
    display: "inline-block",
    fontFamily: "'Courier Prime', monospace",
    fontSize: "10px",
    color: "#9a9288",
    border: "0.5px dashed #c8c2b8",
    padding: "3px 8px",
    borderRadius: "2px",
    letterSpacing: "0.04em",
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#c8b8b8",
    fontSize: "14px",
    padding: 0,
    lineHeight: 1,
    transition: "color 0.15s",
  },
  section2Title: {
    fontFamily: "'Courier Prime', monospace",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#aaa49c",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 0 8px",
    borderTop: "0.5px solid #d0cbc2",
    marginTop: "2rem",
  },
  emptyNote: {
    fontFamily: "'Caveat', cursive",
    fontSize: "15px",
    color: "#c0b8b0",
    fontStyle: "italic",
    padding: "10px 0 4px",
  },
  cornerDeco: {
    position: "absolute",
    bottom: "1.2rem",
    right: "2rem",
    fontFamily: "'Courier Prime', monospace",
    fontSize: "10px",
    color: "#c8c2b8",
    letterSpacing: "0.12em",
  },
};

function computeFichaAlerts(contact) {
  const fd = contact?.medical_form_data;
  if (!fd) return null;
  const meds = contact?.medications_list || [];
  const redFlags = [];
  if (fd.sec2_historico) redFlags.push('Histórico psiquiátrico informado' + (fd.sec2_historico_obs ? `: ${fd.sec2_historico_obs}` : ''));
  if (fd.sec4b_dependencia) redFlags.push('Dependência química informada');
  if (fd.sec5_duvidas) redFlags.push('Tem dúvidas no formulário');
  const hasMeds = fd.sec4b_remedio === false;
  const medsList = meds.map(m => [m.name, m.dosage, m.frequency].filter(Boolean).join(' ')).filter(Boolean);
  const outros = fd.sec4c_outros?.trim() || '';
  const unchecked = [];
  for (const sec of FICHA_SECTIONS) {
    for (const item of (sec.items || [])) {
      if (item.pos && !fd[item.k] && item.k !== 'sec4b_remedio') unchecked.push(item.t);
    }
  }
  return { redFlags, hasMeds, medsList, outros, unchecked };
}

function computeEffectiveRemedioStatus(p) {
  if (p.remedio_status === 'Ok Manual') return 'Ok Manual';
  if (p.remedio_status === 'Acompanhar') return 'Acompanhar';
  const r = p.contacts?.remedio;
  const fichaComplete = r === 'não' || r === 'em andamento';
  if (!fichaComplete) {
    if (p.remedio_status === 'enviado') return 'enviado';
    return 'enviar';
  }
  if (r === 'não') return 'Ok';
  return 'preenchido';
}

const FICHA_SECTIONS = [
  { title: '1. Declaração inicial', intro: 'Como participante, declaro que:', items: [
    { k: 'sec1_maioridade', t: 'Sou adulto legalmente responsável e tenho capacidade plena para decidir.', full: 'Sou adulto legalmente responsável e tenho capacidade plena para decidir sobre minha participação.', pos: true },
    { k: 'sec1_voluntaria', t: 'Minha participação é voluntária e consciente.', full: 'Minha participação é voluntária, consciente e baseada nas informações que recebi até o momento.', pos: true },
    { k: 'sec1_instrucoes', t: 'Comprometo-me a seguir as instruções da equipe antes, durante e depois.', full: 'Comprometo-me a seguir as instruções da equipe antes, durante e depois da experiência.', pos: true },
    { k: 'sec1_conforto', t: 'Sinto-me confortável em praticar autorreflexão e comunicação honesta.', full: 'Sinto-me confortável em praticar autorreflexão, escutar com atenção, comunicar-me de forma honesta e assumir responsabilidade por questões emocionais, psicológicas ou pessoais que possam surgir.', pos: true },
  ]},
  { title: '2. Saúde mental e histórico psiquiátrico', intro: 'Confirmo que:', items: [
    { k: 'sec2_esquizofrenia', t: 'Sem diagnóstico de esquizofrenia, transtornos psicóticos, bipolaridade ou transtornos de personalidade.', full: 'Não tenho diagnóstico atual ou histórico conhecido de esquizofrenia, transtornos psicóticos, transtorno bipolar tipo I ou II, ou transtornos de personalidade, incluindo, mas não se limitando a transtorno de personalidade borderline, narcisista ou esquizoide.', pos: true },
    { k: 'sec2_familiar', t: 'Sem histórico familiar de esquizofrenia ou psicose.', full: 'Não tenho histórico familiar conhecido de esquizofrenia ou transtornos psicóticos graves.', pos: true },
    { k: 'sec2_instaveis', t: 'Sem condição de saúde mental incapacitante, instável ou aguda no momento.', full: 'Não tenho condição de saúde mental incapacitante, instável ou aguda, incluindo crises psiquiátricas recentes, episódios dissociativos graves, mania, psicose, depressão severa descompensada ou condição relacionada a dependência química não estabilizada.', pos: true },
    { k: 'sec2_ideacao', t: 'Sem ideação suicida ou homicida atual ou recente.', full: 'Não tenho ideação suicida ou homicida, atual ou recente.', pos: true },
    { k: 'sec2_raiva', t: 'Sem problemas graves de controle de raiva ou impulsividade.', full: 'Não tenho problemas graves ou recorrentes de controle de raiva, impulsividade ou comportamento agressivo.', pos: true },
    { k: 'sec2_historico', t: 'Tem ou já teve condição psiquiátrica, emocional ou comportamental relevante não informada.', full: 'Tenho ou já tive condição psiquiátrica, emocional ou comportamental relevante que ainda não informei.', pos: false },
  ]},
  { title: '3. Saúde física e histórico médico', intro: 'Confirmo que:', items: [
    { k: 'sec3_cushing', t: 'Sem síndrome de Cushing.', full: 'Não tenho síndrome de Cushing.', pos: true },
    { k: 'sec3_incapacitante', t: 'Sem condição médica incapacitante, instável ou de risco relevante.', full: 'Não tenho condição médica incapacitante, instável ou relevante que possa representar risco aumentado durante a experiência.', pos: true },
    { k: 'sec3_cardio', t: 'Sem doenças cardiovasculares, hipertensão não controlada, aneurisma ou arritmias.', full: 'Não tenho doenças cardiovasculares, hipertensão não controlada, aneurisma, arritmias graves ou outras condições cardíacas ou circulatórias importantes.', pos: true },
    { k: 'sec3_neuro', t: 'Sem distúrbios neurológicos relevantes (AVC, epilepsia, convulsões, etc.).', full: 'Não tenho histórico de distúrbios neurológicos relevantes, incluindo, mas não se limitando a AVC, epilepsia, convulsões, lesão cerebral grave ou outras condições neurológicas importantes.', pos: true },
  ]},
  { title: '4. Medicamentos, suplementos e substâncias', intro: 'Confirmo que:', items: [
    { k: 'sec4a_informar', t: 'Comprometeu-se a informar completamente tudo que usa ou usou no último mês.', full: 'Informarei de forma completa e verdadeira todos os medicamentos, suplementos, substâncias, tratamentos ou produtos que estou usando atualmente ou que usei no último mês.', pos: true },
    { k: 'sec4a_informar_tudo', t: 'Entende que deve informar tudo, mesmo que pareça irrelevante.', full: 'Entendo que devo informar tudo, mesmo que pareça irrelevante, ocasional, natural, recreativo, prescrito, não prescrito ou de venda livre.', pos: true },
    { k: 'sec4a_sem_psicodelicos', t: 'Sem experiências psicodélicas nos 15 dias anteriores e até 5 dias após a cerimônia.', full: 'Não participarei de qualquer experiência com substâncias psicodélicas, enteógenas ou psicoativas nos 15 dias que antecedem a cerimônia e até 5 dias após a cerimônia — entre elas ayahuasca, psilocibina, LSD, MDMA, DMT, mescalina, iboga, ketamina e microdosagem, sem se limitar a essas.', pos: true },
    { k: 'sec4a_nao_portar', t: 'Comprometo-me a não portar ou consumir substâncias não autorizadas durante a experiência.', full: 'Comprometo-me a não levar, portar, compartilhar ou consumir durante a experiência qualquer substância, medicina, planta, suplemento ou produto psicoativo, incluindo, mas não se limitando a cannabis, rapé, sananga, álcool, estimulantes, sedativos, psicodélicos, enteógenos ou medicamentos de uso não informado, ciente de que o descumprimento deste compromisso poderá resultar na minha exclusão da experiência atual e de futuras cerimônias.', pos: true },
    { k: 'sec4b_dependencia', t: 'Tem histórico de dependência de álcool, drogas, medicamentos ou outras substâncias.', full: 'Tenho histórico de dependência, abuso ou uso problemático de álcool, drogas, medicamentos prescritos ou outras substâncias.', pos: false },
    { k: 'sec4b_remedio', t: 'Não está usando nenhum medicamento ou substância que possa interagir com psicodélicos.', full: 'Não estou usando nenhum medicamento, suplemento ou substância que possa interagir com psicodélicos ou enteógenos — incluindo medicamentos psiquiátricos (antidepressivos, ISRSs, IRSNs, IMAOs, estabilizadores de humor, antipsicóticos, ansiolíticos, benzodiazepínicos, sedativos, hipnóticos, estimulantes), remédios para pressão, analgésicos, hormônios, antibióticos, suplementos, vitaminas, fitoterápicos (erva-de-são-joão, 5-HTP, triptofano, SAM-e, melatonina), cannabis, álcool, microdosagem ou qualquer outra substância.', pos: true },
    { k: 'sec4b_abstinencia_remedio', t: 'Compromete-se a informar qualquer alteração no uso de remédios até a cerimônia.', full: 'Comprometo-me a informar à organização qualquer alteração no uso de remédios e suplementos, de hoje até o dia da cerimônia.', pos: true },
  ]},
  { title: '5. Ciência sobre riscos e responsabilidade', intro: 'Declaro que:', items: [
    { k: 'sec5_informacoes', t: 'Recebeu informações suficientes para participar de forma voluntária e consciente.', full: 'Recebi informações suficientes para decidir participar de forma voluntária e consciente.', pos: true },
    { k: 'sec5_veracidade', t: 'Assume responsabilidade pela veracidade e completude das informações prestadas.', full: 'Assumo responsabilidade pela veracidade, completude e atualização das informações fornecidas por mim à equipe.', pos: true },
    { k: 'sec5_responsabilidade', t: 'Assume responsabilidade pela sua conduta antes, durante e após a experiência.', full: 'Assumo responsabilidade pela minha decisão de participar, pela minha conduta antes, durante e depois da experiência, e pelo cumprimento das orientações de segurança recebidas.', pos: true },
    { k: 'sec5_duvidas', t: 'Ainda tem dúvidas ou não compreendeu algum ponto do formulário.', full: 'Não compreendi algum ponto deste formulário ou ainda tenho dúvidas antes de assinar.', pos: false },
  ]},
  { title: '6. Confirmação final', items: [
    { k: 'sec6_confirma', t: 'Confirmou que as informações são verdadeiras, completas e atualizadas.', full: 'Confirmo que as informações fornecidas por mim neste formulário são verdadeiras, completas e atualizadas até a presente data.', pos: true },
  ]},
];

function computeVagaBadge(p, effectivePaymentStatus) {
  const effectiveRemedioStatus = computeEffectiveRemedioStatus(p);
  const hasRemedioOk = effectiveRemedioStatus === 'Ok' || effectiveRemedioStatus === 'Ok Manual';
  const ps = effectivePaymentStatus || p.payment_status;
  const hasPaymentOk = ps === 'pago' || ps === 'a pagar no local' || ps === 'transferido';
  if (p.status === 'Confirmado') return (hasRemedioOk && hasPaymentOk) ? 'Confirmado' : 'Reservado';
  return 'Pendente';
}

function MedBadge({ status }) {
  if (status === 'Ok' || status === 'Ok Manual')
    return <span style={s.medConfirmed}>✓ confirmado</span>;
  if (status === 'enviado' || status === 'preenchido')
    return <span style={s.medSent}>✉ enviado</span>;
  return <span style={s.medSent}>— pendente</span>;
}

export default function EventDetail({ params }) {
  const [eventId, setEventId] = useState(null);
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState(new Set());
  const [remedioModal, setRemedioModal] = useState(null);
  const [activeFichaContact, setActiveFichaContact] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dayFilter, setDayFilter] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'parcelado' | 'local' | 'payment' | 'discount' | null
  const [showCalcMemo, setShowCalcMemo] = useState(false);
  const [paymentSummaryOpen, setPaymentSummaryOpen] = useState(false);
  const [editingCeremony, setEditingCeremony] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [obsModal, setObsModal] = useState(null);
  const [otherEventsMap, setOtherEventsMap] = useState({});
  const [logModal, setLogModal] = useState(null);
  const [adminName, setAdminName] = useState('admin');
  const adminNameRef = useRef('admin');
  const [confirmPartialModal, setConfirmPartialModal] = useState(null);
  const [contactAllDays, setContactAllDays] = useState([]);
  const [crossCeremonyExpected, setCrossCeremonyExpected] = useState({});
  const [transfers, setTransfers] = useState([]);
  const [contactEditModal, setContactEditModal] = useState(null);
  const [savingContact, setSavingContact] = useState(false);
  // Ref (não state) porque 2 cliques rápidos no "salvar" disparam saveContact() na mesma
  // closure, antes do re-render que aplicaria o state — só a ref bloqueia de fato a 2ª chamada.
  const savingContactRef = useRef(false);
  const [activeOtherEvents, setActiveOtherEvents] = useState([]);
  const [transferModal, setTransferModal] = useState(null);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [diaryDateFilter, setDiaryDateFilter] = useState('today');
  const [diaryRangeFrom, setDiaryRangeFrom] = useState('');
  const [diaryRangeTo, setDiaryRangeTo] = useState('');
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!paymentSummaryOpen || !eventId) return;
    const conferirIds = participants
      .filter(p => p.payment_status === 'conferir pagamento')
      .map(p => p.contact_id);
    if (conferirIds.length === 0) { setOtherEventsMap({}); return; }
    supabase
      .from('event_participants')
      .select('contact_id, events(id, name)')
      .in('contact_id', conferirIds)
      .neq('event_id', eventId)
      .not('status', 'eq', 'desistiu')
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(row => {
          if (!row.events) return;
          if (!map[row.contact_id]) map[row.contact_id] = [];
          map[row.contact_id].push(row.events.name);
        });
        setOtherEventsMap(map);
      });
  }, [paymentSummaryOpen, eventId]);

  useEffect(() => {
    if (!paymentModal?.contactId) { setContactAllDays([]); return; }
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('event_participants')
      .select('date1_confirmed, date2_confirmed, events(date, date2)')
      .eq('contact_id', paymentModal.contactId)
      .not('status', 'eq', 'desistiu')
      .then(({ data }) => {
        const days = [];
        (data || []).forEach(row => {
          if (!row.events) return;
          if (row.date1_confirmed && row.events.date && row.events.date >= today)
            days.push(row.events.date);
          if (row.date2_confirmed && row.events.date2 && row.events.date2 >= today)
            days.push(row.events.date2);
        });
        days.sort();
        setContactAllDays(days);
      });
  }, [paymentModal?.contactId]);

  const exportFichaPDF = (contact) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Por favor, permita pop-ups para exportar o PDF.'); return; }

    const mfd = contact.medical_form_data || {};

    const medsHTML = contact.medications_list?.length > 0
      ? contact.medications_list.map(m => `
          <div class="med-card">
            <div class="med-name">${m.name}</div>
            <div class="med-desc">${[m.dosage, m.frequency, m.last_use ? 'Último uso: ' + m.last_use : ''].filter(Boolean).join(' · ') || ''}</div>
          </div>`).join('') + (mfd.sec4c_outros ? `<div class="obs-box"><strong>Outros:</strong> ${mfd.sec4c_outros}</div>` : '')
      : '<p class="no-info">Nenhum remédio informado.</p>';

    const itemOk = (it) => it.pos ? !!mfd[it.k] : !mfd[it.k];
    const sectionsHTML = FICHA_SECTIONS.map(sec => {
      const isSection4 = !!sec.items.find(it => it.k === 'sec4b_dependencia');
      const extraAfter = isSection4 ? `
        <div style="margin-top:0.8rem;">
          <div style="font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#3d6b52;border-bottom:1px solid #d4cbb8;padding-bottom:0.2rem;margin-bottom:0.5rem;">Lista de medicamentos, suplementos e substâncias informadas</div>
          ${medsHTML}
        </div>` : '';
      return `
      <div class="section-title">${sec.title}</div>
      ${sec.intro ? `<div class="section-intro">${sec.intro}</div>` : ''}
      <div class="declarations">
        ${sec.items.map(it => {
          const checked = !!mfd[it.k];
          const ok = itemOk(it);
          return `<div class="decl-row ${ok ? '' : 'concern'}">
            <span class="decl-check">${checked ? '☑' : '☐'}</span>
            <span class="decl-text">${it.full}</span>
          </div>`;
        }).join('')}
        ${sec.items.find(it => it.k === 'sec2_historico') && mfd.sec2_historico_obs
          ? `<div class="obs-box"><em>Mais informações:</em> ${mfd.sec2_historico_obs}</div>` : ''}
      </div>
      ${extraAfter}`;
    }).join('');

    const sigHTML = mfd.assinatura
      ? `<img src="${mfd.assinatura}" style="max-width:340px; height:100px; object-fit:contain; display:block; margin:0.5rem auto;" />`
      : `<div style="height:60px;border-bottom:1px solid #888;margin:1rem auto;width:340px;"></div>`;

    printWindow.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>Ficha Médica — ${contact.name}</title>
      <style>
        body { font-family: Georgia, serif; color: #2b2b2b; line-height:1.55; padding:2.5rem 3rem; max-width:800px; margin:0 auto; font-size:13px; }
        h1 { font-size:1.5rem; color:#3d6b52; text-align:center; letter-spacing:2px; text-transform:uppercase; border-bottom:2px double #8b7e66; padding-bottom:1rem; margin-bottom:0.3rem; }
        .subtitle { text-align:center; font-size:0.75rem; color:#777; text-transform:uppercase; letter-spacing:1px; margin-bottom:2rem; }
        .section-title { font-size:0.78rem; font-weight:bold; text-transform:uppercase; letter-spacing:1.5px; color:#3d6b52; border-bottom:1px solid #d4cbb8; padding-bottom:0.3rem; margin-top:1.8rem; margin-bottom:0.8rem; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.4rem 2rem; margin-bottom:0.5rem; font-size:12px; }
        .info-item .label { font-size:0.7rem; text-transform:uppercase; color:#777; display:block; }
        .section-intro { font-size:11px; color:#666; margin-bottom:0.4rem; font-style:italic; }
        .declarations { display:flex; flex-direction:column; gap:0.2rem; }
        .decl-row { display:flex; gap:0.6rem; align-items:flex-start; padding:0.3rem 0.5rem; border:0.5px solid #e5dfd3; background:#fafaf6; border-radius:2px; }
        .decl-row.concern { background:#fff8f0; border:0.5px solid #e8c080; }
        .decl-check { flex-shrink:0; font-size:13px; width:16px; line-height:1.4; }
        .decl-row.concern .decl-check { color:#d4821a; }
        .decl-row:not(.concern) .decl-check { color:#3d6b52; }
        .decl-text { font-size:11px; color:#2b2b2b; line-height:1.5; }
        .decl-row.concern .decl-text { color:#7a3d00; font-weight:500; }
        .obs-box { margin-top:0.3rem; padding:0.4rem 0.6rem; background:#fff8f0; border:0.5px solid #e8c080; border-radius:2px; font-size:11px; color:#5a3a00; font-style:italic; }
        .med-card { padding:0.5rem 0.8rem; background:#faf9f6; border-left:3px solid #3d6b52; border:0.5px solid #e8e2d5; border-left:3px solid #3d6b52; border-radius:4px; margin-bottom:0.5rem; }
        .med-name { font-weight:bold; color:#1a1a1a; font-size:12px; }
        .med-desc { font-size:10px; color:#666; font-style:italic; margin-top:0.1rem; }
        .no-info { color:#888; font-style:italic; font-size:11px; }
        .sig-area { margin-top:2rem; padding-top:1rem; border-top:1px solid #d4cbb8; text-align:center; page-break-inside:avoid; }
        .sig-date { font-size:10px; color:#888; text-transform:uppercase; letter-spacing:1px; margin-top:0.3rem; }
        @media print { body { padding:1cm; } }
      </style>
    </head><body>
      <h1>Formulário de Triagem</h1>
      <div class="subtitle">Journey · Confidencial · ${new Date().toLocaleDateString('pt-BR')}</div>

      <div class="section-title">Identificação</div>
      <div class="info-grid">
        <div class="info-item"><span class="label">Nome</span>${mfd.nome_completo || contact.name || '—'}</div>
        <div class="info-item"><span class="label">Data de Nascimento</span>${mfd.data_nascimento || '—'}</div>
        <div class="info-item"><span class="label">Telefone</span>${mfd.telefone ? (mfd.telefone_ddi || '') + ' ' + mfd.telefone : contact.phone || '—'}</div>
        <div class="info-item"><span class="label">Contato de Emergência</span>${mfd.contato_emergencia || '—'}</div>
        <div class="info-item"><span class="label">CPF</span>${contact.cpf || '—'}</div>
        <div class="info-item"><span class="label">Status Remédios</span>${contact.remedio === 'não' ? 'Declarou não usar' : 'Possui remédios'}</div>
      </div>

      ${sectionsHTML}

      <div class="sig-area">
        <div style="font-size:11px;color:#888;margin-bottom:0.5rem;">Assinatura do participante</div>
        ${sigHTML}
        <div class="sig-date">Assinado em ${mfd.data_assinatura || new Date().toLocaleDateString('pt-BR')} · ${mfd.nome_completo || contact.name}</div>
      </div>

      <script>window.onload = function() { setTimeout(function() { window.print(); }, 400); }</script>
    </body></html>`);
    printWindow.document.close();
  };

  useEffect(() => {
    // Resolve params de forma compatível com Next.js antigo (síncrono) e novo (assíncrono)
    Promise.resolve(params).then((resolved) => {
      if (resolved && resolved.id) {
        setEventId(resolved.id);
      }
    });
  }, [params]);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  async function fetchEventData() {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const _name = (user.email || 'admin').split('@')[0];
    setAdminName(_name);
    adminNameRef.current = _name;

    // Fetch Event Details
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventData) setEvent(eventData);

    // Fetch Participants
    const { data: partData } = await supabase
      .from('event_participants')
      .select('*, contacts(*)')
      .eq('event_id', eventId);
      
    if (partData) setParticipants(partData);

    // Cross-ceremony pricing: find contacts with days in other active ceremonies within 29 days
    if (partData && partData.length > 0 && eventData) {
      const contactIds = partData.map(p => p.contact_id).filter(Boolean);
      const { data: otherParts } = await supabase
        .from('event_participants')
        .select('contact_id, date1_confirmed, date2_confirmed, events!inner(date, date2, price_2d, active)')
        .in('contact_id', contactIds)
        .neq('event_id', eventId)
        .not('status', 'eq', 'desistiu');

      const thisDatesByContact = {};
      partData.forEach(p => {
        thisDatesByContact[p.contact_id] = [];
        if (p.date1_confirmed && eventData.date) thisDatesByContact[p.contact_id].push(eventData.date);
        if (p.date2_confirmed && eventData.date2) thisDatesByContact[p.contact_id].push(eventData.date2);
      });

      const crossMap = {};
      (otherParts || [])
        .filter(p => p.events?.active !== false)
        .forEach(p => {
          const otherDays = [];
          if (p.date1_confirmed && p.events?.date) otherDays.push(p.events.date);
          if (p.date2_confirmed && p.events?.date2) otherDays.push(p.events.date2);
          const thisDays = thisDatesByContact[p.contact_id] || [];
          for (const d1 of otherDays) {
            for (const d2 of thisDays) {
              if (Math.abs(new Date(d1) - new Date(d2)) / 86400000 <= 29) {
                crossMap[p.contact_id] = eventData.price_2d != null ? eventData.price_2d / 2 : null;
                break;
              }
            }
          }
        });
      setCrossCeremonyExpected(crossMap);
    }

    const { data: contactsData } = await supabase.from('contacts').select('id, name, nickname, nome_completo, phone').order('nickname');
    if (contactsData) setAllContacts(contactsData);

    const { data: otherEventsData } = await supabase.from('events').select('id, name, date').eq('active', true).neq('id', eventId).order('date');
    if (otherEventsData) setActiveOtherEvents(otherEventsData);

    // Transferências de dinheiro entre contatos (tabela payment_transfers) — busca global (não só
    // dessa cerimônia), porque quem RECEBE pode estar em outra cerimônia. Mesma fonte usada na
    // tela de Pagamentos, pra "saldo" nunca divergir entre as duas telas.
    const { data: transfersData } = await supabase
      .from('payment_transfers')
      .select('*, from_contact:contacts!from_contact_id(id,name,nickname), to_contact:contacts!to_contact_id(id,name,nickname), events(id,name,date,date2,active)')
      .eq('cancelled', false);
    setTransfers((transfersData || []).filter(t => t.events?.active !== false));

    setLoading(false);
  }

  async function openImportModal() {
    // Fetch all contacts
    const { data: allContacts } = await supabase
      .from('contacts')
      .select('*')
      .order('name');
      
    // Filter out those already in the event
    const participantIds = new Set(participants.map(p => p.contact_id));
    const available = allContacts.filter(c => !participantIds.has(c.id));
    
    setAvailableContacts(available);
    setSelectedContactIds(new Set());
    setIsImportModalOpen(true);
  }

  function toggleContactSelection(id) {
    const newSelection = new Set(selectedContactIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedContactIds(newSelection);
  }

  async function handleImport() {
    if (selectedContactIds.size === 0) return;
    
    const inserts = Array.from(selectedContactIds).map(contact_id => ({
      event_id: eventId,
      contact_id: contact_id,
      status: 'Confirmado',
      date1_confirmed: true,
      date2_confirmed: true
    }));

    const { error } = await supabase
      .from('event_participants')
      .insert(inserts);

    if (error) {
      alert('Erro ao importar viajantes: ' + error.message);
    } else {
      setIsImportModalOpen(false);
      fetchEventData(); // refresh list
    }
  }

  async function removeParticipant(contactId) {
    if (!confirm('Remover esta pessoa da cerimônia?')) return;

    // A linha de event_participants será excluída, então o log de remoção
    // precisa viver em contacts.activity_log (com eventId/eventName embutidos,
    // já que não haverá mais relação para fazer o join no Diário).
    const p = participants.find(x => x.contact_id === contactId);
    const firstName = (p?.contacts?.nickname || p?.contacts?.name || '').split(' ')[0];
    const entry = newLogEntry(`removeu ${firstName} da cerimônia "${event?.name || '—'}"`, null, { eventId, eventName: event?.name || '—' });
    const { data: contactRow } = await supabase.from('contacts').select('activity_log').eq('id', contactId).single();
    await supabase.from('contacts').update({ activity_log: [...(contactRow?.activity_log || []), entry] }).eq('id', contactId);

    const { error } = await supabase
      .from('event_participants')
      .delete()
      .match({ event_id: eventId, contact_id: contactId });

    if (!error) {
      fetchEventData();
    }
  }

  async function transferParticipant(contactId, targetEventId) {
    const p = participants.find(x => x.contact_id === contactId);
    const firstName = (p?.contacts?.nickname || p?.contacts?.name || '').split(' ')[0];
    const targetName = activeOtherEvents.find(ev => ev.id === targetEventId)?.name || '—';
    const fromEnrollmentLog = [...getEnrollmentLog(contactId), newLogEntry(`transferiu ${firstName} para "${targetName}"`)];
    await supabase.from('event_participants').update({ status: 'desistiu', enrollment_log: fromEnrollmentLog }).match({ event_id: eventId, contact_id: contactId });

    const toLogEntry = newLogEntry(`recebeu ${firstName} transferido de "${event?.name || '—'}"`);
    const { data: existing } = await supabase.from('event_participants').select('id, status, enrollment_log').match({ event_id: targetEventId, contact_id: contactId }).maybeSingle();
    if (existing) {
      if (existing.status === 'desistiu') {
        await supabase.from('event_participants').update({ status: 'intenção de ir', enrollment_log: [...(existing.enrollment_log || []), toLogEntry] }).match({ event_id: targetEventId, contact_id: contactId });
      }
    } else {
      await supabase.from('event_participants').insert([{ contact_id: contactId, event_id: targetEventId, status: 'intenção de ir', enrollment_log: [toLogEntry] }]);
    }
    setTransferModal(null);
    fetchEventData();
  }

  async function toggleDayPresence(contactId, day, currentStatus) {
    const field = day === 1 ? 'date1_confirmed' : 'date2_confirmed';
    const dayLabel = day === 1 ? 'Dia I' : 'Dia II';
    const p = participants.find(x => x.contact_id === contactId);
    const firstName = (p?.contacts?.nickname || p?.contacts?.name || '').split(' ')[0];
    const action = !currentStatus ? 'confirmou' : 'removeu';
    const newEnrollmentLog = [...getEnrollmentLog(contactId), newLogEntry(`${action} ${dayLabel} para ${firstName}`)];
    const { error } = await supabase
      .from('event_participants')
      .update({ [field]: !currentStatus, enrollment_log: newEnrollmentLog })
      .match({ event_id: eventId, contact_id: contactId });
    if (!error) {
      setParticipants(prev => prev.map(p =>
        p.contact_id === contactId ? { ...p, [field]: !currentStatus, enrollment_log: newEnrollmentLog } : p
      ));
    }
  }

  async function updateParticipantStatus(contactId, newStatus) {
    const p = participants.find(x => x.contact_id === contactId);
    const firstName = (p?.contacts?.nickname || p?.contacts?.name || '').split(' ')[0];
    const msgMap = {
      'Confirmado': `confirmou vaga de ${firstName}`,
      'intenção de ir': `alterou ${firstName} para intenção de ir`,
      'desistiu': `marcou ${firstName} como desistente`,
    };
    const msg = msgMap[newStatus] || `alterou status de ${firstName} para ${newStatus}`;
    const newEnrollmentLog = [...getEnrollmentLog(contactId), newLogEntry(msg)];
    const { error } = await supabase
      .from('event_participants')
      .update({ status: newStatus, enrollment_log: newEnrollmentLog })
      .match({ event_id: eventId, contact_id: contactId });
    if (!error) {
      setParticipants(prev => prev.map(p =>
        p.contact_id === contactId ? { ...p, status: newStatus, enrollment_log: newEnrollmentLog } : p
      ));
    }
  }

  async function updateRemedioStatus(contactId, newStatus) {
    const p = participants.find(x => x.contact_id === contactId);
    const firstName = (p?.contacts?.nickname || p?.contacts?.name || '').split(' ')[0];
    const labelMap = { 'Ok Manual': 'OK (manual)', 'Acompanhar': 'Acompanhar', 'enviar': 'Pendente', 'enviado': 'Enviada' };
    const newEnrollmentLog = [...getEnrollmentLog(contactId), newLogEntry(`marcou ficha de triagem de ${firstName} como ${labelMap[newStatus] || newStatus}`, null, { type: 'ficha' })];
    const { error } = await supabase
      .from('event_participants')
      .update({ remedio_status: newStatus, enrollment_log: newEnrollmentLog })
      .match({ event_id: eventId, contact_id: contactId });

    if (!error) {
      setParticipants(prev => prev.map(p =>
        p.contact_id === contactId ? { ...p, remedio_status: newStatus, enrollment_log: newEnrollmentLog } : p
      ));
    }
  }

  async function deleteMedicalForm(contactId) {
    if (!confirm('Tem certeza que deseja excluir permanentemente a ficha médica deste viajante?')) {
      return;
    }
    
    // 1. Limpa os dados na tabela 'contacts'
    const { error: contactsError } = await supabase
      .from('contacts')
      .update({
        medical_form_step: null,
        medical_form_data: null,
        medications_list: null,
        remedio: 'não informado'
      })
      .eq('id', contactId);

    if (contactsError) {
      alert('Erro ao excluir dados de contato: ' + contactsError.message);
      return;
    }

    // 2. Reseta o status do remédio na tabela 'event_participants'
    const p = participants.find(x => x.contact_id === contactId);
    const firstName = (p?.contacts?.nickname || p?.contacts?.name || '').split(' ')[0];
    const newEnrollmentLog = [...getEnrollmentLog(contactId), newLogEntry(`excluiu permanentemente a ficha de triagem de ${firstName}`, null, { type: 'ficha' })];
    const { error: participantsError } = await supabase
      .from('event_participants')
      .update({ remedio_status: 'enviar', enrollment_log: newEnrollmentLog })
      .match({ event_id: eventId, contact_id: contactId });

    if (participantsError) {
      alert('Erro ao atualizar status do participante: ' + participantsError.message);
      return;
    }

    // 3. Atualiza o estado no React
    setParticipants(prev => prev.map(p => {
      if (p.contact_id === contactId) {
        return {
          ...p,
          remedio_status: 'enviar',
          enrollment_log: newEnrollmentLog,
          contacts: {
            ...p.contacts,
            medical_form_step: null,
            medical_form_data: null,
            medications_list: null,
            remedio: 'não informado'
          }
        };
      }
      return p;
    }));
  }

  async function toggleCheck(contactId, field, currentValue) {
    const p = participants.find(x => x.contact_id === contactId);
    const firstName = (p?.contacts?.nickname || p?.contacts?.name || '').split(' ')[0];
    const fieldLabels = { preparacao_enviada: 'Etapa Inicial da Cerimônia', endereco_enviado: 'Endereço' };
    const label = fieldLabels[field] || field;
    const action = !currentValue ? 'marcou envio de' : 'desmarcou envio de';
    const newEnrollmentLog = [...getEnrollmentLog(contactId), newLogEntry(`${action} "${label}" para ${firstName}`)];
    const { error } = await supabase
      .from('event_participants')
      .update({ [field]: !currentValue, enrollment_log: newEnrollmentLog })
      .match({ event_id: eventId, contact_id: contactId });
    if (!error) {
      setParticipants(prev => prev.map(p =>
        p.contact_id === contactId ? { ...p, [field]: !currentValue, enrollment_log: newEnrollmentLog } : p
      ));
    }
  }

  function newLogEntry(msg, prevState = null, extra = null) {
    const entry = { at: new Date().toISOString(), by: adminNameRef.current, msg };
    if (prevState) entry.prev = prevState;
    if (extra) Object.assign(entry, extra);
    return entry;
  }

  function getParticipantLog(contactId) {
    return participants.find(p => p.contact_id === contactId)?.payment_log || [];
  }

  // Uma pessoa pode estar em mais de um "balde" ao mesmo tempo: parte paga (pago), parte
  // prometida a pagar no local (a pagar no local), parte ainda sem destino (em aberto), parte
  // transferida para outra pessoa (transferido). "parcelado" é a única intenção marcada
  // manualmente — o resto é tudo derivado do saldo, igual à tela de Pagamentos (mesma fonte de
  // payment_transfers), pra o saldo nunca divergir entre as duas telas.
  function getEffectiveStatus(p) {
    // Quando a pessoa está pareada entre 2 cerimônias (1 dia em cada), os pagamentos dela podem
    // estar registrados na linha da OUTRA cerimônia — essa tela só vê a linha desta cerimônia, então
    // não tem como calcular o saldo combinado certo aqui. Quem sabe a conta completa é a tela de
    // Pagamentos (que já mescla as duas linhas), então avisa em vez de mostrar um número errado.
    const crossCeremonyPaired = crossCeremonyExpected[p.contact_id] !== undefined;
    const baseExpected = crossCeremonyPaired
      ? crossCeremonyExpected[p.contact_id]
      : (p.date1_confirmed && p.date2_confirmed && event?.price_2d) ? event.price_2d : (event?.price_1d ?? null);
    const outTransfers = transfers.filter(t => t.from_contact_id === p.contact_id && t.event_id === eventId);
    const inTransfers = transfers.filter(t => t.to_contact_id === p.contact_id);
    const sumOut = outTransfers.reduce((s, t) => s + Number(t.amount), 0);
    const sumIn = inTransfers.reduce((s, t) => s + Number(t.amount), 0);
    const expectedAmount = baseExpected != null ? baseExpected - sumOut + sumIn : (sumIn > 0 ? sumIn : baseExpected);

    const records = (p.payment_records || []).filter(r => !r.cancelled);
    const pledgeRecords = records.filter(r => r.pledge);
    const realRecords = records.filter(r => !r.pledge);
    const paidSoFar = realRecords.reduce((s, r) => s + (r.amount || 0), 0);
    const total = expectedAmount != null ? expectedAmount - (p.discount || 0) : null;

    let pledgedLocal = pledgeRecords.reduce((s, r) => s + (r.amount || 0), 0);
    if (pledgeRecords.length === 0 && p.payment_status === 'a pagar no local' && total != null) {
      pledgedLocal = Math.max(0, total - paidSoFar);
    }

    const nonPledgedRemainder = total != null ? Math.max(0, total - pledgedLocal) : null;
    const owedAberto = nonPledgedRemainder != null ? Math.max(0, nonPledgedRemainder - paidSoFar) : null;
    const isPagoPortion = owedAberto != null && owedAberto <= 0 && (paidSoFar > 0 || total <= 0);

    const buckets = [];
    if (owedAberto != null && owedAberto > 0) buckets.push(p.payment_status === 'parcelado' ? 'parcelado' : 'em aberto');
    if (pledgedLocal > 0) buckets.push('a pagar no local');
    if (isPagoPortion) {
      if (outTransfers.length === 0 || outTransfers.every(t => t.status === 'pago')) buckets.push('pago');
      else if (outTransfers.some(t => t.status === 'a pagar no local')) buckets.push('a pagar no local');
      else buckets.push('transferido');
    }
    if (buckets.length === 0) buckets.push('em aberto');
    const statusBuckets = [...new Set(buckets)];

    const effectiveStatus = statusBuckets.includes('em aberto') ? 'em aberto'
      : statusBuckets.includes('parcelado') ? 'parcelado'
      : statusBuckets.includes('a pagar no local') ? 'a pagar no local'
      : statusBuckets.includes('transferido') ? 'transferido'
      : 'pago';

    const owed = (owedAberto || 0) + pledgedLocal;
    return { baseExpected, expectedAmount, paidSoFar, pledgedLocal, owedAberto, owed, outTransfers, inTransfers, statusBuckets, effectiveStatus, discount: p.discount, crossCeremonyPaired };
  }

  function getEnrollmentLog(contactId) {
    return participants.find(p => p.contact_id === contactId)?.enrollment_log || [];
  }

  async function revertPayment(contactId) {
    const log = getParticipantLog(contactId);
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
    setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, ...updateData } : p));
  }

  // "parcelado" é a única intenção que ainda precisa ser marcada manualmente — "pago", "a pagar
  // no local" e "em aberto" são todos derivados do saldo/registros (ver getEffectiveStatus).
  async function setParcelado(contactId, count) {
    const currentP = participants.find(p => p.contact_id === contactId);
    const prevState = currentP ? { status: currentP.payment_status || 'em aberto', method: currentP.payment_method || null, records: currentP.payment_records || [], installment_count: currentP.installment_count || null, discount: currentP.discount ?? null } : null;
    const updateData = { payment_status: 'parcelado', installment_count: count ? parseInt(count) : null, payment_log: [...getParticipantLog(contactId), newLogEntry(`definiu parcelamento em ${count || '?'}x`, prevState)] };
    const { error } = await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    if (!error) setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, ...updateData } : p));
  }

  async function clearParcelado(contactId) {
    const currentP = participants.find(p => p.contact_id === contactId);
    if (currentP?.payment_status !== 'parcelado') return;
    const prevState = { status: currentP.payment_status || 'em aberto', method: currentP.payment_method || null, records: currentP.payment_records || [], installment_count: currentP.installment_count || null, discount: currentP.discount ?? null };
    const updateData = { payment_status: 'em aberto', installment_count: null, payment_log: [...getParticipantLog(contactId), newLogEntry('removeu parcelamento', prevState)] };
    const { error } = await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    if (!error) setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, ...updateData } : p));
  }

  async function applyDiscountAction(contactId, amount) {
    const currentP = participants.find(p => p.contact_id === contactId);
    const prevState = currentP ? { status: currentP.payment_status || 'em aberto', method: currentP.payment_method || null, records: currentP.payment_records || [], installment_count: currentP.installment_count || null, discount: currentP.discount ?? null } : null;
    const val = parseFloat(amount);
    const updateData = { discount: val, payment_log: [...getParticipantLog(contactId), newLogEntry(`definiu desconto de $${val.toFixed(2)}`, prevState)] };
    const { error } = await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    if (!error) setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, ...updateData } : p));
  }

  async function removeDiscountAction(contactId) {
    const currentP = participants.find(p => p.contact_id === contactId);
    if (currentP?.discount == null) return;
    if (!confirm('Remover desconto?')) return;
    const prevState = { status: currentP.payment_status || 'em aberto', method: currentP.payment_method || null, records: currentP.payment_records || [], installment_count: currentP.installment_count || null, discount: currentP.discount ?? null };
    const updateData = { discount: null, payment_log: [...getParticipantLog(contactId), newLogEntry('removeu desconto', prevState)] };
    const { error } = await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    if (!error) setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, ...updateData } : p));
  }

  async function addLocalPledge(contactId, amount) {
    const participant = participants.find(p => p.contact_id === contactId);
    const existing = participant?.payment_records || [];
    const newRecords = [...existing, { amount: parseFloat(amount), date: null, method: null, pledge: 'local', cancelled: false }];
    const newLog = [...getParticipantLog(contactId), newLogEntry(`registrou $${Number(amount).toFixed(2)} a pagar no local`)];
    const { error } = await supabase.from('event_participants').update({ payment_records: newRecords, payment_log: newLog }).match({ event_id: eventId, contact_id: contactId });
    if (!error) setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, payment_records: newRecords, payment_log: newLog } : p));
  }

  async function confirmLocalPledge(contactId, index) {
    const participant = participants.find(p => p.contact_id === contactId);
    const existing = participant?.payment_records || [];
    const rec = existing[index];
    if (!rec) return;
    const today = new Date().toISOString().split('T')[0];
    const newRecords = existing.map((r, i) => i === index ? { ...r, pledge: false, date: today, method: 'Espécie' } : r);
    const newLog = [...getParticipantLog(contactId), newLogEntry(`confirmou recebimento de $${Number(rec.amount).toFixed(2)} no local`)];
    const { error } = await supabase.from('event_participants').update({ payment_records: newRecords, payment_log: newLog }).match({ event_id: eventId, contact_id: contactId });
    if (!error) setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, payment_records: newRecords, payment_log: newLog } : p));
  }

  async function addInstallmentPayment(contactId, amount, date, method) {
    const participant = participants.find(p => p.contact_id === contactId);
    const existing = participant?.payment_records || [];
    const newRecords = [...existing, { amount: parseFloat(amount), date: date || null, method: method || null, cancelled: false }];
    const dateStr = date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    const newLog = [...getParticipantLog(contactId), newLogEntry(`registrou pagamento de $${Number(amount).toFixed(2)}${method ? ` via ${method}` : ''}${dateStr ? ` em ${dateStr}` : ''}`)];
    const { error } = await supabase
      .from('event_participants')
      .update({ payment_records: newRecords, payment_log: newLog })
      .match({ event_id: eventId, contact_id: contactId });
    if (!error) {
      setParticipants(prev => prev.map(p =>
        p.contact_id === contactId ? { ...p, payment_records: newRecords, payment_log: newLog } : p
      ));
    }
  }

  async function cancelInstallmentPayment(contactId, index) {
    const participant = participants.find(p => p.contact_id === contactId);
    const existing = participant?.payment_records || [];
    const rec = existing[index];
    const newRecords = existing.map((r, i) => i === index ? { ...r, cancelled: true } : r);
    const cancelMsg = rec?.pledge
      ? `cancelou $${Number(rec?.amount).toFixed(2)} a pagar no local`
      : `cancelou pagamento${rec?.amount != null ? ` de $${Number(rec.amount).toFixed(2)}` : ''}${rec?.date ? ` em ${new Date(rec.date + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}`;
    const updateData = { payment_records: newRecords, payment_log: [...getParticipantLog(contactId), newLogEntry(cancelMsg)] };
    const { error } = await supabase
      .from('event_participants')
      .update(updateData)
      .match({ event_id: eventId, contact_id: contactId });
    if (!error) {
      setParticipants(prev => prev.map(p =>
        p.contact_id === contactId ? { ...p, ...updateData } : p
      ));
    }
  }

  async function confirmPayment(contactId) {
    const today = new Date().toISOString().split('T')[0];
    const p = participants.find(x => x.contact_id === contactId);
    const amount = (p?.date1_confirmed && p?.date2_confirmed && event?.price_2d) ? event.price_2d : (event?.price_1d ?? null);
    const updateData = {
      payment_status: 'pago',
      payment_method: 'Câmbio',
      payment_records: [{ amount, date: today, cancelled: false }],
      installment_count: null,
      payment_log: [...getParticipantLog(contactId), newLogEntry('confirmou comprovante — pago via Câmbio')],
    };
    const { error } = await supabase
      .from('event_participants')
      .update(updateData)
      .match({ event_id: eventId, contact_id: contactId });
    if (!error) {
      setParticipants(prev => prev.map(pp =>
        pp.contact_id === contactId ? { ...pp, ...updateData } : pp
      ));
    }
  }

  async function confirmPartialPayment(contactId, amount) {
    const p = participants.find(x => x.contact_id === contactId);
    const existing = p?.payment_records || [];
    const today = new Date().toISOString().split('T')[0];
    const newRecords = [...existing, { amount: parseFloat(amount), date: today, method: 'Câmbio', cancelled: false }];
    const newLog = [...getParticipantLog(contactId), newLogEntry(`registrou pagamento parcial de $${Number(amount).toFixed(2)} via Câmbio`)];
    const updateData = {
      payment_status: 'em aberto',
      payment_method: null,
      payment_records: newRecords,
      payment_log: newLog,
    };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    setParticipants(prev => prev.map(pp => pp.contact_id === contactId ? { ...pp, ...updateData } : pp));
    setConfirmPartialModal(null);
  }

  async function cancelConferirPayment(contactId) {
    const participant = participants.find(p => p.contact_id === contactId);
    const existingUrl = participant?.comprovante_url;
    const logMsg = existingUrl
      ? `cancelou comprovante — revertido para Em Aberto · ${existingUrl}`
      : 'cancelou comprovante — revertido para Em Aberto';
    const newLog = [...getParticipantLog(contactId), newLogEntry(logMsg)];
    const updateData = { payment_status: 'em aberto', payment_method: null, comprovante_url: null, payment_log: newLog };
    await supabase.from('event_participants').update(updateData).match({ event_id: eventId, contact_id: contactId });
    setParticipants(prev => prev.map(pp => pp.contact_id === contactId ? { ...pp, ...updateData } : pp));
  }

  function parsePhone(full) {
    if (!full) return { ddi: '+55', localPhone: '' };
    const codes = ['+351', '+54', '+57', '+52', '+55', '+1', '+44', '+49', '+33', '+34', '+39'];
    for (const c of codes) {
      if (full.startsWith(c)) return { ddi: c, localPhone: full.slice(c.length).replace(/[^\d]/g, '') };
    }
    return { ddi: '+55', localPhone: full.replace(/[^\d]/g, '') };
  }

  function openContactEdit(contact) {
    const { ddi, localPhone } = parsePhone(contact.phone || '');
    setContactEditModal({
      contactId: contact.id,
      addingToEvent: false,
      nickname: contact.nickname || contact.name || '',
      nome_completo: contact.nome_completo || '',
      ddi,
      phone: localPhone,
      primeira_vez: contact.primeira_vez || false,
    });
  }

  async function saveContact() {
    if (savingContactRef.current) return;
    savingContactRef.current = true;
    setSavingContact(true);
    try {
      await saveContactImpl();
    } finally {
      savingContactRef.current = false;
      setSavingContact(false);
    }
  }

  async function saveContactImpl() {
    const { contactId, addingToEvent, nickname, nome_completo, phone, ddi } = contactEditModal;
    const fullPhone = phone ? `${ddi || '+55'}${phone}` : '';

    if (contactId && !addingToEvent) {
      // Editing an existing participant's contact fields
      const fields = { name: nickname, nickname, nome_completo, phone: fullPhone, primeira_vez: contactEditModal.primeira_vez ?? false };
      const { error } = await supabase.from('contacts').update(fields).eq('id', contactId);
      if (!error) {
        setParticipants(prev => prev.map(p =>
          p.contact_id === contactId ? { ...p, contacts: { ...p.contacts, ...fields } } : p
        ));
        setContactEditModal(null);
      } else {
        alert('Erro ao salvar: ' + error.message);
      }
    } else if (contactId && addingToEvent) {
      // Adding an existing contact to this event
      const alreadyIn = participants.find(p => p.contact_id === contactId);
      if (alreadyIn) {
        if (alreadyIn.status === 'desistiu') {
          if (!confirm(`${nickname} está marcado como desistente nesta cerimônia. Reativar como intenção de ir?`)) return;
          await updateParticipantStatus(contactId, 'intenção de ir');
          setContactEditModal(null);
        } else {
          alert(`${nickname} já está nesta cerimônia.`);
        }
        return;
      }
      const { contactId: cid, nickname: nick } = contactEditModal;
      const enrollEntry = [newLogEntry(`adicionou ${nick} à cerimônia via admin`)];
      const { error } = await supabase
        .from('event_participants')
        .insert([{ event_id: eventId, contact_id: contactId, status: 'intenção de ir', date1_confirmed: true, date2_confirmed: !!event.date2, enrollment_log: enrollEntry }]);
      if (error) { alert('Erro ao adicionar: ' + error.message); return; }
      setContactEditModal(null);
      fetchEventData();
    } else {
      // Creating a brand-new contact and adding to event
      if (fullPhone) {
        // Busca fresca, não usa allContacts (carregado uma vez no load da página) — senão um
        // clique duplo rápido não pega o contato que o 1º clique acabou de criar.
        const cleanNew = fullPhone.replace(/\D/g, '');
        const { data: freshContacts } = await supabase.from('contacts').select('id, name, nickname, phone');
        const dup = (freshContacts || []).find(c => c.phone?.replace(/\D/g, '') === cleanNew);
        if (dup) {
          alert(`Este número já está cadastrado para "${dup.nickname || dup.name}".`);
          return;
        }
      }
      const { data: newContact, error: cErr } = await supabase
        .from('contacts')
        .insert([{ name: nickname, nickname, nome_completo, phone: fullPhone, primeira_vez: true }])
        .select()
        .single();
      if (cErr) { alert('Erro ao criar contato: ' + cErr.message); return; }
      const enrollEntry2 = [newLogEntry(`criou e adicionou ${nickname} à cerimônia via admin`)];
      const { error: pErr } = await supabase
        .from('event_participants')
        .insert([{ event_id: eventId, contact_id: newContact.id, status: 'intenção de ir', date1_confirmed: true, date2_confirmed: !!event.date2, enrollment_log: enrollEntry2 }]);
      if (pErr) { alert('Erro ao adicionar à cerimônia: ' + pErr.message); return; }
      setContactEditModal(null);
      fetchEventData();
    }
  }

  async function updateVagaStatus(contactId, newStatus) {
    const { error } = await supabase
      .from('event_participants')
      .update({ vaga: newStatus })
      .match({ event_id: eventId, contact_id: contactId });
      
    if (!error) {
      setParticipants(prev => prev.map(p => 
        p.contact_id === contactId ? { ...p, vaga: newStatus } : p
      ));
    }
  }

  async function promoverDaFila(contactId) {
    if (!confirm('Mover esta pessoa para a lista oficial de inscrições?')) return;
    const { error } = await supabase
      .from('event_participants')
      .update({ waitlist_at: null })
      .match({ event_id: eventId, contact_id: contactId });
    if (error) { alert('Erro: ' + error.message); return; }
    setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, waitlist_at: null } : p));
  }

  async function moverParaAtivos(contactId) {
    const { error } = await supabase
      .from('event_participants')
      .update({ interested_at: null })
      .match({ event_id: eventId, contact_id: contactId });
    if (error) { alert('Erro: ' + error.message); return; }
    setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, interested_at: null } : p));
  }

  // Se a pessoa já tem o log original de "manifestou interesse" (de quando se inscreveu pelo
  // link, antes de interested_at existir), usa essa data real em vez de "agora" — senão alguém
  // que se inscreveu há semanas e só está sendo movido de volta agora pareceria um lead novo.
  async function moverParaInteressados(contactId) {
    const p = participants.find(x => x.contact_id === contactId);
    const es = getEffectiveStatus(p);
    const blockMsg = {
      'pago': 'Status atual: pago. Primeiro reverta o pagamento (volte para Em Aberto) antes de mover para Interessados.',
      'transferido': 'Status atual: transferido. Primeiro resolva a transferência de saída pendente antes de mover para Interessados.',
      'a pagar no local': 'Status atual: a pagar no local. Primeiro cancele essa promessa de pagamento antes de mover para Interessados.',
      'parcelado': 'Status atual: parcelado. Primeiro desmarque o parcelamento antes de mover para Interessados.',
      'conferir pagamento': 'Status atual: conferir pagamento. Primeiro confirme ou cancele o comprovante antes de mover para Interessados.',
    }[es.effectiveStatus];
    if (blockMsg || es.paidSoFar > 0) {
      let msg = blockMsg || 'Primeiro desfaça a opção de pagamento deste participante.';
      if (es.paidSoFar > 0) msg += ' Já há pagamentos realizados. Combine sobre a devolução.';
      alert(msg);
      return;
    }
    const log = getEnrollmentLog(contactId);
    const originalEntry = log.find(e => e.msg?.includes('manifestou interesse'));
    const ts = originalEntry?.at || new Date().toISOString();
    const { error } = await supabase
      .from('event_participants')
      .update({ interested_at: ts })
      .match({ event_id: eventId, contact_id: contactId });
    if (error) { alert('Erro: ' + error.message); return; }
    setParticipants(prev => prev.map(p => p.contact_id === contactId ? { ...p, interested_at: ts } : p));
  }

  function openEditCeremony() {
    const defaultFichaMessage = 'Oi, [nome]!\n\nSegue o Formulário de Triagem, clicando no link abaixo:\n\n[link]\n\nPor favor preenche o mais rápido possível pra dar tempo de a gente planejar sua experiência.';
    setEditFormData({
      name: event.name || '',
      date: event.date || '',
      date2: event.date2 || '',
      image_url: event.image_url || '',
      invite_message: event.invite_message || '',
      address: event.address || '',
      preparation_text: event.preparation_text || '',
      payment_text: event.payment_text || '',
      ficha_message: event.ficha_message || defaultFichaMessage,
      price_1d: event.price_1d != null ? String(event.price_1d) : '',
      price_2d: event.price_2d != null ? String(event.price_2d) : '',
      preparation_id: event.preparation_id || '',
    });
    setEditingCeremony(true);
  }

  async function handleUpdateCeremony(e) {
    e.preventDefault();
    const dataToUpdate = {
      ...editFormData,
      date: editFormData.date || null,
      date2: editFormData.date2 || null,
      price_1d: editFormData.price_1d !== '' ? parseFloat(editFormData.price_1d) : null,
      price_2d: editFormData.price_2d !== '' ? parseFloat(editFormData.price_2d) : null,
      preparation_id: editFormData.preparation_id || null,
    };
    const { error } = await supabase.from('events').update(dataToUpdate).eq('id', eventId);
    if (error) { alert('Erro ao editar cerimônia: ' + error.message); return; }
    setEvent(prev => ({ ...prev, ...dataToUpdate }));
    setEditingCeremony(false);
  }

  async function handleChangeCeremonyStatus(newStatus) {
    const labels = { lista_espera: 'Lista de Espera', fechada: 'Fechada para Novas Inscrições' };
    const label = newStatus ? labels[newStatus] : 'Aberta';
    if (!confirm(`Mudar o status desta cerimônia para "${label}"?`)) return;
    const { error } = await supabase.from('events').update({ ceremony_status: newStatus || null }).eq('id', eventId);
    if (error) { alert('Erro: ' + error.message); return; }
    setEvent(prev => ({ ...prev, ceremony_status: newStatus || null }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function fmtLog(entry) {
    const d = new Date(entry.at);
    const dt = d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
    return `${dt} — ${entry.by} ${entry.msg}`;
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Carregando cerimônia...</div>;
  if (!event) return <div style={{ textAlign: 'center', padding: '5rem' }}>Cerimônia não encontrada.</div>;

  const hasTwoDates = !!event.date2;

  const remedioOptions = [
    { value: 'enviar', label: 'Enviar', icon: '✉️', color: '#bbb' },
    { value: 'enviado', label: 'Enviado', icon: '📲', color: '#5dade2' },
    { value: 'preenchido', label: 'Preenchido', icon: '📝', color: '#f39c12' },
    { value: 'Ok', label: 'Ok', icon: '✅', color: '#27ae60' },
    { value: 'Ok Manual', label: 'Ok Manual', icon: '🛡️', color: '#8e44ad' }
  ];

  const filaEspera = participants.filter(p => p.waitlist_at && p.status !== 'desistiu');
  const interessados = participants.filter(p => p.interested_at && !p.waitlist_at && p.status !== 'desistiu');
  const confirmados = participants.filter(p => p.status === 'Confirmado' && !p.waitlist_at && !p.interested_at);
  const intencao = participants.filter(p => p.status === 'intenção de ir' && !p.waitlist_at && !p.interested_at);
  const iniciais = participants.filter(p => p.status === 'desistiu');

  const activeParticipants = [...confirmados, ...intencao];
  const day1Active = activeParticipants.filter(p => p.date1_confirmed);
  const day1ConfirmadosCount = day1Active.filter(p => computeVagaBadge(p, getEffectiveStatus(p).effectiveStatus) === 'Confirmado').length;
  const day1ReservadosCount = day1Active.filter(p => computeVagaBadge(p, getEffectiveStatus(p).effectiveStatus) === 'Reservado').length;
  const day1PrimeiraVez = day1Active.filter(p => p.contacts?.primeira_vez).length;
  const day1TotalCount = activeParticipants.filter(p => p.date1_confirmed).length;
  const day1Stats = { confirmados: day1ConfirmadosCount, reservados: day1ReservadosCount, total: day1TotalCount, primeiraVez: day1PrimeiraVez };
  const day2Active = activeParticipants.filter(p => p.date2_confirmed);
  const day2ConfirmadosCount = day2Active.filter(p => computeVagaBadge(p, getEffectiveStatus(p).effectiveStatus) === 'Confirmado').length;
  const day2ReservadosCount = day2Active.filter(p => computeVagaBadge(p, getEffectiveStatus(p).effectiveStatus) === 'Reservado').length;
  const day2PrimeiraVez = day2Active.filter(p => p.contacts?.primeira_vez).length;
  const day2TotalCount = activeParticipants.filter(p => p.date2_confirmed).length;
  const day2Stats = { confirmados: day2ConfirmadosCount, reservados: day2ReservadosCount, total: day2TotalCount, primeiraVez: day2PrimeiraVez };

  const renderParticipantRow = (p, isSimplified = false) => {
    const hasRemedioAccess = p.status === 'intenção de ir' || p.status === 'Confirmado';
    const isSemNada = p.status === 'avisado' || p.status === 'desistiu' || p.status === 'avisar';
    const cellOpacity = isSemNada ? 0.3 : 1;
    const rowOpacity = p.status === 'desistiu' ? 0.4 : 1;

    const effectiveRemedioStatus = computeEffectiveRemedioStatus(p);
    const badgeText = computeVagaBadge(p, getEffectiveStatus(p).effectiveStatus);

    return (
      <div key={p.contact_id} style={{ ...s.row, opacity: rowOpacity }}>
        {/* Nome + nome completo */}
        <div onClick={() => p.contacts && openContactEdit(p.contacts)} style={{ cursor: 'pointer' }}>
          <div style={{ ...s.travelerName }}>
            {p.contacts?.primeira_vez && (
              <span title="Primeiro encontro" style={{ color: '#5d9470', fontFamily: "'IM Fell English', serif", fontSize: '13px', marginRight: '4px', userSelect: 'none', opacity: 0.8 }}>✦</span>
            )}
            {p.contacts?.nickname || p.contacts?.name}
          </div>
          <div style={s.travelerPhone}>{p.contacts?.nome_completo || p.contacts?.phone || '—'}</div>
        </div>

        {/* Dias */}
        <div style={s.daysCell}>
          {!isSimplified ? (
            <>
              <button
                onClick={() => toggleDayPresence(p.contact_id, 1, p.date1_confirmed)}
                style={{
                  ...s.dayTag,
                  fontWeight: p.date1_confirmed ? 'bold' : 'normal',
                  color: p.date1_confirmed ? '#3a3530' : '#c8c2b8',
                  border: p.date1_confirmed ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8',
                  cursor: 'pointer',
                  background: 'transparent'
                }}
                title="Alternar Dia I"
              >
                {p.date1_confirmed ? 'D1' : <s>D1</s>}
              </button>
              {hasTwoDates && (
                <button
                  onClick={() => toggleDayPresence(p.contact_id, 2, p.date2_confirmed)}
                  style={{
                    ...s.dayTag,
                    fontWeight: p.date2_confirmed ? 'bold' : 'normal',
                    color: p.date2_confirmed ? '#3a3530' : '#c8c2b8',
                    border: p.date2_confirmed ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8',
                    cursor: 'pointer',
                    background: 'transparent',
                    marginLeft: '5px'
                  }}
                  title="Alternar Dia II"
                >
                  {p.date2_confirmed ? 'D2' : <s>D2</s>}
                </button>
              )}
            </>
          ) : (
            <span style={{ color: '#c0b8b0' }}>—</span>
          )}
        </div>

        {/* Ícones de status */}
        <div style={s.statusIcons}>
          {/* Alternar Confirmado/Intenção */}
          <span 
            title={p.status === 'Confirmado' ? "Confirmado (Clique para mudar para Intenção)" : "Definir como Confirmado"}
            onClick={() => {
              const nextStatus = p.status === 'Confirmado' ? 'intenção de ir' : 'Confirmado';
              updateParticipantStatus(p.contact_id, nextStatus);
            }}
            style={{
              cursor: 'pointer',
              color: p.status === 'Confirmado' ? '#3d6b52' : '#c8c2b8',
              fontSize: '15px',
              fontWeight: p.status === 'Confirmado' ? 'bold' : 'normal',
              userSelect: 'none',
              transition: 'color 0.2s',
            }}
          >
            {p.status === 'Confirmado' ? '✓' : '○'}
          </span>

          {/* Desistir */}
          <span
            title={p.status === 'desistiu' ? "Desistente (Clique para reativar)" : "Marcar como Desistente"}
            onClick={() => {
              const nextStatus = p.status === 'desistiu' ? 'Confirmado' : 'desistiu';
              if (nextStatus === 'desistiu' && !confirm(`Marcar ${p.contacts?.name?.split(' ')[0]} como desistente?`)) return;
              updateParticipantStatus(p.contact_id, nextStatus);
            }}
            style={{
              cursor: 'pointer',
              color: p.status === 'desistiu' ? '#c0392b' : '#c8c2b8',
              fontSize: '11px',
              userSelect: 'none',
              transition: 'color 0.2s',
              marginLeft: '4px',
            }}
          >
            ✕
          </span>

          {/* Mover para Interessados */}
          {!isSimplified && (
            <span
              title="Mover para Interessados"
              onClick={() => moverParaInteressados(p.contact_id)}
              style={{
                cursor: 'pointer',
                color: '#c8c2b8',
                fontSize: '12px',
                userSelect: 'none',
                transition: 'color 0.2s',
                marginLeft: '4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#3a3530'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#c8c2b8'; }}
            >
              ↑
            </span>
          )}
        </div>

        {/* Remédio */}
        {!isSimplified && hasRemedioAccess ? (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => setRemedioModal({ contactId: p.contact_id, contact: p.contacts })}
          >
            <PillIcon status={(effectiveRemedioStatus === 'Ok' || effectiveRemedioStatus === 'Ok Manual') ? 'ok' : effectiveRemedioStatus === 'Acompanhar' ? 'warn' : effectiveRemedioStatus === 'preenchido' ? 'attention' : 'pending'} />
          </div>
        ) : (
          <span style={{ color: '#c0b8b0', display: 'flex', justifyContent: 'center', width: '100%' }}>—</span>
        )}

        {/* Pago */}
        {!isSimplified ? (() => {
          const { owedAberto, effectiveStatus: ps } = getEffectiveStatus(p);
          const intent = p.payment_status === 'pago' ? 'em aberto' : (p.payment_status || 'em aberto');
          const col = ps === 'pago' ? '#5d9470' : ps === 'transferido' ? '#b8960a' : ps === 'a pagar no local' ? '#8a7a58' : ps === 'parcelado' ? '#7a68a4' : ps === 'conferir pagamento' ? '#c4892a' : '#9a9288';
          const label = ps === 'pago' ? 'pago' : ps === 'transferido' ? 'transferido' : ps === 'a pagar no local' ? 'no local' : ps === 'parcelado' ? 'parcelado' : ps === 'conferir pagamento' ? 'conferir' : 'em aberto';
          return (
            <div
              style={{ ...s.paidCell, cursor: 'pointer', opacity: cellOpacity, color: col }}
              onClick={() => {
                setModalAction(null);
                setShowCalcMemo(false);
                setPaymentModal({ contactId: p.contact_id, status: intent, method: 'Câmbio', installmentCount: p.installment_count || '', discountAmount: p.discount != null ? String(p.discount) : '50.00', localAmount: '', paymentAmount: owedAberto != null ? String(owedAberto) : '', paymentDate: '' });
              }}
            >
              <CoinIcon status={ps} />
              <span style={{ lineHeight: 1 }}>{label}</span>
            </div>
          );
        })() : (
          <span style={{ color: '#c0b8b0' }}>—</span>
        )}

        {/* Vaga */}
        {!isSimplified ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', opacity: cellOpacity }}>
            {badgeText === 'Confirmado' || badgeText === 'Reservado' ? (
              <span style={s.vagaReservado}>{badgeText.toLowerCase()}</span>
            ) : (
              <span style={s.vagaLivre}>pendente</span>
            )}
          </div>
        ) : (
          <span style={{ color: '#c0b8b0' }}>—</span>
        )}

        {/* Preparação */}
        {!isSimplified ? (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: cellOpacity, cursor: 'pointer', color: p.preparacao_enviada ? '#5d9470' : '#c8c2b8' }}
            onClick={() => {
              if (!p.preparacao_enviada) {
                const firstName = (p.contacts?.nickname || p.contacts?.name || '').split(' ')[0];
                const text = event.preparation_text || '';
                const ph = p.contacts?.phone?.replace(/\D/g, '');
                if (ph && text) {
                  const pageUrl = event.preparation_id ? `${window.location.origin}/preparacao/${eventId}` : '';
                  const msg = resolveVars(text, { firstName, p, event, pageUrl });
                  window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(msg)}`, '_blank');
                }
              }
              toggleCheck(p.contact_id, 'preparacao_enviada', p.preparacao_enviada);
            }}
            title={p.preparacao_enviada ? 'Etapa Inicial da Cerimônia enviada (clique para desmarcar)' : 'Enviar Etapa Inicial da Cerimônia por WhatsApp'}
          >
            <DocumentIcon active={p.preparacao_enviada} />
          </div>
        ) : <span style={{ color: '#c0b8b0' }}>—</span>}

        {/* Endereço */}
        {!isSimplified ? (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: cellOpacity, cursor: 'pointer', color: p.endereco_enviado ? '#5d9470' : '#c8c2b8' }}
            onClick={() => {
              if (!p.endereco_enviado) {
                const firstName = (p.contacts?.nickname || p.contacts?.name || '').split(' ')[0];
                const text = event.address || '';
                const ph = p.contacts?.phone?.replace(/\D/g, '');
                if (ph && text) window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(resolveVars(text, { firstName, p, event, pageUrl: null }))}`, '_blank');
              }
              toggleCheck(p.contact_id, 'endereco_enviado', p.endereco_enviado);
            }}
            title={p.endereco_enviado ? 'Endereço enviado (clique para desmarcar)' : 'Enviar endereço por WhatsApp'}
          >
            <PinIcon active={p.endereco_enviado} />
          </div>
        ) : <span style={{ color: '#c0b8b0' }}>—</span>}

        {/* Ações: Transferir + WhatsApp + Remover */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {p.status !== 'desistiu' && activeOtherEvents.length > 0 && (
            <span
              title="Transferir para outra cerimônia"
              onClick={() => setTransferModal({ contactId: p.contact_id, contactName: p.contacts?.nickname || p.contacts?.name || '—' })}
              style={{ cursor: 'pointer', color: '#8a8278', opacity: 0.45, transition: 'opacity 0.15s', userSelect: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
            >
              <TransferIcon />
            </span>
          )}
          <span
            title="Abrir chat no WhatsApp"
            onClick={() => { const ph = p.contacts?.phone?.replace(/\D/g, ''); if (ph) window.open(`https://wa.me/${ph}`, '_blank'); }}
            style={{ cursor: 'pointer', color: '#8a8278', opacity: 0.45, transition: 'opacity 0.15s', userSelect: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
          >
            <WaIcon />
          </span>
          {isSimplified && (
            <button
              style={s.removeBtn}
              onClick={() => removeParticipant(p.contact_id)}
              title="Remover viajante"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderParticipantCard = (p, isSimplified) => {
    const hasRemedioAccess = p.status === 'intenção de ir' || p.status === 'Confirmado';
    const rowOpacity = p.status === 'desistiu' ? 0.4 : 1;
    const effectiveRemedioStatus = computeEffectiveRemedioStatus(p);
    const badgeText = computeVagaBadge(p, getEffectiveStatus(p).effectiveStatus);
    const dayBtn = (day, confirmed) => (
      <button key={day} onClick={() => toggleDayPresence(p.contact_id, day, confirmed)} style={{ ...s.dayTag, fontWeight: confirmed ? 'bold' : 'normal', color: confirmed ? '#3a3530' : '#c8c2b8', border: confirmed ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', cursor: 'pointer', background: 'transparent' }}>
        {confirmed ? `D${day}` : <s>D{day}</s>}
      </button>
    );
    return (
      <div key={p.contact_id} style={{ borderBottom: '0.5px dashed #ddd9cf', padding: '0.75rem 0', opacity: rowOpacity }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div onClick={() => p.contacts && openContactEdit(p.contacts)} style={{ cursor: 'pointer' }}>
            <div style={{ ...s.travelerName, }}>{p.contacts?.nickname || p.contacts?.name}</div>
            <div style={s.travelerPhone}>{p.contacts?.nome_completo || p.contacts?.phone || '—'}</div>
          </div>
          <div style={{ flexShrink: 0, marginLeft: '0.5rem' }}>
            {badgeText === 'Confirmado' || badgeText === 'Reservado'
              ? <span style={s.vagaReservado}>{badgeText.toLowerCase()}</span>
              : <span style={s.vagaLivre}>pendente</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {!isSimplified ? <>{dayBtn(1, p.date1_confirmed)}{hasTwoDates && dayBtn(2, p.date2_confirmed)}</> : <span style={{ color: '#c0b8b0', fontSize: '10px' }}>—</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span title={p.status === 'Confirmado' ? 'Confirmado' : 'Definir como Confirmado'} onClick={() => updateParticipantStatus(p.contact_id, p.status === 'Confirmado' ? 'intenção de ir' : 'Confirmado')} style={{ cursor: 'pointer', color: p.status === 'Confirmado' ? '#3d6b52' : '#c8c2b8', fontSize: '15px', fontWeight: p.status === 'Confirmado' ? 'bold' : 'normal', userSelect: 'none' }}>{p.status === 'Confirmado' ? '✓' : '○'}</span>
            <span onClick={() => { const ns = p.status === 'desistiu' ? 'Confirmado' : 'desistiu'; if (ns === 'desistiu' && !confirm(`Marcar ${p.contacts?.name?.split(' ')[0]} como desistente?`)) return; updateParticipantStatus(p.contact_id, ns); }} style={{ cursor: 'pointer', color: p.status === 'desistiu' ? '#c0392b' : '#c8c2b8', fontSize: '11px', userSelect: 'none' }}>✕</span>
            {!isSimplified && (
              <span title="Mover para Interessados" onClick={() => moverParaInteressados(p.contact_id)} style={{ cursor: 'pointer', color: '#c8c2b8', fontSize: '12px', userSelect: 'none' }}>↑</span>
            )}
            {!isSimplified && hasRemedioAccess && (
              <span onClick={() => setRemedioModal({ contactId: p.contact_id, contact: p.contacts })} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <PillIcon status={(effectiveRemedioStatus === 'Ok' || effectiveRemedioStatus === 'Ok Manual') ? 'ok' : effectiveRemedioStatus === 'Acompanhar' ? 'warn' : effectiveRemedioStatus === 'preenchido' ? 'attention' : 'pending'} />
              </span>
            )}
            {(() => {
              const { owedAberto, effectiveStatus: ps } = getEffectiveStatus(p);
              const intent = p.payment_status === 'pago' ? 'em aberto' : (p.payment_status || 'em aberto');
              return (
                <span
                  onClick={() => {
                    setModalAction(null);
                    setShowCalcMemo(false);
                    setPaymentModal({ contactId: p.contact_id, status: intent, method: 'Câmbio', installmentCount: p.installment_count || '', discountAmount: p.discount != null ? String(p.discount) : '50.00', localAmount: '', paymentAmount: owedAberto != null ? String(owedAberto) : '', paymentDate: '' });
                  }}
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  title="Pagamento"
                >
                  <CoinIcon status={ps} />
                </span>
              );
            })()}
            <span
              onClick={() => {
                if (!p.preparacao_enviada) {
                  const firstName = (p.contacts?.nickname || p.contacts?.name || '').split(' ')[0];
                  const text = event.preparation_text || '';
                  const ph = p.contacts?.phone?.replace(/\D/g, '');
                  if (ph && text) {
                    const pageUrl = event.preparation_id ? `${window.location.origin}/preparacao/${eventId}` : '';
                    const msg = resolveVars(text, { firstName, p, event, pageUrl });
                    window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(msg)}`, '_blank');
                  }
                }
                toggleCheck(p.contact_id, 'preparacao_enviada', p.preparacao_enviada);
              }}
              style={{ cursor: 'pointer', color: p.preparacao_enviada ? '#5d9470' : '#c0b8b0', display: 'inline-flex', alignItems: 'center' }}
              title={p.preparacao_enviada ? 'Etapa Inicial da Cerimônia enviada' : 'Enviar Etapa Inicial da Cerimônia'}
            >
              <DocumentIcon active={p.preparacao_enviada} />
            </span>
            <span
              onClick={() => {
                if (!p.endereco_enviado) {
                  const firstName = (p.contacts?.nickname || p.contacts?.name || '').split(' ')[0];
                  const text = event.address || '';
                  const ph = p.contacts?.phone?.replace(/\D/g, '');
                  if (ph && text) window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(resolveVars(text, { firstName, p, event, pageUrl: null }))}`, '_blank');
                }
                toggleCheck(p.contact_id, 'endereco_enviado', p.endereco_enviado);
              }}
              style={{ cursor: 'pointer', color: p.endereco_enviado ? '#5d9470' : '#c0b8b0', display: 'inline-flex', alignItems: 'center' }}
              title={p.endereco_enviado ? 'Endereço enviado' : 'Enviar endereço'}
            >
              <PinIcon active={p.endereco_enviado} />
            </span>
            <span onClick={() => { const ph = p.contacts?.phone?.replace(/\D/g, ''); if (ph) window.open(`https://wa.me/${ph}`, '_blank'); }} style={{ cursor: 'pointer', color: '#8a8278', opacity: 0.5, display: 'inline-flex', alignItems: 'center' }}><WaIcon /></span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={{ ...s.nav, padding: isMobile ? '0.6rem 1rem' : '0.75rem 2.5rem' }}>
        <a href="/" style={s.navBrand}>Journey<span style={{ color: '#5d9470' }}>.</span></a>
        <div style={{ ...s.navLinks, gap: isMobile ? '1rem' : '1.8rem' }}>
          <a href="/" style={s.navLink}>{isMobile ? <PersonIcon /> : <><PersonIcon /> Pessoas</>}</a>
          <a href="/events" style={{ ...s.navLink, ...s.navLinkActive }}>{isMobile ? <PlantIcon /> : <><PlantIcon /> Cerimônias</>}</a>
          <a href="/pagamentos" style={s.navLink}>{isMobile ? <CoinNavIcon /> : <><CoinNavIcon /> Pagamentos</>}</a>
          <a href="/diario" style={s.navLink}>{isMobile ? <DiarioNavIcon /> : <><DiarioNavIcon /> Diário</>}</a>
          <a href="/settings" style={{ ...s.navLink, color: '#6a6258' }} title="Configurações">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </a>
          <a href="/settings/users" style={{ ...s.navLink, color: '#6a6258' }} title="Gestão de usuários">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </a>
          <button onClick={handleLogout} style={{ ...s.navLink, background: 'none', border: '0.5px dashed #5a5248', padding: '4px 10px', cursor: 'pointer' }}>sair</button>
        </div>
      </nav>

      <div style={{ ...s.content, padding: isMobile ? '1.2rem 1rem 3rem' : '2rem 2.5rem 4rem' }}>
        {/* Botão de voltar + ações da cerimônia */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '0.7rem' }}>
          <button onClick={() => router.push('/events')} style={{ ...s.back, marginBottom: 0 }}>
            ← voltar às cerimônias
          </button>
          {!isMobile && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                title="Editar cerimônia"
                onClick={openEditCeremony}
                style={{ cursor: 'pointer', fontSize: '13px', color: '#8a7a58' }}
              >
                ✎
              </span>
              <span
                title={event.ceremony_status === 'lista_espera' ? 'Remover Lista de Espera' : 'Colocar em Lista de Espera'}
                onClick={() => handleChangeCeremonyStatus(event.ceremony_status === 'lista_espera' ? null : 'lista_espera')}
                style={{ cursor: 'pointer', fontSize: '13px', color: event.ceremony_status === 'lista_espera' ? '#c8a830' : '#aaa49c' }}
              >
                ⏳
              </span>
              <span
                title={event.ceremony_status === 'fechada' ? 'Reabrir para Inscrições' : 'Fechar para Novas Inscrições'}
                onClick={() => handleChangeCeremonyStatus(event.ceremony_status === 'fechada' ? null : 'fechada')}
                style={{ cursor: 'pointer', fontSize: '13px', color: event.ceremony_status === 'fechada' ? '#8B0000' : '#aaa49c' }}
              >
                ⊘
              </span>
            </div>
          )}
        </div>

        {/* Cabeçalho principal */}
        <div style={s.header}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={s.title}>{event.name}</h1>
            {isMobile ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {[{ label: 'D1', stats: day1Stats }, ...(event.date2 ? [{ label: 'D2', stats: day2Stats }] : [])].map(({ label, stats }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '5px', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}>
                      <span style={{ color: '#7a6e66', letterSpacing: '0.08em', fontSize: '9px' }}>{label}</span>
                      <span style={{ color: '#d0c8c0' }}>—</span>
                      <span style={{ color: stats.confirmados > 0 ? '#3d6b52' : '#5a5048', fontWeight: 'bold' }}>{stats.confirmados}</span>
                      <span style={{ color: '#b8b0a8' }}>confirmado</span>
                      <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                      <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.reservados}</span>
                      <span style={{ color: '#b8b0a8' }}>reservado</span>
                      <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                      <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.total}</span>
                      <span style={{ color: '#b8b0a8' }}>total</span>
                      {stats.primeiraVez > 0 && (<>
                        <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                        <span style={{ color: '#5d9470', fontFamily: "'IM Fell English', serif", fontSize: '11px' }}>✦</span>
                        <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.primeiraVez}</span>
                      </>)}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0, marginLeft: '0.75rem' }}>
                  {[
                    { title: 'Adicionar participante', onClick: () => setContactEditModal({ contactId: null, addingToEvent: true, nickname: '', nome_completo: '', ddi: '+55', phone: '' }), icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
                    { title: 'Copiar link da ficha médica', onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/ficha`); alert('Link da ficha copiado!'); }, icon: <PillIcon size={13} strokeColor="currentColor" /> },
                    { title: 'Copiar link de interesse', onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/interesse/${event.id}`); alert('Link de interesse copiado!'); }, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
                    { title: 'Pagamentos', onClick: () => setPaymentSummaryOpen(true), icon: <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>$</span> },
                  ].map((btn, i) => (
                    <button key={i} onClick={btn.onClick} title={btn.title} style={{ width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '0.5px dashed #b8b0a4', borderRadius: '2px', cursor: 'pointer', color: '#7a7268', padding: 0, flexShrink: 0 }}>
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '0.8rem' }}>
                {[{ label: 'D1', stats: day1Stats }, ...(event.date2 ? [{ label: 'D2', stats: day2Stats }] : [])].map(({ label, stats }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '5px', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}>
                    <span style={{ color: '#7a6e66', letterSpacing: '0.08em', fontSize: '9px' }}>{label}</span>
                    <span style={{ color: '#d0c8c0' }}>—</span>
                    <span style={{ color: stats.confirmados > 0 ? '#3d6b52' : '#5a5048', fontWeight: 'bold' }}>{stats.confirmados}</span>
                    <span style={{ color: '#b8b0a8' }}>confirmado</span>
                    <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                    <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.reservados}</span>
                    <span style={{ color: '#b8b0a8' }}>reservado</span>
                    <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                    <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.total}</span>
                    <span style={{ color: '#b8b0a8' }}>total</span>
                    {stats.primeiraVez > 0 && (<>
                      <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                      <span style={{ color: '#5d9470', fontFamily: "'IM Fell English', serif", fontSize: '11px' }}>✦</span>
                      <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.primeiraVez}</span>
                    </>)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', flexShrink: 0 }}>
              {[
                { title: 'Adicionar participante', onClick: () => setContactEditModal({ contactId: null, addingToEvent: true, nickname: '', nome_completo: '', ddi: '+55', phone: '' }), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
                { title: 'Copiar link da ficha médica', onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/ficha`); alert('Link da ficha copiado!'); }, icon: <PillIcon size={14} strokeColor="currentColor" /> },
                { title: 'Copiar link de interesse', onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/interesse/${event.id}`); alert('Link de interesse copiado!'); }, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
              ].map((btn, i) => (
                <button key={i} onClick={btn.onClick} title={btn.title} style={{ width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '0.5px dashed #b8b0a4', borderRadius: '2px', cursor: 'pointer', color: '#7a7268', padding: 0, flexShrink: 0 }}>
                  {btn.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de dia */}
        {hasTwoDates && participants.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginTop: isMobile ? '1.4rem' : '0rem', marginBottom: '1.8rem', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginRight: '4px' }}>filtrar:</span>
            {[{ val: 'both', label: 'D1+D2' }, { val: 'day1', label: 'D1' }, { val: 'day2', label: 'D2' }, { val: 'none', label: 'nenhum' }].map(f => (
              <button key={f.val} onClick={() => setDayFilter(dayFilter === f.val ? null : f.val)} style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '2px', cursor: 'pointer', border: dayFilter === f.val ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', background: dayFilter === f.val ? '#3a3530' : 'transparent', color: dayFilter === f.val ? '#f7f4ee' : '#9a9288', transition: 'all 0.15s' }}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Tabela / Lista de Participantes */}
        {participants.length === 0 ? (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <p style={s.emptyNote}>Esta cerimônia ainda não possui participantes.</p>
            <button style={{ ...s.btn, margin: '1rem auto' }} onClick={() => setContactEditModal({ contactId: null, addingToEvent: true, nickname: '', nome_completo: '', ddi: '+55', phone: '' })}>
              Adicionar Participantes
            </button>
          </div>
        ) : (
          <div>
            {/* GRUPO 0: INTERESSADOS */}
            {interessados.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={s.sectionHeader}>
                  <div style={s.sectionTitle}>◌ Interessados ({interessados.length})</div>
                </div>
                <div>
                  <div style={s.tableHeader}>
                    <div>participante</div><div>dias</div><div>vaga</div>
                    <div style={{ textAlign: 'center' }}>remédio</div>
                    <div style={{ gridColumn: '5 / 9', textAlign: 'center' }}>dia do interesse</div>
                    <div style={{ textAlign: 'center' }}>ações</div>
                  </div>
                  {[...interessados]
                    .sort((a, b) => new Date(a.interested_at) - new Date(b.interested_at))
                    .map(p => {
                      const effectiveRemedioStatus = computeEffectiveRemedioStatus(p);
                      const dataHora = new Date(p.interested_at).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        timeZone: 'America/Sao_Paulo',
                      });
                      return (
                        <div key={p.contact_id} style={s.row}>
                          {/* Nome */}
                          <div onClick={() => p.contacts && openContactEdit(p.contacts)} style={{ cursor: 'pointer' }}>
                            <div style={s.travelerName}>
                              {p.contacts?.primeira_vez && (
                                <span title="Primeiro encontro" style={{ color: '#5d9470', fontFamily: "'IM Fell English', serif", fontSize: '13px', marginRight: '4px', userSelect: 'none', opacity: 0.8 }}>✦</span>
                              )}
                              {p.contacts?.nickname || p.contacts?.name}
                            </div>
                            <div style={s.travelerPhone}>{p.contacts?.nome_completo || p.contacts?.phone || '—'}</div>
                          </div>

                          {/* Dias */}
                          <div style={s.daysCell}>
                            <button
                              onClick={() => toggleDayPresence(p.contact_id, 1, p.date1_confirmed)}
                              style={{ ...s.dayTag, fontWeight: p.date1_confirmed ? 'bold' : 'normal', color: p.date1_confirmed ? '#3a3530' : '#c8c2b8', border: p.date1_confirmed ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', cursor: 'pointer', background: 'transparent' }}
                              title="Alternar Dia I"
                            >
                              {p.date1_confirmed ? 'D1' : <s>D1</s>}
                            </button>
                            {hasTwoDates && (
                              <button
                                onClick={() => toggleDayPresence(p.contact_id, 2, p.date2_confirmed)}
                                style={{ ...s.dayTag, fontWeight: p.date2_confirmed ? 'bold' : 'normal', color: p.date2_confirmed ? '#3a3530' : '#c8c2b8', border: p.date2_confirmed ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', cursor: 'pointer', background: 'transparent', marginLeft: '5px' }}
                                title="Alternar Dia II"
                              >
                                {p.date2_confirmed ? 'D2' : <s>D2</s>}
                              </button>
                            )}
                          </div>

                          {/* Mover para ativos + Desistente */}
                          <div style={s.statusIcons}>
                            <span
                              title="Mover para ativos"
                              onClick={() => moverParaAtivos(p.contact_id)}
                              style={{ cursor: 'pointer', color: '#c8c2b8', fontSize: '15px', userSelect: 'none', transition: 'color 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#3a3530'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = '#c8c2b8'; }}
                            >
                              ↓
                            </span>
                            <span
                              title="Marcar como Desistente"
                              onClick={() => {
                                if (!confirm(`Marcar ${p.contacts?.name?.split(' ')[0]} como desistente?`)) return;
                                updateParticipantStatus(p.contact_id, 'desistiu');
                              }}
                              style={{ cursor: 'pointer', color: '#c8c2b8', fontSize: '11px', userSelect: 'none', transition: 'color 0.2s', marginLeft: '4px' }}
                            >
                              ✕
                            </span>
                          </div>

                          {/* Remédio */}
                          <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            onClick={() => setRemedioModal({ contactId: p.contact_id, contact: p.contacts })}
                          >
                            <PillIcon status={(effectiveRemedioStatus === 'Ok' || effectiveRemedioStatus === 'Ok Manual') ? 'ok' : effectiveRemedioStatus === 'Acompanhar' ? 'warn' : effectiveRemedioStatus === 'preenchido' ? 'attention' : 'pending'} />
                          </div>

                          {/* Não há pago/status/inicial/end ainda — mostra a data/hora do interesse nesse espaço */}
                          <div style={{ gridColumn: '5 / 9', textAlign: 'center', color: '#b0a898', fontSize: '11px', fontFamily: "'Courier Prime', monospace" }}>
                            manifestou interesse em {dataHora}
                          </div>

                          {/* Ações: Transferir + WhatsApp */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', gridColumn: '9' }}>
                            {activeOtherEvents.length > 0 && (
                              <span
                                title="Transferir para outra cerimônia"
                                onClick={() => setTransferModal({ contactId: p.contact_id, contactName: p.contacts?.nickname || p.contacts?.name || '—' })}
                                style={{ cursor: 'pointer', color: '#8a8278', opacity: 0.45, transition: 'opacity 0.15s', userSelect: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
                              >
                                <TransferIcon />
                              </span>
                            )}
                            <span
                              title="Abrir chat no WhatsApp"
                              onClick={() => { const ph = p.contacts?.phone?.replace(/\D/g, ''); if (ph) window.open(`https://wa.me/${ph}`, '_blank'); }}
                              style={{ cursor: 'pointer', color: '#8a8278', opacity: 0.45, transition: 'opacity 0.15s', userSelect: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px' }}
                              onMouseEnter={e => e.currentTarget.style.opacity = 1}
                              onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
                            >
                              <WaIcon />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* GRUPO 1: VIAJANTES ATIVOS */}
            {(() => {
              const allActive = [...confirmados, ...intencao];
              const applyDayFilter = p => dayFilter === 'day1' ? p.date1_confirmed : dayFilter === 'day2' ? p.date2_confirmed : dayFilter === 'both' ? (p.date1_confirmed && p.date2_confirmed) : dayFilter === 'none' ? (!p.date1_confirmed && !p.date2_confirmed) : true;
              const filteredActive = allActive.filter(applyDayFilter).sort((a, b) => (a.contacts?.name || '').localeCompare(b.contacts?.name || ''));
              return (
            <div>
              <div style={s.sectionHeader}>
                <div style={s.sectionTitle}>
                  ★ Participantes Ativos ({filteredActive.length})
                </div>
              </div>

              {allActive.length === 0 ? (
                <div style={s.emptyNote}>Nenhum participante ativo no momento.</div>
              ) : (() => {
                const filtered = filteredActive;
                if (filtered.length === 0) return <div style={s.emptyNote}>Nenhum participante para este dia.</div>;
                return isMobile ? (
                  <div style={{ marginBottom: '2rem' }}>{filtered.map(p => renderParticipantCard(p, false))}</div>
                ) : (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={s.tableHeader}>
                      <div>participante</div><div>dias</div><div>vaga</div>
                      <div style={{ textAlign: 'center' }}>remédio</div>
                      <div style={{ textAlign: 'center' }}>pago</div><div style={{ textAlign: 'center' }}>status</div>
                      <div style={{ textAlign: 'center' }}>inicial</div>
                      <div style={{ textAlign: 'center' }}>end</div>
                      <div style={{ textAlign: 'center' }}>ações</div>
                    </div>
                    {filtered.map(p => renderParticipantRow(p, false))}
                  </div>
                );
              })()}
            </div>
              );
            })()}

            {/* GRUPO 2: DESISTENTES */}
            <div style={{ marginTop: '2rem' }}>
              <div style={s.sectionHeader}>
                <div style={s.sectionTitle}>
                  ✕ Desistentes ({iniciais.length})
                </div>
              </div>

              {iniciais.length === 0 ? (
                <div style={s.emptyNote}>Nenhum desistente nesta cerimônia.</div>
              ) : (() => {
                const filtered = [...iniciais]
                  .filter(p => dayFilter === 'day1' ? p.date1_confirmed : dayFilter === 'day2' ? p.date2_confirmed : dayFilter === 'both' ? (p.date1_confirmed && p.date2_confirmed) : dayFilter === 'none' ? (!p.date1_confirmed && !p.date2_confirmed) : true)
                  .sort((a, b) => (a.contacts?.name || '').localeCompare(b.contacts?.name || ''));
                if (filtered.length === 0) return <div style={s.emptyNote}>Nenhum contato para este dia.</div>;
                return isMobile ? (
                  <div style={{ marginBottom: '2rem' }}>{filtered.map(p => renderParticipantCard(p, true))}</div>
                ) : (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={s.tableHeader}>
                      <div>participante</div><div>dias</div><div>vaga</div>
                      <div style={{ textAlign: 'center' }}>remédio</div>
                      <div style={{ textAlign: 'center' }}>pago</div><div style={{ textAlign: 'center' }}>status</div>
                      <div style={{ textAlign: 'center' }}>inicial</div>
                      <div style={{ textAlign: 'center' }}>end</div>
                      <div style={{ textAlign: 'center' }}>ações</div>
                    </div>
                    {filtered.map(p => renderParticipantRow(p, true))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

            {/* GRUPO 3: FILA DE ESPERA */}
            {filaEspera.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <div style={s.sectionHeader}>
                  <div style={s.sectionTitle}>⏳ Fila de Espera ({filaEspera.length})</div>
                </div>
                <div style={{ marginBottom: '2.5rem' }}>
                  {[...filaEspera]
                    .sort((a, b) => new Date(a.waitlist_at) - new Date(b.waitlist_at))
                    .map((p, i) => {
                      const dataHora = new Date(p.waitlist_at).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        timeZone: 'America/Sao_Paulo',
                      });
                      const dias = p.date1_confirmed && p.date2_confirmed ? 'D1 e D2'
                        : p.date1_confirmed ? 'D1' : p.date2_confirmed ? 'D2' : '—';
                      return (
                        <div key={p.contact_id} style={{
                          padding: '0.6rem 0', borderBottom: '0.5px dashed #d0cbc2',
                          display: 'flex', alignItems: 'center', gap: '0.8rem',
                          fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#5a5248',
                        }}>
                          <span style={{ color: '#b0a898', minWidth: '1.5rem', textAlign: 'right' }}>{i + 1}.</span>
                          <span style={{ flex: 1 }}>{p.contacts?.name || 'Desconhecido'}</span>
                          <span style={{ color: '#9a9288', fontSize: '11px', minWidth: '44px', textAlign: 'center' }}>{dias}</span>
                          <span style={{ color: '#b0a898', fontSize: '11px' }}>{dataHora}</span>
                          <button
                            title="Mover para lista oficial"
                            onClick={() => promoverDaFila(p.contact_id)}
                            style={{ background: 'none', border: '0.5px solid #c2b59b', borderRadius: '2px', cursor: 'pointer', padding: '2px 7px', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#7a7268', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f0ece4'; e.currentTarget.style.color = '#3a3530'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#7a7268'; }}
                          >
                            + lista
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

        {/* Assinatura decorativa no rodapé */}
        <div style={s.cornerDeco}>journey • moleskine page</div>
      </div>

      {/* Modal de Importação */}
      {isImportModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(58, 53, 48, 0.4)', backdropFilter: 'blur(2px)' }}>
          <div className="modal-content" style={{ 
            maxWidth: '500px', 
            maxHeight: '80vh', 
            display: 'flex', 
            flexDirection: 'column',
            fontFamily: "'Courier Prime', monospace",
            fontSize: '11px',
            color: '#3a3530',
            background: '#fdfbf7',
            border: '0.5px solid #b8b0a4',
            borderRadius: '2px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ 
              fontFamily: "'IM Fell English', serif", 
              fontSize: '24px', 
              fontWeight: 400, 
              margin: '0 0 1.5rem',
              color: '#3a3530'
            }}>Importar da Base de Viajantes</h2>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '1rem' }}>
              {availableContacts.length === 0 ? (
                <p style={s.emptyNote}>Todos os viajantes da base já estão nesta cerimônia!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {availableContacts.map(contact => (
                    <label 
                      key={contact.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        padding: '0.6rem 0.8rem', 
                        background: selectedContactIds.has(contact.id) ? '#faf7f0' : 'transparent',
                        border: selectedContactIds.has(contact.id) ? '0.5px solid #b8b0a4' : '0.5px dashed #d0cbc2',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedContactIds.has(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                        style={{ width: '14px', height: '14px', accentColor: '#7a7268' }}
                      />
                      <div>
                        <div style={{ 
                          fontFamily: "'Caveat', cursive", 
                          fontSize: '18px', 
                          color: '#3a3530',
                          fontWeight: 500
                        }}>{contact.name}</div>
                        <div style={{ fontSize: '9px', color: '#9a9288', marginTop: '2px' }}>Status Geral: {contact.status}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <button 
                style={{ 
                  ...s.btn, 
                  flex: 1, 
                  justifyContent: 'center',
                  border: '0.5px solid #7a7268',
                  color: '#3a3530' 
                }} 
                onClick={handleImport}
                disabled={selectedContactIds.size === 0}
              >
                Importar Selecionados ({selectedContactIds.size})
              </button>
              <button 
                style={{ ...s.btn, flex: 1, justifyContent: 'center' }}
                onClick={() => setIsImportModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer modal */}
      {transferModal && (
        <div onClick={() => setTransferModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '320px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace" }}>
            <div style={{ padding: '1.2rem 1.5rem 0.9rem', borderBottom: '0.5px solid #d0cbc2' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Transferir participante</div>
              <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#3a3530', lineHeight: 1.1 }}>{transferModal.contactName}</div>
              <div style={{ fontSize: '10px', color: '#aaa49c', marginTop: '3px' }}>Selecione a cerimônia de destino</div>
            </div>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {activeOtherEvents.map(ev => (
                <button key={ev.id}
                  onClick={() => { if (confirm(`Transferir ${transferModal.contactName} para "${ev.name}"?`)) transferParticipant(transferModal.contactId, ev.id); }}
                  style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: '0.5px dashed #d0cbc2', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '11px', letterSpacing: '0.04em', color: '#3a3530', textAlign: 'left' }}>
                  {ev.name}{ev.date ? ` · ${new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : ''}
                </button>
              ))}
            </div>
            <div style={{ padding: '0 1.5rem 1.2rem' }}>
              <button onClick={() => setTransferModal(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>cancelar</button>
            </div>
          </div>
        </div>
      )}

      {editingCeremony && editFormData && (
        <CeremonyFormModal
          data={editFormData}
          setData={setEditFormData}
          onSubmit={handleUpdateCeremony}
          onClose={() => setEditingCeremony(false)}
          title="Editar Cerimônia"
          submitLabel="Salvar Alterações"
          copySource={null}
        />
      )}

      {remedioModal && (() => {
        const rp = participants.find(x => x.contact_id === remedioModal.contactId);
        if (!rp) return null;
        const rContact = rp.contacts;
        const rStatus = computeEffectiveRemedioStatus(rp);
        const rIsOk = rStatus === 'Ok' || rStatus === 'Ok Manual';
        const rIsAcomp = rStatus === 'Acompanhar';
        const hasFicha = !!(rContact?.medical_form_data || rContact?.medical_form_step > 0);
        const btnBase = { width: '100%', padding: '10px 12px', background: 'transparent', border: '0.5px dashed #d0cbc2', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '11px', letterSpacing: '0.04em', color: '#3a3530', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' };
        const pillStatus = rIsOk ? 'ok' : rIsAcomp ? 'warn' : rStatus === 'preenchido' ? 'attention' : 'pending';
        const headerColor = rIsOk ? '#5d9470' : rIsAcomp ? '#e0a820' : '#c0392b';
        const statusLabel = rStatus === 'Ok' ? 'Ficha preenchida' : rStatus === 'Ok Manual' ? 'Definido como Ok' : rStatus === 'Acompanhar' ? 'Definido para acompanhar' : rStatus === 'preenchido' ? 'Ficha preenchida' : rStatus === 'enviado' ? 'Link enviado — aguardando preenchimento' : 'Pendente de preenchimento';
        return (
          <div
            onClick={() => setRemedioModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '320px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace" }}>

              {/* Header */}
              <div style={{ padding: '1.2rem 1.5rem 0.9rem', borderBottom: '0.5px solid #d0cbc2' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Ficha Médica</div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#3a3530', lineHeight: 1.1 }}>
                  {rContact?.nickname || rContact?.name}
                </div>
                <div style={{ fontSize: '10px', color: headerColor, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PillIcon status={pillStatus} />
                  {statusLabel}
                </div>
              </div>

              {/* Resumo ficha */}
              {hasFicha && (() => {
                const alerts = computeFichaAlerts(rContact);
                if (!alerts) return null;
                const { redFlags, hasMeds, medsList, outros, unchecked } = alerts;
                const hasAnything = redFlags.length > 0 || hasMeds || unchecked.length > 0;
                if (!hasAnything) return null;
                return (
                  <div style={{ padding: '0.75rem 1.5rem', borderBottom: '0.5px solid #d0cbc2', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {redFlags.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', fontSize: '10px', color: '#b93030', lineHeight: 1.4 }}>
                        <span style={{ flexShrink: 0 }}>⚠</span><span>{f}</span>
                      </div>
                    ))}
                    {hasMeds && (
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', fontSize: '10px', color: '#7a5018', lineHeight: 1.4 }}>
                        <span style={{ flexShrink: 0 }}>💊</span>
                        <div>
                          <span style={{ fontWeight: 700 }}>Usa medicamentos</span>
                          {medsList.map((m, i) => <div key={i} style={{ color: '#6b4a18' }}>• {m}</div>)}
                          {outros && <div style={{ color: '#6b4a18' }}>• {outros}</div>}
                          {!medsList.length && !outros && <div style={{ color: '#9a7040' }}>(lista não preenchida)</div>}
                        </div>
                      </div>
                    )}
                    {unchecked.length > 0 && (
                      <div style={{ fontSize: '10px', color: '#9a9288', lineHeight: 1.4 }}>
                        {unchecked.length <= 2 ? (<>
                          <div style={{ fontWeight: 700, color: '#7a7268', marginBottom: '2px' }}>✗ Não marcado</div>
                          {unchecked.map((u, i) => <div key={i}>• {u}</div>)}
                        </>) : (
                          <button
                            onClick={() => { setActiveFichaContact(rContact); setRemedioModal(null); }}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#7a7268', textAlign: 'left', textDecoration: 'underline', lineHeight: 1.4 }}
                          >
                            ✗ {unchecked.length} itens não marcados — ver ficha de triagem
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Ações */}
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {!rIsOk && (
                  <button
                    onClick={() => { updateRemedioStatus(remedioModal.contactId, 'Ok Manual'); setRemedioModal(null); }}
                    style={{ ...btnBase, color: '#5d9470', border: '0.5px solid #9dcfb4' }}
                  >
                    ✓ Definir como Ok
                  </button>
                )}
                {!rIsAcomp && (
                  <button
                    onClick={() => { updateRemedioStatus(remedioModal.contactId, 'Acompanhar'); setRemedioModal(null); }}
                    style={{ ...btnBase, color: '#e0a820', border: '0.5px solid #f0c84a' }}
                  >
                    ◑ Definir como Acompanhar
                  </button>
                )}
                {(rStatus === 'Ok Manual' || rIsAcomp) && (
                  <button
                    onClick={() => { updateRemedioStatus(remedioModal.contactId, 'enviar'); setRemedioModal(null); }}
                    style={{ ...btnBase, color: '#9a9288' }}
                  >
                    ↩ Voltar para Pendente
                  </button>
                )}
                <button
                  onClick={() => {
                    const cleanPhone = rContact?.phone?.replace(/\D/g, '') || '';
                    if (!cleanPhone) { alert('Sem telefone cadastrado.'); return; }
                    const publicLink = `${window.location.origin}/ficha?id=${remedioModal.contactId}`;
                    const firstName = (rContact?.nickname || rContact?.name || '').split(' ')[0] || '';
                    const defaultFichaMsg = 'Oi, [nome]!\n\nSegue o Formulário de Triagem, clicando no link abaixo:\n\n[link]\n\nPor favor preenche o mais rápido possível pra dar tempo de a gente planejar sua experiência.';
                    const message = (event?.ficha_message || defaultFichaMsg).replace('[nome]', firstName).replace('[link]', publicLink);
                    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
                    updateRemedioStatus(remedioModal.contactId, 'enviado');
                    setRemedioModal(null);
                  }}
                  style={{ ...btnBase, color: '#5d9470', border: '0.5px solid #9dcfb4' }}
                >
                  <WaIcon /> Enviar ficha por WhatsApp
                </button>
                {hasFicha && (
                  <button
                    onClick={() => { setActiveFichaContact(rContact); setRemedioModal(null); }}
                    style={{ ...btnBase }}
                  >
                    <EyeIcon /> Ver ficha de triagem
                  </button>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '0 1.5rem 1.2rem' }}>
                <button
                  onClick={() => setRemedioModal(null)}
                  style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  fechar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Modal de Pagamento */}
      {paymentModal && (() => {
        const p = participants.find(x => x.contact_id === paymentModal.contactId);
        if (!p) return null;
        return (
          <div
            onClick={() => setPaymentModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '340px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace", maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Header */}
              <div style={{ padding: '1.2rem 1.5rem 0.9rem', borderBottom: '0.5px solid #d0cbc2' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Registro de pagamento</div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#3a3530', lineHeight: 1.1 }}>
                  {p.contacts?.nickname || p.contacts?.name}
                </div>
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
                    { key: 'parcelado', icon: '◑', label: 'Parcelado', active: p.payment_status === 'parcelado' },
                    { key: 'local', icon: '◐', label: 'A pagar no local', active: false },
                    { key: 'payment', icon: '+', label: 'Inserir pagamento', active: false },
                    { key: 'discount', icon: '%', label: 'Inserir desconto', active: p.discount != null },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => setModalAction(prev => prev === opt.key ? null : opt.key)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 6px', background: modalAction === opt.key ? '#3a3530' : (opt.active ? '#faf7f0' : 'transparent'), border: modalAction === opt.key ? '0.5px solid #3a3530' : (opt.active ? '0.5px solid #b8b0a4' : '0.5px dashed #c8c2b8'), borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.02em', color: modalAction === opt.key ? '#f7f4ee' : '#7a7268', textAlign: 'center' }}>
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '9px', color: '#b0a898', marginTop: '0.5rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "Em aberto" e "pago" são calculados automaticamente pelo saldo.
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
                    <button onClick={() => { if (!paymentModal.installmentCount) return; setParcelado(p.contact_id, paymentModal.installmentCount); setModalAction(null); }}
                      style={{ padding: '7px 12px', background: '#7a68a4', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ok</button>
                    {p.payment_status === 'parcelado' && (
                      <button onClick={() => { clearParcelado(p.contact_id); setModalAction(null); }}
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
                      addLocalPledge(paymentModal.contactId, paymentModal.localAmount);
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
                        addInstallmentPayment(paymentModal.contactId, paymentModal.paymentAmount, paymentModal.paymentDate, paymentModal.method);
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
                    <button onClick={() => { if (!paymentModal.discountAmount) return; applyDiscountAction(p.contact_id, paymentModal.discountAmount); setModalAction(null); }}
                      style={{ padding: '7px 12px', background: '#8a7a58', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ok</button>
                    {p.discount != null && (
                      <button onClick={() => { removeDiscountAction(p.contact_id); setModalAction(null); }}
                        style={{ padding: '7px 10px', background: 'transparent', color: '#c0392b', border: '0.5px dashed #e8b0b0', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}>remover</button>
                    )}
                  </div>
                )}
              </div>

              {(() => {
                const es = getEffectiveStatus(p);
                const activeRecords = (p.payment_records || []).filter(r => !r.cancelled);
                const hasOtherLines = activeRecords.length > 0 || es.outTransfers.length > 0 || es.inTransfers.length > 0 || p.discount > 0;
                const allLines = [
                  ...activeRecords.map(rec => ({ _kind: 'record', rec })),
                  ...es.outTransfers.map(t => ({ _kind: 'transfer', t, direction: 'out' })),
                  ...es.inTransfers.map(t => ({ _kind: 'transfer', t, direction: 'in' })),
                  ...(p.discount > 0 ? [{ _kind: 'discount', amount: p.discount }] : []),
                ];
                if (es.crossCeremonyPaired) {
                  return (
                    <div style={{ padding: '1rem 1.5rem 0' }}>
                      <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Saldo</div>
                      <div style={{ padding: '8px 10px', background: '#fef8f0', border: '0.5px solid #e8b87a', borderRadius: '2px', fontSize: '10px', color: '#c4892a', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.02em', lineHeight: 1.5 }}>
                        Saldo não disponível. Essa pessoa está em 2 cerimônias, favor ir para o modal de pagamentos.
                      </div>
                    </div>
                  );
                }
                return (
                  <div style={{ padding: '1rem 1.5rem 0' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Saldo</div>
                    <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '20px', color: '#3a3530' }}>
                      $ {es.owed != null ? Number(es.owed).toFixed(2) : '—'}
                    </div>
                    {hasOtherLines && (
                      <button onClick={() => setShowCalcMemo(prev => !prev)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '0.4rem', fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#7a7268', textDecoration: 'underline', letterSpacing: '0.02em' }}>
                        {showCalcMemo ? 'ocultar memória de cálculo' : 'ver memória de cálculo'}
                      </button>
                    )}
                    {hasOtherLines && showCalcMemo && (
                      <div style={{ marginTop: '0.6rem' }}>
                        {es.baseExpected != null && <CalcBaseLine label={getEnrolledDaysLabel(p, event)} amount={es.baseExpected} />}
                        {allLines.map((l, i) => {
                          const isLast = i === allLines.length - 1;
                          if (l._kind === 'record') return <CalcRecordLine key={`r${i}`} rec={l.rec} isLast={isLast} />;
                          if (l._kind === 'transfer') return <CalcTransferLine key={`t${i}`} t={l.t} direction={l.direction} isLast={isLast} />;
                          return <CalcDiscountLine key={`d${i}`} amount={l.amount} isLast={isLast} />;
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Footer */}
              <div style={{ padding: '1rem 1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
                {!['pago', 'transferido'].includes(getEffectiveStatus(p).effectiveStatus) && (
                  <button
                    onClick={() => {
                      const firstName = (p.contacts?.nickname || p.contacts?.name || '').split(' ')[0];
                      const ph = p.contacts?.phone?.replace(/\D/g, '');
                      if (!ph) { alert('Sem telefone cadastrado.'); return; }
                      const paymentLink = `${window.location.origin}/pagamento/${paymentModal.contactId}`;
                      const fmtDays = contactAllDays.map(d =>
                        new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
                      );
                      const daysStr = fmtDays.length === 0 ? '(data a confirmar)' :
                        fmtDays.length === 1 ? `o dia ${fmtDays[0]}` :
                        `os dias ${fmtDays.slice(0, -1).join(', ')} e ${fmtDays[fmtDays.length - 1]}`;
                      const defaultTemplate = `[Link]\n\nOi [Nome]! Tudo bem?\n\nSua vaga está reservada para [dias_da_cerimônia].\n\nPara confirmar a vaga, vamos precisar das informações sobre pagamento, ok?\n\n*Opção 1 - Câmbio*\n\nClica aqui pra enviar uma mensagem para a Boa Viagem Câmbio pelo WhatsApp:\nhttps://wa.me/5581988664444\n\nDiga o valor em Dólar que quer enviar para Cerimônia Brasil e eles te dirão quanto custa em Real.\nManda um pix pra eles e depois nos encaminhe o comprovante através do link no final dessa mensagem!\n\n\n*Opção 2 — Pagamento em dólar no dia*\n\nVocê também pode levar o valor em cash, em dólar, no dia da cerimônia.\nSe preferir essa opção, me avise para eu deixar registrado e te lembrar no dia, através do link abaixo:\n\n[Link]`;
                      const template = event.payment_text || defaultTemplate;
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
                <button
                  onClick={() => setPaymentModal(null)}
                  style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  fechar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Tela de Resumo de Pagamentos */}
      {paymentSummaryOpen && (() => {
        // "Pago" é derivado do saldo (pagamentos + desconto + transferências cobrindo o esperado),
        // não escolhido manualmente — mesma lógica e mesma fonte de payment_transfers da tela de
        // Pagamentos, pra "saldo" nunca divergir entre as duas telas.
        const active = participants.filter(p => p.status !== 'desistiu' && !p.interested_at).map(p => {
          if (p.payment_status === 'conferir pagamento') return { ...p, _statusBuckets: ['conferir pagamento'], _owedAberto: null, _pledgedLocal: 0, _paidSoFar: 0, _expectedAmount: getEffectiveStatus(p).expectedAmount };
          const { expectedAmount, paidSoFar, owedAberto, pledgedLocal, statusBuckets } = getEffectiveStatus(p);
          return { ...p, _expectedAmount: expectedAmount, _paidSoFar: paidSoFar, _owedAberto: owedAberto, _pledgedLocal: pledgedLocal, _statusBuckets: statusBuckets };
        });
        const groups = [
          { key: 'em aberto', label: 'Em aberto', icon: '◎', color: '#b0a898' },
          { key: 'conferir pagamento', label: 'Conferir Pagamento', icon: '?', color: '#c4892a' },
          { key: 'a pagar no local', label: 'A pagar no local', icon: '◐', color: '#8a7a58' },
          { key: 'parcelado', label: 'Parcelado', icon: '◑', color: '#7a68a4' },
          { key: 'transferido', label: 'Transferido', icon: '⇄', color: '#b8960a' },
          { key: 'pago', label: 'Pago', icon: '◉', color: '#5d9470' },
        ];
        const totalPago = active.filter(p => p._statusBuckets.includes('pago')).length;
        const totalTransferido = active.filter(p => p._statusBuckets.includes('transferido')).length;
        const totalNoLocal = active.filter(p => p._statusBuckets.includes('a pagar no local')).length;
        const totalParcelado = active.filter(p => p._statusBuckets.includes('parcelado')).length;
        const totalConferir = active.filter(p => p._statusBuckets.includes('conferir pagamento')).length;
        const totalAberto = active.filter(p => p._statusBuckets.includes('em aberto')).length;
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: '#f7f4ee', overflowY: 'auto', fontFamily: "'Courier Prime', monospace" }}>
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, background: '#3a3530', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
              <div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '18px', color: '#f7f4ee', fontWeight: 400 }}>Pagamentos</div>
                <div style={{ fontSize: '10px', color: '#b0a898', letterSpacing: '0.08em', marginTop: '1px' }}>{event.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ fontSize: '10px', color: '#b0a898', letterSpacing: '0.06em' }}>
                  <span style={{ color: '#5d9470' }}>◉ {totalPago}</span>
                  {' · '}
                  <span style={{ color: '#b8960a' }}>⇄ {totalTransferido}</span>
                  {' · '}
                  <span style={{ color: '#7a68a4' }}>◑ {totalParcelado}</span>
                  {' · '}
                  <span style={{ color: '#8a7a58' }}>◐ {totalNoLocal}</span>
                  {' · '}
                  <span style={{ color: '#c4892a' }}>? {totalConferir}</span>
                  {' · '}
                  <span style={{ color: '#b0a898' }}>◎ {totalAberto}</span>
                </div>
                <button onClick={() => setPaymentSummaryOpen(false)} style={{ background: 'none', border: '0.5px dashed #5a5248', borderRadius: '2px', color: '#b0a898', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px' }}>
                  ← fechar
                </button>
              </div>
            </div>

            {/* Grupos */}
            <div style={{ padding: '2rem', maxWidth: '560px', margin: '0 auto' }}>
              {groups.map(({ key, label, icon, color }) => {
                const group = active.filter(p => p._statusBuckets.includes(key));
                return (
                  <div key={key} style={{ marginBottom: '2.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.9rem', paddingBottom: '0.5rem', borderBottom: `0.5px solid ${color}` }}>
                      <span style={{ color, fontSize: '16px' }}>{icon}</span>
                      <span style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color, fontWeight: 'bold' }}>
                        {label}
                      </span>
                      <span style={{ fontSize: '10px', color: '#b0a898', marginLeft: '2px' }}>({group.length})</span>
                    </div>
                    {group.length === 0 ? (
                      <div style={{ fontSize: '10px', color: '#c0b8b0', fontStyle: 'italic', padding: '0.4rem 0' }}>nenhum</div>
                    ) : (
                      group.map(p => {
                        const records = p.payment_records || [];
                        const isParcelado = key === 'parcelado';
                        const isPago = key === 'pago';
                        const isTransferido = key === 'transferido';
                        const isNoLocal = key === 'a pagar no local';
                        const isConferirGroup = key === 'conferir pagamento';
                        const expectedAmount = p._expectedAmount;
                        const otherEvents = otherEventsMap[p.contact_id] || [];
                        const paidSoFar = p._paidSoFar;
                        const owed = isNoLocal ? p._pledgedLocal : p._owedAberto;

                        if (isConferirGroup) {
                          return (
                            <div key={p.contact_id} style={{ marginBottom: '12px', border: '0.5px solid #e8b87a', borderRadius: '2px', background: '#fefaf3' }}>
                              {/* Header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', borderBottom: '0.5px dashed #e8b87a', cursor: 'pointer' }}
                                onClick={() => {
                                  setModalAction(null);
                                  setShowCalcMemo(false);
                                  setPaymentModal({ contactId: p.contact_id, status: p.payment_status === 'pago' ? 'em aberto' : (p.payment_status || 'em aberto'), method: 'Câmbio', installmentCount: p.installment_count || '', discountAmount: p.discount != null ? String(p.discount) : '50.00', localAmount: '', paymentAmount: p._owedAberto != null ? String(p._owedAberto) : '', paymentDate: '' });
                                }}
                              >
                                <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530' }}>
                                  {p.contacts?.nickname || p.contacts?.name}
                                </span>
                                {expectedAmount != null && (
                                  <span style={{ fontSize: '10px', color: '#c4892a', fontFamily: "'Courier Prime', monospace" }}>
                                    $ {Number(expectedAmount).toFixed(2)} esperado
                                  </span>
                                )}
                              </div>
                              {/* Multi-ceremony note */}
                              {otherEvents.length > 0 && (
                                <div style={{ padding: '0.4rem 1rem', background: '#fef3e2', fontSize: '9px', color: '#a06030', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.04em', borderBottom: '0.5px dashed #e8b87a' }}>
                                  ⚠ também em: {otherEvents.join(', ')}
                                </div>
                              )}
                              {/* Comprovante */}
                              {p.comprovante_url && (
                                <div style={{ padding: '0.4rem 1rem', borderBottom: '0.5px dashed #e8b87a' }}>
                                  <a href={p.comprovante_url} target="_blank" rel="noreferrer"
                                    style={{ fontSize: '10px', color: '#5d9470', fontFamily: "'Courier Prime', monospace", letterSpacing: '0.04em', textDecoration: 'underline' }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    📎 ver comprovante
                                  </a>
                                </div>
                              )}
                              {/* Observation */}
                              {p.payment_observation && (
                                <div style={{ padding: '0.4rem 1rem', borderBottom: '0.5px dashed #e8b87a', fontSize: '10px', color: '#6a5a40', fontFamily: "'Courier Prime', monospace", fontStyle: 'italic', lineHeight: 1.5 }}>
                                  "{p.payment_observation}"
                                </div>
                              )}
                              {/* Ações conferir */}
                              <div style={{ padding: '0.6rem 1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={e => { e.stopPropagation(); confirmPayment(p.contact_id); }}
                                    style={{ padding: '6px 10px', background: '#5d9470', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                                  >✓ Câmbio Total</button>
                                  <button
                                    onClick={e => { e.stopPropagation(); setConfirmPartialModal({ contactId: p.contact_id, amount: '' }); }}
                                    style={{ padding: '6px 10px', background: '#7a68a4', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                                  >◑ Parcial</button>
                                  <button
                                    onClick={e => { e.stopPropagation(); if (confirm('Cancelar comprovante e reverter para Em Aberto?')) cancelConferirPayment(p.contact_id); }}
                                    style={{ padding: '6px 10px', background: 'transparent', color: '#c0392b', border: '0.5px solid #e8b0b0', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                                  >✕ Cancelar</button>
                                </div>
                                {confirmPartialModal?.contactId === p.contact_id && (
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '6px 0' }}>
                                    <input
                                      type="number" min="0" step="0.01"
                                      value={confirmPartialModal.amount}
                                      onChange={e => setConfirmPartialModal(prev => ({ ...prev, amount: e.target.value }))}
                                      placeholder="Valor recebido (USD)"
                                      autoFocus
                                      style={{ flex: 1, padding: '5px 8px', background: '#faf7f0', border: '0.5px solid #b8a8d8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', outline: 'none' }}
                                    />
                                    <button
                                      onClick={e => { e.stopPropagation(); if (confirmPartialModal.amount) confirmPartialPayment(p.contact_id, confirmPartialModal.amount); }}
                                      style={{ padding: '5px 12px', background: '#7a68a4', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}
                                    >ok</button>
                                    <button
                                      onClick={e => { e.stopPropagation(); setConfirmPartialModal(null); }}
                                      style={{ padding: '5px 8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}
                                    >×</button>
                                  </div>
                                )}
                                {(p.payment_log?.length > 0) && (
                                  <LogFooter log={p.payment_log} fmtLog={fmtLog}
                                    onOpenModal={() => {
                                      const combined = [
                                        ...(p.enrollment_log || []).map(e => ({ ...e, _type: 'inscrição' })),
                                        ...(p.payment_log || []).map(e => ({ ...e, _type: 'pagamento' })),
                                      ].sort((a, b) => new Date(a.at) - new Date(b.at));
                                      setLogModal({ name: p.contacts?.nickname || p.contacts?.name, log: combined });
                                    }}
                                    onRevert={() => revertPayment(p.contact_id)}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={p.contact_id} style={{ marginBottom: '10px' }}>
                            {/* Nome + botão editar status */}
                            <div
                              onClick={() => {
                                setModalAction(null);
                                setShowCalcMemo(false);
                                setPaymentModal({ contactId: p.contact_id, status: p.payment_status === 'pago' ? 'em aberto' : (p.payment_status || 'em aberto'), method: 'Câmbio', installmentCount: p.installment_count || '', discountAmount: p.discount != null ? String(p.discount) : '50.00', localAmount: '', paymentAmount: p._owedAberto != null ? String(p._owedAberto) : '', paymentDate: '' });
                              }}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', background: '#fdfbf7', border: '0.5px solid #d0cbc2', borderRadius: '2px', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530' }}>
                                  {p.contacts?.nickname || p.contacts?.name}
                                </span>
                                {p.payment_observation && (
                                  <button
                                    onClick={e => { e.stopPropagation(); setObsModal({ name: p.contacts?.nickname || p.contacts?.name, text: p.payment_observation }); }}
                                    title="Ver observação"
                                    style={{ background: 'none', border: '0.5px solid #d0cbc2', borderRadius: '2px', cursor: 'pointer', padding: '1px 5px', fontFamily: "'Courier Prime', monospace", fontSize: '8px', letterSpacing: '0.08em', color: '#9a9288', textTransform: 'uppercase', lineHeight: 1.6 }}
                                  >
                                    obs
                                  </button>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                {!isPago && !isTransferido && owed != null && (
                                  <span style={{ fontSize: '10px', color: '#b0a898', letterSpacing: '0.04em', fontFamily: "'Courier Prime', monospace" }}>
                                    $ {Number(owed).toFixed(2)}
                                  </span>
                                )}
                                {isParcelado && p.installment_count > 0 && (
                                  <span style={{ fontSize: '9px', color: '#7a68a4', letterSpacing: '0.04em' }}>
                                    {records.filter(r => !r.cancelled).length}/{p.installment_count} parcelas
                                  </span>
                                )}
                                {isPago && p.discount != null && (
                                  <span style={{ fontSize: '9px', color: '#8a7a58' }}>desc. $ {Number(p.discount).toFixed(2)}</span>
                                )}
                              </div>
                            </div>

                            {/* Registros individuais de pagamento */}
                            {records.filter(r => !r.cancelled).map((rec, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.4rem 1rem', background: rec.pledge ? '#fbf6ec' : '#f5f0f8', borderLeft: '0.5px solid #d0cbc2', borderRight: '0.5px solid #d0cbc2', borderBottom: '0.5px dashed #d0cbc2' }}>
                                <span style={{ flex: 1, fontSize: '11px', color: rec.pledge ? '#8a7a58' : '#3a3530', fontFamily: "'Courier Prime', monospace" }}>
                                  {rec.pledge ? 'a pagar no local' : `${rec.date ? new Date(rec.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}${rec.method ? ` · ${rec.method}` : ''}`}
                                </span>
                                <span style={{ fontSize: '11px', color: rec.pledge ? '#8a7a58' : '#3a3530', fontFamily: "'Courier Prime', monospace" }}>
                                  {rec.amount != null ? `$ ${Number(rec.amount).toFixed(2)}` : '—'}
                                </span>
                                {rec.pledge && (
                                  <button
                                    onClick={e => { e.stopPropagation(); confirmLocalPledge(p.contact_id, records.indexOf(rec)); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5d9470', fontSize: '12px', padding: '0 2px', lineHeight: 1 }}
                                    title="Confirmar recebimento"
                                  >✓</button>
                                )}
                                <button
                                  onClick={e => { e.stopPropagation(); cancelInstallmentPayment(p.contact_id, records.indexOf(rec)); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8a8a8', fontSize: '14px', padding: '0 2px', lineHeight: 1 }}
                                  title="Excluir"
                                >×</button>
                              </div>
                            ))}
                            {/* Log footer */}
                            {(p.payment_log?.length > 0) && (
                              <div style={{ borderLeft: '0.5px solid #d0cbc2', borderRight: '0.5px solid #d0cbc2', borderBottom: '0.5px solid #d0cbc2', borderRadius: '0 0 2px 2px', padding: '0.35rem 1rem' }}>
                                <LogFooter log={p.payment_log} fmtLog={fmtLog}
                                  onOpenModal={() => {
                                    const combined = [
                                      ...(p.enrollment_log || []).map(e => ({ ...e, _type: 'inscrição' })),
                                      ...(p.payment_log || []).map(e => ({ ...e, _type: 'pagamento' })),
                                    ].sort((a, b) => new Date(a.at) - new Date(b.at));
                                    setLogModal({ name: p.contacts?.nickname || p.contacts?.name, log: combined });
                                  }}
                                  onRevert={() => revertPayment(p.contact_id)}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {diaryOpen && (() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const fiveDaysAgoStr = new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10);

        const allEntries = [];
        participants.forEach(p => {
          const name = p.contacts?.nickname || p.contacts?.name || '—';
          (p.enrollment_log || []).forEach(e => allEntries.push({ ...e, _name: name, _type: 'inscrição' }));
          (p.payment_log || []).forEach(e => allEntries.push({ ...e, _name: name, _type: 'pagamento' }));
        });
        allEntries.sort((a, b) => new Date(b.at) - new Date(a.at));

        let filtered;
        if (diaryDateFilter === 'all') {
          filtered = allEntries;
        } else if (diaryDateFilter === 'today') {
          filtered = allEntries.filter(e => e.at.startsWith(todayStr));
        } else if (diaryDateFilter === 'yesterday') {
          filtered = allEntries.filter(e => e.at.startsWith(yesterdayStr));
        } else if (diaryDateFilter === '5days') {
          filtered = allEntries.filter(e => e.at.slice(0, 10) >= fiveDaysAgoStr);
        } else {
          filtered = allEntries.filter(e => {
            const d = e.at.slice(0, 10);
            return (!diaryRangeFrom || d >= diaryRangeFrom) && (!diaryRangeTo || d <= diaryRangeTo);
          });
        }

        const modeFilters = [
          { key: 'today', label: 'Hoje' },
          { key: 'yesterday', label: 'Ontem' },
          { key: '5days', label: 'Últimos 5 dias' },
          { key: 'all', label: 'Tudo' },
          { key: 'range', label: 'Período' },
        ];

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: '#f7f4ee', overflowY: 'auto', fontFamily: "'Courier Prime', monospace" }}>
            <div style={{ position: 'sticky', top: 0, background: '#3a3530', zIndex: 1 }}>
              <div style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '18px', color: '#f7f4ee', fontWeight: 400 }}>Diário</div>
                  <div style={{ fontSize: '10px', color: '#b0a898', letterSpacing: '0.08em', marginTop: '1px' }}>{event.name}</div>
                </div>
                <button onClick={() => setDiaryOpen(false)} style={{ background: 'none', border: '0.5px dashed #5a5248', borderRadius: '2px', color: '#b0a898', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px' }}>
                  ← fechar
                </button>
              </div>
              <div style={{ padding: '0 2rem 0.75rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {modeFilters.map(f => (
                  <button key={f.key} onClick={() => setDiaryDateFilter(f.key)} style={{ padding: '3px 9px', borderRadius: '2px', cursor: 'pointer', border: diaryDateFilter === f.key ? '0.5px solid #f7f4ee' : '0.5px dashed #5a5248', background: diaryDateFilter === f.key ? '#f7f4ee' : 'transparent', color: diaryDateFilter === f.key ? '#3a3530' : '#b0a898', fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {f.label}
                  </button>
                ))}
                {diaryDateFilter === 'range' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '4px' }}>
                    <span style={{ fontSize: '9px', color: '#b0a898', letterSpacing: '0.08em' }}>de</span>
                    <input
                      type="date"
                      value={diaryRangeFrom}
                      onChange={e => setDiaryRangeFrom(e.target.value)}
                      style={{ padding: '3px 6px', background: 'transparent', border: '0.5px dashed #5a5248', borderRadius: '2px', color: '#f7f4ee', fontFamily: "'Courier Prime', monospace", fontSize: '9px', colorScheme: 'dark' }}
                    />
                    <span style={{ fontSize: '9px', color: '#b0a898', letterSpacing: '0.08em' }}>até</span>
                    <input
                      type="date"
                      value={diaryRangeTo}
                      onChange={e => setDiaryRangeTo(e.target.value)}
                      style={{ padding: '3px 6px', background: 'transparent', border: '0.5px dashed #5a5248', borderRadius: '2px', color: '#f7f4ee', fontFamily: "'Courier Prime', monospace", fontSize: '9px', colorScheme: 'dark' }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', fontSize: '12px', color: '#aaa49c', fontStyle: 'italic' }}>
                  nenhum registro para este período.
                </div>
              ) : (
                filtered.map((entry, i) => {
                  const dt = new Date(entry.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '0.65rem 0', borderBottom: '0.5px dashed #ddd9cf', alignItems: 'flex-start' }}>
                      <div style={{ width: '4px', flexShrink: 0, borderRadius: '2px', background: entry._type === 'pagamento' ? '#7a68a4' : '#5d9470', alignSelf: 'stretch', marginTop: '2px', minHeight: '16px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '9px', color: '#aaa49c', letterSpacing: '0.04em' }}>{dt}</span>
                          <span style={{ fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', color: entry._type === 'pagamento' ? '#7a68a4' : '#5d9470', background: entry._type === 'pagamento' ? '#f0eef8' : '#eef5f0', padding: '1px 5px', borderRadius: '2px' }}>{entry._type}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#3a3530' }}>
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
      })()}

      {/* Modal de Histórico de Pagamentos */}
      {logModal && (
        <div onClick={() => setLogModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace", maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.5rem 0.8rem', borderBottom: '0.5px solid #d0cbc2', flexShrink: 0 }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.2rem' }}>Histórico</div>
              <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '18px', color: '#3a3530' }}>{logModal.name}</div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '0.8rem 1.5rem' }}>
              {[...logModal.log].reverse().map((entry, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '0.5rem 0', borderBottom: i < logModal.log.length - 1 ? '0.5px dashed #e0dbd4' : 'none' }}>
                  <div style={{ width: '4px', flexShrink: 0, borderRadius: '2px', background: i === 0 ? '#5d9470' : '#d0cbc2', alignSelf: 'stretch', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '9px', color: '#aaa49c', letterSpacing: '0.04em', marginBottom: '2px' }}>
                      {new Date(entry.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                    </div>
                    <div style={{ fontSize: '11px', color: '#3a3530' }}>
                      <span style={{ fontWeight: 600 }}>{entry.by}</span> {entry.msg}
                      {entry._type && <span style={{ marginLeft: '6px', fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', color: entry._type === 'pagamento' ? '#7a68a4' : '#5d9470', background: entry._type === 'pagamento' ? '#f0eef8' : '#eef5f0', padding: '1px 5px', borderRadius: '2px' }}>{entry._type}</span>}
                      {entry.url && (
                        <a href={entry.url} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'inline-block', marginLeft: '6px', color: '#5d9470', fontSize: '9px', letterSpacing: '0.04em', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                          📎 ver comprovante
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0.8rem 1.5rem', borderTop: '0.5px solid #d0cbc2', flexShrink: 0 }}>
              <button onClick={() => setLogModal(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Observação */}
      {obsModal && (
        <div onClick={() => setObsModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '340px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace" }}>
            <div style={{ padding: '1rem 1.5rem 0.8rem', borderBottom: '0.5px solid #d0cbc2' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.2rem' }}>Observação</div>
              <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '18px', color: '#3a3530' }}>{obsModal.name}</div>
            </div>
            <div style={{ padding: '1rem 1.5rem', fontSize: '12px', color: '#3a3530', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{obsModal.text}"
            </div>
            <div style={{ padding: '0 1.5rem 1rem' }}>
              <button onClick={() => setObsModal(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição do Contato */}
      {contactEditModal && (
        <div onClick={() => setContactEditModal(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '360px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace" }}>
            <div style={{ padding: '1.2rem 1.5rem 0.9rem', borderBottom: '0.5px solid #d0cbc2' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.2rem' }}>
                {contactEditModal.contactId && !contactEditModal.addingToEvent ? 'Editar cadastro' : contactEditModal.contactId && contactEditModal.addingToEvent ? 'Adicionar à cerimônia' : 'Novo viajante'}
              </div>
              <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#3a3530', lineHeight: 1.1 }}>
                {contactEditModal.nickname || 'Viajante'}
              </div>
            </div>
            <div style={{ padding: '1.2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Nome */}
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Nome</div>
                <input
                  type="text"
                  value={contactEditModal.nickname}
                  onChange={e => setContactEditModal(prev => ({ ...prev, nickname: e.target.value, contactId: prev.addingToEvent ? null : prev.contactId }))}
                  style={{ width: '100%', padding: '7px 10px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', boxSizing: 'border-box', outline: 'none' }}
                />
                {!contactEditModal.contactId && contactEditModal.nickname.length >= 2 && (() => {
                  const q = contactEditModal.nickname.toLowerCase();
                  const matches = allContacts.filter(c => (c.nickname || c.name || '').toLowerCase().includes(q)).slice(0, 8);
                  if (matches.length === 0) return null;
                  return (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fdfbf7', border: '0.5px solid #c8c2b8', borderTop: 'none', borderRadius: '0 0 2px 2px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 200 }}>
                      {matches.map(c => (
                        <button key={c.id} type="button"
                          onClick={() => {
                            const { ddi, localPhone } = parsePhone(c.phone || '');
                            setContactEditModal(prev => ({ ...prev, contactId: c.id, nickname: c.nickname || c.name || '', nome_completo: c.nome_completo || '', ddi, phone: localPhone }));
                          }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', background: 'transparent', border: 'none', borderBottom: '0.5px dashed #e8e0d8', padding: '7px 10px', cursor: 'pointer' }}
                        >
                          <span>{c.nickname || c.name}</span>
                          {c.phone && <span style={{ fontSize: '9px', color: '#aaa49c' }}>{c.phone}</span>}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Nome Completo */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c' }}>Nome Completo (documentos)</div>
                  {contactEditModal.nickname && (
                    <button type="button"
                      onClick={() => setContactEditModal(prev => ({ ...prev, nome_completo: prev.nickname }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#9a9288', letterSpacing: '0.06em', textDecoration: 'underline', textUnderlineOffset: '2px', padding: 0 }}>
                      copiar ↑
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={contactEditModal.nome_completo}
                  onChange={e => setContactEditModal(prev => ({ ...prev, nome_completo: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              {/* Telefone com DDI */}
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Telefone (WhatsApp)</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={contactEditModal.ddi}
                    onChange={e => setContactEditModal(prev => ({ ...prev, ddi: e.target.value }))}
                    style={{ width: '96px', padding: '7px 6px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', outline: 'none', flexShrink: 0 }}
                  >
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+351">🇵🇹 +351</option>
                    <option value="+54">🇦🇷 +54</option>
                    <option value="+57">🇨🇴 +57</option>
                    <option value="+52">🇲🇽 +52</option>
                    <option value="+56">🇨🇱 +56</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                  </select>
                  <input
                    type="tel"
                    value={contactEditModal.phone}
                    onChange={e => setContactEditModal(prev => ({ ...prev, phone: e.target.value.replace(/[^\d]/g, '') }))}
                    placeholder="11 99999 9999"
                    style={{ flex: 1, padding: '7px 10px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
            {contactEditModal.contactId && !contactEditModal.addingToEvent && (
              <div style={{ padding: '0 1.5rem 0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={contactEditModal.primeira_vez || false}
                    onChange={e => setContactEditModal(prev => ({ ...prev, primeira_vez: e.target.checked }))}
                    style={{ accentColor: '#5d9470', width: '14px', height: '14px' }}
                  />
                  <span style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a7268', fontFamily: "'Courier Prime', monospace" }}>
                    Primeira vez
                  </span>
                </label>
              </div>
            )}
            <div style={{ padding: '0.5rem 1.5rem 1.2rem', display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={saveContact}
                disabled={savingContact}
                style={{ flex: 1, padding: '8px', background: savingContact ? '#7a7268' : '#3a3530', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: savingContact ? 'default' : 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                {savingContact ? 'salvando...' : 'salvar'}
              </button>
              <button
                onClick={() => setContactEditModal(null)}
                style={{ padding: '8px 14px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal da Ficha Médica */}
      {activeFichaContact && (() => {
        const mfd = activeFichaContact.medical_form_data || {};
        const hasMfd = Object.keys(mfd).length > 0;
        const sL = { fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' };

        const itemOk = (item) => item.pos ? !!mfd[item.k] : !mfd[item.k];
        const hasConcerns = hasMfd && FICHA_SECTIONS.some(s => s.items.some(it => !itemOk(it)));

        return (
          <div onClick={() => setActiveFichaContact(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '560px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', display: 'flex', flexDirection: 'column' }}>

              {/* Header */}
              <div style={{ padding: '1.5rem 2rem 1rem', borderBottom: '0.5px solid #d0cbc2', position: 'sticky', top: 0, background: '#fdfbf7', zIndex: 1 }}>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '11px', letterSpacing: '0.08em', color: '#aaa49c', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Ficha Médica</div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '26px', fontWeight: 400, color: '#3a3530', lineHeight: 1.1 }}>{activeFichaContact.name}</div>
                {hasConcerns && <div style={{ marginTop: '0.5rem', fontSize: '10px', color: '#b45309', fontWeight: 'bold' }}>⚠ Itens em atenção marcados em laranja abaixo</div>}
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>

                {/* Status */}
                <div style={{ padding: '0.6rem 0.9rem', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontSize: '10px' }}>
                  {activeFichaContact.remedio === 'não' || activeFichaContact.remedio === 'em andamento'
                    ? <span style={{ color: '#5d9470', fontWeight: 'bold' }}>✓ Formulário concluído e assinado</span>
                    : activeFichaContact.medical_form_step > 0
                      ? <span style={{ color: '#8a7a58', fontWeight: 'bold' }}>⏳ Incompleto — parou no passo {activeFichaContact.medical_form_step} de 8</span>
                      : <span style={{ color: '#9a9288', fontWeight: 'bold' }}>✕ Não iniciou o preenchimento</span>
                  }
                </div>

                {/* Dados pessoais */}
                {hasMfd && (mfd.nome_completo || mfd.data_nascimento || mfd.telefone) && (
                  <div>
                    <div style={sL}>Dados Pessoais</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem 1rem', fontSize: '10px', padding: '0.6rem 0.9rem', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px' }}>
                      {mfd.nome_completo && <div><span style={{ color: '#aaa49c' }}>Nome: </span>{mfd.nome_completo}</div>}
                      {mfd.data_nascimento && <div><span style={{ color: '#aaa49c' }}>Nascimento: </span>{mfd.data_nascimento}</div>}
                      {mfd.telefone && <div><span style={{ color: '#aaa49c' }}>Tel: </span>{mfd.telefone_ddi || ''} {mfd.telefone}</div>}
                      {mfd.contato_emergencia && <div><span style={{ color: '#aaa49c' }}>Emergência: </span>{mfd.contato_emergencia}</div>}
                    </div>
                  </div>
                )}

                {/* Remédios informados */}
                <div>
                  <div style={sL}>Remédios Informados</div>
                  {activeFichaContact.medications_list?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {activeFichaContact.medications_list.map((med, idx) => (
                        <div key={idx} style={{ padding: '0.45rem 0.8rem', background: '#faf7f0', borderRadius: '2px', borderLeft: '3px solid #7a7268' }}>
                          <div style={{ fontWeight: 'bold' }}>{med.name}</div>
                          <div style={{ fontSize: '9px', color: '#9a9288', marginTop: '0.15rem' }}>
                            {[med.dosage, med.frequency, med.last_use ? `último uso: ${med.last_use}` : ''].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                      ))}
                      {mfd.sec4c_outros && <div style={{ padding: '0.45rem 0.8rem', background: '#faf7f0', borderRadius: '2px', borderLeft: '3px solid #b8b0a4', fontSize: '10px', color: '#5a4a3a' }}><span style={{ color: '#aaa49c' }}>Outros: </span>{mfd.sec4c_outros}</div>}
                    </div>
                  ) : (
                    <div style={{ padding: '0.6rem 0.9rem', background: '#faf7f0', borderRadius: '2px', color: '#7a7268', fontSize: '10px' }}>Nenhum remédio informado.</div>
                  )}
                </div>

                {/* Declarações por seção */}
                {hasMfd && FICHA_SECTIONS.map((sec, si) => {
                  const concerns = sec.items.filter(it => !itemOk(it));
                  return (
                    <div key={si}>
                      <div style={{ ...sL, color: concerns.length > 0 ? '#b45309' : '#aaa49c' }}>{sec.title}{concerns.length > 0 ? ` — ${concerns.length} atenção` : ''}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {sec.items.map((it, ii) => {
                          const ok = itemOk(it);
                          return (
                            <div key={ii} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.4rem 0.7rem', background: ok ? 'transparent' : '#fff8f0', border: `0.5px solid ${ok ? '#e8e2d8' : '#e8c080'}`, borderRadius: '2px', borderLeft: `3px solid ${ok ? '#c8c2b8' : '#d4821a'}` }}>
                              <span style={{ flexShrink: 0, color: ok ? '#7a9e85' : '#d4821a', fontWeight: 'bold', fontSize: '12px', lineHeight: 1.2 }}>{ok ? '✓' : '⚠'}</span>
                              <span style={{ fontSize: '10px', lineHeight: 1.5, color: ok ? '#5a5048' : '#7a3d00' }}>{it.t}</span>
                            </div>
                          );
                        })}
                        {/* Extra text fields */}
                        {sec.items.find(it => it.k === 'sec2_historico') && mfd.sec2_historico_obs && (
                          <div style={{ padding: '0.4rem 0.7rem', background: '#fff8f0', border: '0.5px solid #e8c080', borderRadius: '2px', fontSize: '10px', color: '#7a3d00' }}>
                            <span style={{ fontWeight: 'bold' }}>Histórico informado: </span>{mfd.sec2_historico_obs}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Assinatura */}
                {mfd.assinatura && (
                  <div>
                    <div style={sL}>Assinatura</div>
                    <div style={{ border: '0.5px solid #c8c2b8', borderRadius: '2px', padding: '0.5rem', background: '#faf7f0', textAlign: 'center' }}>
                      <img src={mfd.assinatura} alt="Assinatura" style={{ maxWidth: '100%', height: '80px', objectFit: 'contain' }} />
                      {mfd.data_assinatura && <div style={{ fontSize: '9px', color: '#aaa49c', marginTop: '0.3rem' }}>Assinado em {mfd.data_assinatura}</div>}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer com botões */}
              <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '0.5px solid #d0cbc2', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const cleanPhone = activeFichaContact.phone?.replace(/\D/g, '') || '';
                    if (!cleanPhone) { alert('Este viajante não tem telefone cadastrado.'); return; }
                    const publicLink = `${window.location.origin}/ficha?id=${activeFichaContact.id}`;
                    const firstName = (activeFichaContact.nickname || activeFichaContact.name || '').split(' ')[0] || '';
                    const defaultFichaMsg = 'Oi, [nome]!\n\nSegue o Formulário de Triagem, clicando no link abaixo:\n\n[link]\n\nPor favor preenche o mais rápido possível pra dar tempo de a gente planejar sua experiência.';
                    const message = (event?.ficha_message || defaultFichaMsg).replace('[nome]', firstName).replace('[link]', publicLink);
                    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  style={{ ...s.btn, flex: '1 1 100px', justifyContent: 'center' }}
                >📱 WhatsApp</button>

                {activeFichaContact.remedio !== 'não informado' && (
                  <button onClick={() => exportFichaPDF(activeFichaContact)} style={{ ...s.btn, flex: '1 1 100px', justifyContent: 'center' }}>
                    📄 Exportar PDF
                  </button>
                )}

                <button onClick={() => setActiveFichaContact(null)} style={{ ...s.btn, flex: '1 1 100px', justifyContent: 'center', background: '#7a7268', color: '#fff', border: 'none' }}>
                  Fechar
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
