'use client';

import { useState, useEffect, Fragment } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

const PillIcon = ({ status = 'pending' }) => {
  const isOk = status === 'ok';
  const isAttn = status === 'attention';
  const fill = isOk ? '#5d9470' : isAttn ? '#c0392b' : 'none';
  const stroke = (!isOk && !isAttn) ? '#c8c2b8' : 'none';
  const lineColor = (!isOk && !isAttn) ? '#c8c2b8' : 'rgba(255,255,255,0.5)';
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" style={{ display: 'block', flexShrink: 0 }}>
      <g transform="rotate(-38 8 8)">
        <rect x="1.5" y="5.5" width="13" height="5" rx="2.5" fill={fill} stroke={stroke} strokeWidth="0.9"/>
        <line x1="8" y1="5.5" x2="8" y2="10.5" stroke={lineColor} strokeWidth="0.7"/>
      </g>
    </svg>
  );
};

const CoinIcon = ({ status = 'em aberto' }) => {
  const isPago = status === 'pago';
  const isLocal = status === 'a pagar no local';
  const isActive = isPago || isLocal;
  const bg = isPago ? '#5d9470' : isLocal ? '#8a7a58' : 'none';
  const fg = isActive ? '#f7f4ee' : '#c8c2b8';
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="10" cy="10" r="8.5" fill={bg} stroke={isActive ? 'none' : '#c8c2b8'} strokeWidth="0.9"/>
      <text x="10" y="10" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="normal" fontFamily="Georgia, serif" fill={fg}>$</text>
    </svg>
  );
};

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
    marginBottom: "0.4rem",
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

const FICHA_VALIDITY_MS = 30 * 24 * 60 * 60 * 1000;

function computeEffectiveRemedioStatus(p) {
  if (p.remedio_status === 'Ok Manual') return 'Ok Manual';
  const fichaDate = p.contacts?.last_ficha_at;
  if (!fichaDate) {
    if (p.remedio_status === 'enviado') return 'enviado';
    return 'enviar';
  }
  const fichaValid = (Date.now() - new Date(fichaDate).getTime()) < FICHA_VALIDITY_MS;
  if (!fichaValid) {
    if (p.remedio_status === 'enviado') return 'enviado';
    return 'enviar';
  }
  if (p.contacts?.remedio === 'não') return 'Ok';
  if (p.contacts?.remedio === 'em andamento' || p.contacts?.medications_list?.length > 0) return 'preenchido';
  if (p.remedio_status === 'enviado') return 'enviado';
  return 'enviar';
}

function computeVagaBadge(p) {
  const effectiveRemedioStatus = computeEffectiveRemedioStatus(p);
  const hasRemedioOk = effectiveRemedioStatus === 'Ok' || effectiveRemedioStatus === 'Ok Manual';
  const hasPaymentOk = p.payment_status === 'pago' || p.payment_status === 'a pagar no local';
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
  const [paymentSummaryOpen, setPaymentSummaryOpen] = useState(false);
  const [contactEditModal, setContactEditModal] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const exportFichaPDF = (contact) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para exportar o PDF.');
      return;
    }

    let medsHTML = '';
    if (contact.medications_list && contact.medications_list.length > 0) {
      contact.medications_list.forEach(med => {
        medsHTML += `
          <div class="med-card">
            <div class="med-name">💊 ${med.name}</div>
            ${(med.dosage || med.frequency) ? `
              <div class="med-desc">
                Dosagem: ${med.dosage || 'Não informada'} | Frequência: ${med.frequency || 'Não informada'}
              </div>
            ` : ''}
          </div>
        `;
      });
    } else {
      medsHTML = `<p class="no-info">Nenhum remédio de uso contínuo informado (declarou não tomar remédios).</p>`;
    }

    let obsHTML = '';
    if (contact.observations) {
      const cleanObs = contact.observations
        .replace(/\[Ficha Médica preenchida online[^\]]*\]\s*/g, '')
        .replace(/Declaração: Aceita e declarada como verdadeira em [^\n]*/g, '');
      obsHTML = `<div class="observations">${cleanObs.trim() || 'Nenhuma observação declarada.'}</div>`;
    } else {
      obsHTML = `<p class="no-info">Nenhuma observação ou terapia alternativa declarada.</p>`;
    }

    let dateString = new Date().toLocaleDateString('pt-BR');
    if (contact.observations) {
      const match = contact.observations.match(/em (\d{2}\/\d{2}\/\d{4})/i);
      if (match && match[1]) {
        dateString = match[1];
      }
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ficha Médica - ${contact.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;600&display=swap');
          body {
            font-family: 'Lora', Georgia, serif;
            color: #2b2b2b;
            line-height: 1.6;
            padding: 3rem;
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 2px double #8b7e66;
            padding-bottom: 1.5rem;
            margin-bottom: 2.5rem;
          }
          .header h1 {
            font-family: 'Cinzel', serif;
            font-size: 1.8rem;
            color: #3d6b52;
            margin: 0;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .header p {
            font-family: 'Montserrat', sans-serif;
            font-size: 0.8rem;
            color: #666;
            margin: 0.5rem 0 0 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .section-title {
            font-family: 'Montserrat', sans-serif;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #3d6b52;
            border-bottom: 1px solid #d4cbb8;
            padding-bottom: 0.4rem;
            margin-top: 2rem;
            margin-bottom: 1.5rem;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
            font-size: 0.95rem;
          }
          .info-item strong {
            font-family: 'Montserrat', sans-serif;
            font-size: 0.75rem;
            text-transform: uppercase;
            color: #555;
            display: block;
            margin-bottom: 0.2rem;
          }
          .med-card {
            padding: 0.8rem 1.2rem;
            background: #faf9f6;
            border-left: 3px solid #3d6b52;
            border-bottom: 1px solid #e8e2d5;
            border-right: 1px solid #e8e2d5;
            border-top: 1px solid #e8e2d5;
            border-radius: 6px;
            margin-bottom: 0.8rem;
          }
          .med-name {
            font-weight: bold;
            color: #1a1a1a;
          }
          .med-desc {
            font-size: 0.8rem;
            color: #555;
            font-style: italic;
            margin-top: 0.2rem;
          }
          .observations {
            font-style: italic;
            color: #444;
            white-space: pre-wrap;
            background: #faf9f6;
            padding: 1rem 1.5rem;
            border: 1px dashed #d4cbb8;
            border-radius: 6px;
            margin-top: 0.5rem;
            font-size: 0.9rem;
          }
          .no-info {
            color: #888;
            font-style: italic;
            font-size: 0.9rem;
          }
          .signature-area {
            margin-top: 5rem;
            text-align: center;
            border-top: 1px solid #d4cbb8;
            padding-top: 1.8rem;
            page-break-inside: avoid;
          }
          .signature-text {
            font-family: 'Lora', serif;
            font-size: 1.15rem;
            font-style: italic;
            color: #1a1a1a;
            margin-bottom: 0.4rem;
          }
          .signature-date {
            font-family: 'Montserrat', sans-serif;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #666;
          }
          @media print {
            body {
              padding: 1cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Ficha Médica</h1>
          <p>Journey • Confidencial & Formal</p>
        </div>

        <div class="section-title">Dados de Identificação</div>
        <div class="info-grid">
          <div class="info-item">
            <strong>Nome do Viajante</strong>
            ${contact.name}
          </div>
          <div class="info-item">
            <strong>CPF</strong>
            ${contact.cpf ? contact.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : 'Não informado'}
          </div>
          <div class="info-item">
            <strong>Telefone</strong>
            ${contact.phone || 'Não informado'}
          </div>
          <div class="info-item">
            <strong>Status de Remédios</strong>
            ${contact.remedio === 'não' ? '✅ DECLARADO SEM USO DE REMÉDIOS' : '⏳ CONCORRE A AVALIAÇÃO DE MEDICAMENTOS'}
          </div>
        </div>

        <div class="section-title">1. Medicamentos e Remédios de Uso Contínuo</div>
        <div>
          ${medsHTML}
        </div>

        <div class="section-title">2. Observações e Terapias Alternativas</div>
        <div>
          ${obsHTML}
        </div>

        <div class="signature-area">
          <div class="signature-text">Assinado eletronicamente por ${contact.name}</div>
          <div class="signature-date">Declaração de veracidade validada em ${dateString}</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `);
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

    const { data: contactsData } = await supabase.from('contacts').select('id, name, nickname, nome_completo, phone').order('nickname');
    if (contactsData) setAllContacts(contactsData);

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
    
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .match({ event_id: eventId, contact_id: contactId });
      
    if (!error) {
      fetchEventData();
    }
  }

  async function toggleDayPresence(contactId, day, currentStatus) {
    const field = day === 1 ? 'date1_confirmed' : 'date2_confirmed';
    const { error } = await supabase
      .from('event_participants')
      .update({ [field]: !currentStatus })
      .match({ event_id: eventId, contact_id: contactId });
      
    if (!error) {
      setParticipants(prev => prev.map(p => 
        p.contact_id === contactId ? { ...p, [field]: !currentStatus } : p
      ));
    }
  }

  async function updateParticipantStatus(contactId, newStatus) {
    const { error } = await supabase
      .from('event_participants')
      .update({ status: newStatus })
      .match({ event_id: eventId, contact_id: contactId });
      
    if (!error) {
      setParticipants(prev => prev.map(p => 
        p.contact_id === contactId ? { ...p, status: newStatus } : p
      ));
    }
  }

  async function updateRemedioStatus(contactId, newStatus) {
    const { error } = await supabase
      .from('event_participants')
      .update({ remedio_status: newStatus })
      .match({ event_id: eventId, contact_id: contactId });
      
    if (!error) {
      setParticipants(prev => prev.map(p => 
        p.contact_id === contactId ? { ...p, remedio_status: newStatus } : p
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
    const { error: participantsError } = await supabase
      .from('event_participants')
      .update({ remedio_status: 'enviar' })
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
    const { error } = await supabase
      .from('event_participants')
      .update({ [field]: !currentValue })
      .match({ event_id: eventId, contact_id: contactId });
    if (!error) {
      setParticipants(prev => prev.map(p =>
        p.contact_id === contactId ? { ...p, [field]: !currentValue } : p
      ));
    }
  }

  async function updatePayment(contactId, paymentStatus, paymentMethod) {
    const { error } = await supabase
      .from('event_participants')
      .update({ payment_status: paymentStatus, payment_method: paymentMethod })
      .match({ event_id: eventId, contact_id: contactId });
    if (!error) {
      setParticipants(prev => prev.map(p =>
        p.contact_id === contactId ? { ...p, payment_status: paymentStatus, payment_method: paymentMethod } : p
      ));
    }
  }

  function openContactEdit(contact) {
    setContactEditModal({
      contactId: contact.id,
      addingToEvent: false,
      nickname: contact.nickname || contact.name || '',
      nome_completo: contact.nome_completo || '',
      phone: contact.phone || '',
    });
  }

  async function saveContact() {
    const { contactId, addingToEvent, nickname, nome_completo, phone } = contactEditModal;

    if (contactId && !addingToEvent) {
      // Editing an existing participant's contact fields
      const fields = { name: nickname, nickname, nome_completo, phone };
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
      const { error } = await supabase
        .from('event_participants')
        .insert([{ event_id: eventId, contact_id: contactId, status: 'intenção de ir', date1_confirmed: true, date2_confirmed: !!event.date2 }]);
      if (error) { alert('Erro ao adicionar: ' + error.message); return; }
      setContactEditModal(null);
      fetchEventData();
    } else {
      // Creating a brand-new contact and adding to event
      if (phone) {
        const cleanNew = phone.replace(/\D/g, '');
        const dup = allContacts.find(c => c.phone?.replace(/\D/g, '') === cleanNew);
        if (dup) {
          if (!confirm(`O número ${phone} já está cadastrado para "${dup.nickname || dup.name}". Criar mesmo assim?`)) return;
        }
      }
      const { data: newContact, error: cErr } = await supabase
        .from('contacts')
        .insert([{ name: nickname, nickname, nome_completo, phone }])
        .select()
        .single();
      if (cErr) { alert('Erro ao criar contato: ' + cErr.message); return; }
      const { error: pErr } = await supabase
        .from('event_participants')
        .insert([{ event_id: eventId, contact_id: newContact.id, status: 'intenção de ir', date1_confirmed: true, date2_confirmed: !!event.date2 }]);
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
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

  const confirmados = participants.filter(p => p.status === 'Confirmado');
  const intencao = participants.filter(p => p.status === 'intenção de ir');
  const iniciais = participants.filter(p => p.status === 'avisado' || p.status === 'desistiu' || p.status === 'avisar');

  const activeParticipants = [...confirmados, ...intencao];
  const day1Active = activeParticipants.filter(p => p.date1_confirmed);
  const day1ConfirmadosCount = day1Active.filter(p => computeVagaBadge(p) === 'Confirmado').length;
  const day1ReservadosCount = day1Active.filter(p => computeVagaBadge(p) === 'Reservado').length;
  const day1Stats = { confirmados: day1ConfirmadosCount, reservados: day1ReservadosCount, total: day1ConfirmadosCount + day1ReservadosCount };
  const day2Active = activeParticipants.filter(p => p.date2_confirmed);
  const day2ConfirmadosCount = day2Active.filter(p => computeVagaBadge(p) === 'Confirmado').length;
  const day2ReservadosCount = day2Active.filter(p => computeVagaBadge(p) === 'Reservado').length;
  const day2Stats = { confirmados: day2ConfirmadosCount, reservados: day2ReservadosCount, total: day2ConfirmadosCount + day2ReservadosCount };

  const renderParticipantRow = (p, isSimplified = false) => {
    const hasRemedioAccess = p.status === 'intenção de ir' || p.status === 'Confirmado';
    const isSemNada = p.status === 'avisado' || p.status === 'desistiu' || p.status === 'avisar';
    const cellOpacity = isSemNada ? 0.3 : 1;
    const rowOpacity = p.status === 'desistiu' ? 0.4 : 1;

    const effectiveRemedioStatus = computeEffectiveRemedioStatus(p);
    const badgeText = computeVagaBadge(p);

    return (
      <div key={p.contact_id} style={{ ...s.row, opacity: rowOpacity }}>
        {/* Nome + nome completo */}
        <div onClick={() => p.contacts && openContactEdit(p.contacts)} style={{ cursor: 'pointer' }}>
          <div style={{ ...s.travelerName, }}>{p.contacts?.nickname || p.contacts?.name}</div>
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
        </div>

        {/* Remédio */}
        {!isSimplified && hasRemedioAccess ? (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => setRemedioModal({ contactId: p.contact_id, contact: p.contacts })}
          >
            <PillIcon status={(effectiveRemedioStatus === 'Ok' || effectiveRemedioStatus === 'Ok Manual') ? 'ok' : effectiveRemedioStatus === 'preenchido' ? 'attention' : 'pending'} />
          </div>
        ) : (
          <span style={{ color: '#c0b8b0', display: 'flex', justifyContent: 'center', width: '100%' }}>—</span>
        )}

        {/* Pago */}
        {!isSimplified ? (() => {
          const ps = p.payment_status || 'em aberto';
          const col = ps === 'pago' ? '#5d9470' : ps === 'a pagar no local' ? '#8a7a58' : '#9a9288';
          const label = ps === 'pago' ? 'pago' : ps === 'a pagar no local' ? 'no local' : 'em aberto';
          return (
            <div
              style={{ ...s.paidCell, cursor: 'pointer', opacity: cellOpacity, color: col }}
              onClick={() => setPaymentModal({ contactId: p.contact_id, status: ps, method: p.payment_method || null })}
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
                if (ph && text) window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(`Oi ${firstName}! ${text}`)}`, '_blank');
              }
              toggleCheck(p.contact_id, 'preparacao_enviada', p.preparacao_enviada);
            }}
            title={p.preparacao_enviada ? 'Preparação enviada (clique para desmarcar)' : 'Enviar preparação por WhatsApp'}
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
                if (ph && text) window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(`Oi ${firstName}! ${text}`)}`, '_blank');
              }
              toggleCheck(p.contact_id, 'endereco_enviado', p.endereco_enviado);
            }}
            title={p.endereco_enviado ? 'Endereço enviado (clique para desmarcar)' : 'Enviar endereço por WhatsApp'}
          >
            <PinIcon active={p.endereco_enviado} />
          </div>
        ) : <span style={{ color: '#c0b8b0' }}>—</span>}

        {/* Ações: WhatsApp + Remover */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span
            title="Abrir chat no WhatsApp"
            onClick={() => { const ph = p.contacts?.phone?.replace(/\D/g, ''); if (ph) window.open(`https://wa.me/${ph}`, '_blank'); }}
            style={{ cursor: 'pointer', color: '#8a8278', opacity: 0.45, transition: 'opacity 0.15s', userSelect: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
          >
            <WaIcon />
          </span>
          <button
            style={s.removeBtn}
            onClick={() => removeParticipant(p.contact_id)}
            title="Remover viajante"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  const renderParticipantCard = (p, isSimplified) => {
    const hasRemedioAccess = p.status === 'intenção de ir' || p.status === 'Confirmado';
    const rowOpacity = p.status === 'desistiu' ? 0.4 : 1;
    const effectiveRemedioStatus = computeEffectiveRemedioStatus(p);
    const badgeText = computeVagaBadge(p);
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
            {!isSimplified && hasRemedioAccess && (
              <span onClick={() => setRemedioModal({ contactId: p.contact_id, contact: p.contacts })} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <PillIcon status={(effectiveRemedioStatus === 'Ok' || effectiveRemedioStatus === 'Ok Manual') ? 'ok' : effectiveRemedioStatus === 'preenchido' ? 'attention' : 'pending'} />
              </span>
            )}
            <span onClick={() => { const ph = p.contacts?.phone?.replace(/\D/g, ''); if (ph) window.open(`https://wa.me/${ph}`, '_blank'); }} style={{ cursor: 'pointer', color: '#8a8278', opacity: 0.5, display: 'inline-flex', alignItems: 'center' }}><WaIcon /></span>
            {(() => {
              const ps = p.payment_status || 'em aberto';
              return (
                <span
                  onClick={() => setPaymentModal({ contactId: p.contact_id, status: ps, method: p.payment_method || null })}
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
                  if (ph && text) window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(`Oi ${firstName}! ${text}`)}`, '_blank');
                }
                toggleCheck(p.contact_id, 'preparacao_enviada', p.preparacao_enviada);
              }}
              style={{ cursor: 'pointer', color: p.preparacao_enviada ? '#5d9470' : '#c0b8b0', display: 'inline-flex', alignItems: 'center' }}
              title={p.preparacao_enviada ? 'Preparação enviada' : 'Enviar preparação'}
            >
              <DocumentIcon active={p.preparacao_enviada} />
            </span>
            <span
              onClick={() => {
                if (!p.endereco_enviado) {
                  const firstName = (p.contacts?.nickname || p.contacts?.name || '').split(' ')[0];
                  const text = event.address || '';
                  const ph = p.contacts?.phone?.replace(/\D/g, '');
                  if (ph && text) window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(`Oi ${firstName}! ${text}`)}`, '_blank');
                }
                toggleCheck(p.contact_id, 'endereco_enviado', p.endereco_enviado);
              }}
              style={{ cursor: 'pointer', color: p.endereco_enviado ? '#5d9470' : '#c0b8b0', display: 'inline-flex', alignItems: 'center' }}
              title={p.endereco_enviado ? 'Endereço enviado' : 'Enviar endereço'}
            >
              <PinIcon active={p.endereco_enviado} />
            </span>
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
          {!isMobile && <a href="/" style={s.navLink}><PersonIcon /> Pessoas</a>}
          <a href="/events" style={{ ...s.navLink, ...s.navLinkActive }}>{isMobile ? <PlantIcon /> : <><PlantIcon /> Cerimônias</>}</a>
          {!isMobile && <a href="/settings/statuses" style={s.navLink}>◎ Status</a>}
          <button onClick={handleLogout} style={{ ...s.navLink, background: 'none', border: '0.5px dashed #5a5248', padding: '4px 10px', cursor: 'pointer' }}>sair</button>
        </div>
      </nav>

      <div style={{ ...s.content, padding: isMobile ? '1.2rem 1rem 3rem' : '2rem 2.5rem 4rem' }}>
        {/* Botão de voltar */}
        <button onClick={() => router.push('/events')} style={s.back}>
          ← voltar às cerimônias
        </button>

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
                      <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.total}</span>
                      <span style={{ color: '#b8b0a8' }}>total</span>
                      <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                      <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.reservados}</span>
                      <span style={{ color: '#b8b0a8' }}>reservado</span>
                      <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                      <span style={{ color: stats.confirmados > 0 ? '#3d6b52' : '#5a5048', fontWeight: 'bold' }}>{stats.confirmados}</span>
                      <span style={{ color: '#b8b0a8' }}>confirmado</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0, marginLeft: '0.75rem' }}>
                  {[
                    { title: 'Adicionar participante', onClick: () => setContactEditModal({ contactId: null, addingToEvent: true, nickname: '', nome_completo: '', phone: '' }), icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
                    { title: 'Copiar link da ficha médica', onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/ficha`); alert('Link da ficha copiado!'); }, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
                    { title: 'Copiar link de interesse', onClick: () => { const link = `${window.location.origin}/interesse/${event.id}`; const text = event.invite_message ? `${event.invite_message}\n\n${link}` : link; navigator.clipboard.writeText(text); alert('Link de interesse copiado!'); }, icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
                    { title: 'Pagamentos', onClick: () => setPaymentSummaryOpen(true), icon: <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>$</span> },
                  ].map((btn, i) => (
                    <button key={i} onClick={btn.onClick} title={btn.title} style={{ width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '0.5px dashed #b8b0a4', borderRadius: '2px', cursor: 'pointer', color: '#7a7268', padding: 0, flexShrink: 0 }}>
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '0.4rem' }}>
                {[{ label: 'D1', stats: day1Stats }, ...(event.date2 ? [{ label: 'D2', stats: day2Stats }] : [])].map(({ label, stats }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: '5px', fontFamily: "'Courier Prime', monospace", fontSize: '10px' }}>
                    <span style={{ color: '#7a6e66', letterSpacing: '0.08em', fontSize: '9px' }}>{label}</span>
                    <span style={{ color: '#d0c8c0' }}>—</span>
                    <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.total}</span>
                    <span style={{ color: '#b8b0a8' }}>total</span>
                    <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                    <span style={{ color: '#5a5048', fontWeight: 'bold' }}>{stats.reservados}</span>
                    <span style={{ color: '#b8b0a8' }}>reservado</span>
                    <span style={{ color: '#d0c8c0', margin: '0 1px' }}>·</span>
                    <span style={{ color: stats.confirmados > 0 ? '#3d6b52' : '#5a5048', fontWeight: 'bold' }}>{stats.confirmados}</span>
                    <span style={{ color: '#b8b0a8' }}>confirmado</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', flexShrink: 0 }}>
              {[
                { title: 'Adicionar participante', onClick: () => setContactEditModal({ contactId: null, addingToEvent: true, nickname: '', nome_completo: '', phone: '' }), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg> },
                { title: 'Copiar link da ficha médica', onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/ficha`); alert('Link da ficha copiado!'); }, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
                { title: 'Copiar link de interesse', onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/interesse/${event.id}`); alert('Link de interesse copiado!'); }, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
                { title: 'Pagamentos', onClick: () => setPaymentSummaryOpen(true), icon: <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>$</span> },
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
          <div style={{ display: 'flex', gap: '6px', marginTop: isMobile ? '1.4rem' : '0.5rem', marginBottom: '1.2rem', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginRight: '4px' }}>filtrar:</span>
            {[{ val: 'both', label: 'D1+D2' }, { val: 'day1', label: 'D1' }, { val: 'day2', label: 'D2' }].map(f => (
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
            <button style={{ ...s.btn, margin: '1rem auto' }} onClick={() => setContactEditModal({ contactId: null, addingToEvent: true, nickname: '', nome_completo: '', phone: '' })}>
              Adicionar Participantes
            </button>
          </div>
        ) : (
          <div>
            {/* GRUPO 1: VIAJANTES ATIVOS */}
            {(() => {
              const allActive = [...confirmados, ...intencao];
              const applyDayFilter = p => dayFilter === 'day1' ? p.date1_confirmed : dayFilter === 'day2' ? p.date2_confirmed : dayFilter === 'both' ? (p.date1_confirmed && p.date2_confirmed) : true;
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
                      <div style={{ textAlign: 'center' }}>prep</div>
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

            {/* GRUPO 2: CONTATOS INICIAIS & DESISTENTES */}
            <div style={{ marginTop: '2rem' }}>
              <div style={s.sectionHeader}>
                <div style={s.sectionTitle}>
                  📱 Contatos Iniciais & Desistentes ({iniciais.length})
                </div>
              </div>

              {iniciais.length === 0 ? (
                <div style={s.emptyNote}>Nenhum contato inicial ou desistente nesta cerimônia.</div>
              ) : (() => {
                const filtered = [...iniciais]
                  .filter(p => dayFilter === 'day1' ? p.date1_confirmed : dayFilter === 'day2' ? p.date2_confirmed : dayFilter === 'both' ? (p.date1_confirmed && p.date2_confirmed) : true)
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
                      <div style={{ textAlign: 'center' }}>prep</div>
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

      {remedioModal && (() => {
        const rp = participants.find(x => x.contact_id === remedioModal.contactId);
        if (!rp) return null;
        const rContact = rp.contacts;
        const rStatus = computeEffectiveRemedioStatus(rp);
        const rIsOk = rStatus === 'Ok' || rStatus === 'Ok Manual';
        const hasFicha = !!(rContact?.medical_form_data || rContact?.medical_form_step > 0);
        const btnBase = { width: '100%', padding: '10px 12px', background: 'transparent', border: '0.5px dashed #d0cbc2', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '11px', letterSpacing: '0.04em', color: '#3a3530', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' };
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
                <div style={{ fontSize: '10px', color: rIsOk ? '#5d9470' : '#c0392b', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PillIcon status={rIsOk ? 'ok' : rStatus === 'preenchido' ? 'attention' : 'pending'} />
                  {rStatus === 'Ok' ? 'Ficha preenchida' : rStatus === 'Ok Manual' ? 'Forçado OK' : rStatus === 'enviado' ? 'Link enviado — aguardando preenchimento' : 'Pendente de preenchimento'}
                </div>
              </div>

              {/* Ações */}
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {!rIsOk && (
                  <button
                    onClick={() => { updateRemedioStatus(remedioModal.contactId, 'Ok Manual'); setRemedioModal(null); }}
                    style={{ ...btnBase, color: '#5d9470', border: '0.5px solid #9dcfb4' }}
                  >
                    ✓ Forçar Ok Manual
                  </button>
                )}
                {rStatus === 'Ok Manual' && (
                  <button
                    onClick={() => { updateRemedioStatus(remedioModal.contactId, 'enviar'); setRemedioModal(null); }}
                    style={{ ...btnBase, color: '#c0392b' }}
                  >
                    ↩ Voltar para Pendente
                  </button>
                )}
                <button
                  onClick={() => {
                    const cleanPhone = rContact?.phone?.replace(/\D/g, '') || '';
                    if (!cleanPhone) { alert('Sem telefone cadastrado.'); return; }
                    const publicLink = `${window.location.origin}/ficha?id=${remedioModal.contactId}`;
                    const firstName = rContact?.name?.split(' ')[0] || '';
                    const message = `Oi, ${firstName}! Por favor, preenche algumas informações sobre remédios que você está tomando.\n\nAlguns remédios interferem na experiência, ou mesmo inviabilizam ela.\n\nLink seguro para preenchimento: ${publicLink}`;
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
                    <EyeIcon /> Ver ficha médica
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
        const canSave = paymentModal.status !== 'pago' || !!paymentModal.method;
        return (
          <div
            onClick={() => setPaymentModal(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '320px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace" }}>

              {/* Header */}
              <div style={{ padding: '1.2rem 1.5rem 0.9rem', borderBottom: '0.5px solid #d0cbc2' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>Registro de pagamento</div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#3a3530', lineHeight: 1.1 }}>
                  {p.contacts?.nickname || p.contacts?.name}
                </div>
                {paymentModal.status === 'pago' && paymentModal.method && (
                  <div style={{ fontSize: '10px', color: '#9a9288', marginTop: '0.25rem' }}>via {paymentModal.method}</div>
                )}
              </div>

              {/* Status */}
              <div style={{ padding: '1rem 1.5rem 0' }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Status</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[
                    { val: 'em aberto', icon: '◎', color: '#b0a898' },
                    { val: 'pago', icon: '◉', color: '#5d9470' },
                    { val: 'a pagar no local', icon: '◐', color: '#8a7a58' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setPaymentModal(prev => ({ ...prev, status: opt.val, method: opt.val !== 'pago' ? null : prev.method }))}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: paymentModal.status === opt.val ? '#faf7f0' : 'transparent', border: paymentModal.status === opt.val ? '0.5px solid #b8b0a4' : '0.5px dashed #d0cbc2', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '11px', letterSpacing: '0.04em', color: opt.color, textAlign: 'left', width: '100%' }}
                    >
                      <span style={{ fontSize: '14px' }}>{opt.icon}</span>
                      {opt.val}
                      {paymentModal.status === opt.val && <span style={{ marginLeft: 'auto', color: '#3a3530' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forma de pagamento — só quando "pago" */}
              {paymentModal.status === 'pago' && (
                <div style={{ padding: '1rem 1.5rem 0' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' }}>Forma de pagamento</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {['Câmbio', 'PIX', 'Wise', 'Espécie recebido'].map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentModal(prev => ({ ...prev, method: m }))}
                        style={{ padding: '6px 10px', background: paymentModal.method === m ? '#3a3530' : 'transparent', border: paymentModal.method === m ? '0.5px solid #3a3530' : '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.04em', color: paymentModal.method === m ? '#f7f4ee' : '#7a7268' }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: '1rem 1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
                {paymentModal.status !== 'pago' && event.payment_text && (
                  <button
                    onClick={() => {
                      const firstName = (p.contacts?.nickname || p.contacts?.name || '').split(' ')[0];
                      const ph = p.contacts?.phone?.replace(/\D/g, '');
                      if (!ph) { alert('Sem telefone cadastrado.'); return; }
                      window.open(`https://api.whatsapp.com/send?phone=${ph}&text=${encodeURIComponent(`Oi ${firstName}! ${event.payment_text}`)}`, '_blank');
                    }}
                    style={{ width: '100%', padding: '8px', background: 'transparent', color: '#5d9470', border: '0.5px solid #9dcfb4', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <WaIcon /> cobrar via whatsapp
                  </button>
                )}
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    onClick={() => { if (!canSave) return; updatePayment(paymentModal.contactId, paymentModal.status, paymentModal.method); setPaymentModal(null); }}
                    disabled={!canSave}
                    style={{ flex: 1, padding: '8px', background: canSave ? '#3a3530' : '#d0cbc2', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                  >
                    salvar
                  </button>
                  <button
                    onClick={() => setPaymentModal(null)}
                    style={{ padding: '8px 14px', background: 'transparent', color: '#9a9288', border: '0.5px dashed #c8c2b8', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                  >
                    cancelar
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Tela de Resumo de Pagamentos */}
      {paymentSummaryOpen && (() => {
        const active = participants.filter(p => p.status !== 'desistiu');
        const groups = [
          { key: 'em aberto', label: 'Em aberto', icon: '◎', color: '#b0a898' },
          { key: 'a pagar no local', label: 'A pagar no local', icon: '◐', color: '#8a7a58' },
          { key: 'pago', label: 'Pago', icon: '◉', color: '#5d9470' },
        ];
        const totalPago = active.filter(p => p.payment_status === 'pago').length;
        const totalNoLocal = active.filter(p => p.payment_status === 'a pagar no local').length;
        const totalAberto = active.filter(p => !p.payment_status || p.payment_status === 'em aberto').length;
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
                  <span style={{ color: '#8a7a58' }}>◐ {totalNoLocal}</span>
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
                const group = active.filter(p => (p.payment_status || 'em aberto') === key);
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
                      group.map(p => (
                        <div
                          key={p.contact_id}
                          onClick={() => setPaymentModal({ contactId: p.contact_id, status: p.payment_status || 'em aberto', method: p.payment_method || null })}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', marginBottom: '4px', background: '#fdfbf7', border: '0.5px solid #d0cbc2', borderRadius: '2px', cursor: 'pointer' }}
                        >
                          <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530' }}>
                            {p.contacts?.nickname || p.contacts?.name}
                          </span>
                          {key === 'pago' && p.payment_method && (
                            <span style={{ fontSize: '9px', color: '#9a9288', letterSpacing: '0.06em' }}>via {p.payment_method}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

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
              {[
                { field: 'nickname', label: 'Nome' },
                { field: 'nome_completo', label: 'Nome Completo (documentos)' },
                { field: 'phone', label: 'Telefone (WhatsApp)' },
              ].map(({ field, label }) => (
                <div key={field} style={{ position: 'relative' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.3rem' }}>{label}</div>
                  <input
                    type="text"
                    value={contactEditModal[field]}
                    onChange={e => setContactEditModal(prev => ({
                      ...prev,
                      [field]: e.target.value,
                      ...(field === 'nickname' ? { contactId: null } : {}),
                    }))}
                    style={{ width: '100%', padding: '7px 10px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', boxSizing: 'border-box', outline: 'none' }}
                  />
                  {field === 'nickname' && !contactEditModal.contactId && contactEditModal.nickname.length >= 2 && (() => {
                    const q = contactEditModal.nickname.toLowerCase();
                    const matches = allContacts.filter(c =>
                      (c.nickname || c.name || '').toLowerCase().includes(q)
                    ).slice(0, 8);
                    if (matches.length === 0) return null;
                    return (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fdfbf7', border: '0.5px solid #c8c2b8', borderTop: 'none', borderRadius: '0 0 2px 2px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 200 }}>
                        {matches.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setContactEditModal(prev => ({
                              ...prev,
                              contactId: c.id,
                              nickname: c.nickname || c.name || '',
                              nome_completo: c.nome_completo || '',
                              phone: c.phone || '',
                            }))}
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
              ))}
            </div>
            <div style={{ padding: '0.5rem 1.5rem 1.2rem', display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={saveContact}
                style={{ flex: 1, padding: '8px', background: '#3a3530', color: '#f7f4ee', border: 'none', borderRadius: '2px', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                salvar
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

        const attentionItems = [];
        if (hasMfd) {
          if (mfd.sec2_leitura_nao_li) attentionItems.push({ label: 'Documento de Preparação', text: 'Comprometido a ler antes da cerimônia (ainda não havia lido)' });
          if (mfd.sec3_historico_nao_informado || mfd.sec3_historico_obs) attentionItems.push({ label: 'Histórico Psiquiátrico', text: mfd.sec3_historico_obs || 'Informou ter histórico adicional (sem detalhes no campo)' });
          if (mfd.sec4_obs) attentionItems.push({ label: 'Saúde Física', text: mfd.sec4_obs });
          if (mfd.sec5_experiencias_recentes || mfd.sec5_psicoativas_obs) attentionItems.push({ label: 'Uso Recente de Substâncias', text: mfd.sec5_psicoativas_obs || 'Declarou uso recente de substâncias psicoativas' });
          if (mfd.sec6_duvidas) attentionItems.push({ label: 'Dúvidas com a Equipe', text: 'Viajante declarou ter dúvidas a tirar com a equipe' });
        }

        const sectionLabel = { fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.5rem' };

        return (
          <div onClick={() => setActiveFichaContact(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#3a3530', display: 'flex', flexDirection: 'column' }}>

              {/* Header fixo */}
              <div style={{ padding: '1.5rem 2rem 1rem', borderBottom: '0.5px solid #d0cbc2', position: 'sticky', top: 0, background: '#fdfbf7', zIndex: 1 }}>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '11px', letterSpacing: '0.08em', color: '#aaa49c', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Ficha Médica</div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '26px', fontWeight: 400, color: '#3a3530', lineHeight: 1.1 }}>{activeFichaContact.name}</div>
              </div>

              {/* Corpo com scroll */}
              <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.4rem', overflowY: 'auto' }}>

                {/* Progresso */}
                <div>
                  <div style={sectionLabel}>Progresso do Preenchimento</div>
                  <div style={{ padding: '0.7rem 0.9rem', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px' }}>
                    {activeFichaContact.medical_form_step >= 6 ? (
                      <span style={{ color: '#5d9470', fontWeight: 'bold' }}>✓ 100% Concluído e Assinado</span>
                    ) : activeFichaContact.medical_form_step > 0 ? (
                      <span style={{ color: '#8a7a58', fontWeight: 'bold' }}>⏳ Incompleto — parou no passo {activeFichaContact.medical_form_step} de 6</span>
                    ) : (
                      <span style={{ color: '#9a9288', fontWeight: 'bold' }}>✕ Não iniciou o preenchimento</span>
                    )}
                  </div>
                </div>

                {/* Remédios */}
                <div>
                  <div style={sectionLabel}>Remédios Informados</div>
                  {activeFichaContact.remedio === 'não informado' ? (
                    <div style={{ padding: '0.6rem 0.9rem', background: '#fff9e6', border: '0.5px solid #ffeeba', borderRadius: '2px', color: '#856404', fontStyle: 'italic' }}>
                      ⚠️ Ficha médica ainda não foi preenchida.
                    </div>
                  ) : activeFichaContact.medications_list?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {activeFichaContact.medications_list.map((med, idx) => (
                        <div key={idx} style={{ padding: '0.5rem 0.8rem', background: '#faf7f0', borderRadius: '2px', borderLeft: '3px solid #7a7268' }}>
                          <div style={{ fontWeight: 'bold' }}>{med.name}</div>
                          {(med.dosage || med.frequency) && (
                            <div style={{ fontSize: '9px', color: '#9a9288', marginTop: '0.2rem' }}>
                              {med.dosage || ''}{med.dosage && med.frequency ? ' · ' : ''}{med.frequency || ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '0.6rem 0.9rem', background: '#faf7f0', borderRadius: '2px', borderLeft: '3px solid #7a7268', color: '#5a605c' }}>
                      Nenhum remédio de uso contínuo (declarou não tomar).
                    </div>
                  )}
                </div>

                {/* Ítens em Atenção */}
                {attentionItems.length > 0 && (
                  <div>
                    <div style={{ ...sectionLabel, color: '#a07030' }}>Ítens em Atenção</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {attentionItems.map((item, idx) => (
                        <div key={idx} style={{ padding: '0.6rem 0.9rem', background: '#fffbf0', border: '0.5px solid #e8d090', borderRadius: '2px', borderLeft: '3px solid #c89030' }}>
                          <div style={{ fontWeight: 'bold', color: '#7a5820', marginBottom: '0.2rem', fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.label}</div>
                          <div style={{ color: '#5a4010', lineHeight: 1.5 }}>{item.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {activeFichaContact.observations && (
                  <div>
                    <div style={sectionLabel}>Observações / Terapias Alternativas</div>
                    <p style={{ margin: 0, color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.6, padding: '0.6rem 0.9rem', background: '#faf7f0', border: '0.5px dashed #c8c2b8', borderRadius: '2px' }}>
                      {activeFichaContact.observations}
                    </p>
                  </div>
                )}

                {/* Declarações */}
                {hasMfd && (
                  <div>
                    <div style={sectionLabel}>Declarações Respondidas</div>
                    <div style={{ border: '0.5px dashed #c8c2b8', borderRadius: '2px', padding: '0.8rem', background: '#fff', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                      <div style={{ fontSize: '10px' }}>
                        <div style={{ fontWeight: 'bold', color: '#7a7268', borderBottom: '0.5px solid #eee', paddingBottom: '0.2rem', marginBottom: '0.3rem' }}>Declaração Inicial</div>
                        <div>• Maioridade/Capacidade: {mfd.sec2_maioridade ? 'Sim ✓' : 'Não ✕'}</div>
                        <div>• Participação Voluntária: {mfd.sec2_voluntaria ? 'Sim ✓' : 'Não ✕'}</div>
                        <div>• Doc. Preparação: {mfd.sec2_leitura ? 'Lido ✓' : mfd.sec2_leitura_nao_li ? 'Comprometido a ler ⚠️' : 'Não ✕'}</div>
                      </div>

                      <div style={{ fontSize: '10px' }}>
                        <div style={{ fontWeight: 'bold', color: '#7a7268', borderBottom: '0.5px solid #eee', paddingBottom: '0.2rem', marginBottom: '0.3rem' }}>Saúde Mental</div>
                        <div>• Esquizofrenia/Psicose/Bipolaridade: {mfd.sec3_esquizofrenia ? 'Ausente ✓' : 'Ausência não confirmada ✕'}</div>
                        <div>• Histórico Familiar Psicose: {mfd.sec3_psicose_familiar ? 'Ausente ✓' : 'Ausência não confirmada ✕'}</div>
                        <div>• Ideação Suicida: {mfd.sec3_ideacao ? 'Ausente ✓' : 'Ausência não confirmada ✕'}</div>
                      </div>

                      <div style={{ fontSize: '10px' }}>
                        <div style={{ fontWeight: 'bold', color: '#7a7268', borderBottom: '0.5px solid #eee', paddingBottom: '0.2rem', marginBottom: '0.3rem' }}>Saúde Física</div>
                        <div>• Doenças Cardiovasculares: {mfd.sec4_cardio ? 'Ausente ✓' : 'Ausência não confirmada ✕'}</div>
                        <div>• Distúrbios Neurológicos: {mfd.sec4_neuro ? 'Ausente ✓' : 'Ausência não confirmada ✕'}</div>
                      </div>

                      <div style={{ fontSize: '10px' }}>
                        <div style={{ fontWeight: 'bold', color: '#7a7268', borderBottom: '0.5px solid #eee', paddingBottom: '0.2rem', marginBottom: '0.3rem' }}>Substâncias & Acordos</div>
                        <div>• Comprometido a informar tudo: {mfd.sec5_compromisso_informar ? 'Sim ✓' : 'Não ✕'}</div>
                        <div>• Uso Recente Psicodélicos: {mfd.sec5_experiencias_recentes ? 'Sim ⚠️' : 'Não ✓'}</div>
                        <div>• Acordo Abstinência 72h: {mfd.sec5_abstinencia ? 'Sim ✓' : 'Não ✕'}</div>
                      </div>

                      <div style={{ fontSize: '10px' }}>
                        <div style={{ fontWeight: 'bold', color: '#7a7268', borderBottom: '0.5px solid #eee', paddingBottom: '0.2rem', marginBottom: '0.3rem' }}>Assinatura</div>
                        <div>• <span style={{ fontFamily: "'Caveat', cursive", fontSize: '15px' }}>{mfd.assinatura || 'Não assinada'}</span></div>
                        {mfd.sec6_duvidas && <div style={{ color: '#d35400', fontWeight: 'bold', marginTop: '0.2rem' }}>⚠️ Tem dúvidas a tirar com a equipe</div>}
                      </div>

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
                    const firstName = activeFichaContact.name?.split(' ')[0] || '';
                    const message = `Oi, ${firstName}! Por favor, preenche algumas informações sobre remédios que você está tomando.\n\nAlguns remédios interferem na experiência, ou mesmo inviabilizam ela.\n\nLink seguro para preenchimento: ${publicLink}`;
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
