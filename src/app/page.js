'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const ddiOptions = [
  { code: '+55', name: '🇧🇷 Brasil' },
  { code: '+1',  name: '🇺🇸 EUA/Canadá' },
  { code: '+351', name: '🇵🇹 Portugal' },
  { code: '+34', name: '🇪🇸 Espanha' },
  { code: '+44', name: '🇬🇧 Reino Unido' },
  { code: '+54', name: '🇦🇷 Argentina' },
  { code: '+56', name: '🇨🇱 Chile' },
  { code: '+598', name: '🇺🇾 Uruguai' },
  { code: '+57', name: '🇨🇴 Colômbia' },
  { code: '+52', name: '🇲🇽 México' },
  { code: '+39', name: '🇮🇹 Itália' },
  { code: '+49', name: '🇩🇪 Alemanha' },
];

function exportMedicalRecordPDF(rec, contact) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) { alert('Permita pop-ups para exportar o PDF.'); return; }

  const mfd = rec.medical_form_data || {};
  const meds = rec.medications_list || [];
  const displayName = contact.nickname || contact.name || 'Viajante';
  const fichaDate = new Date(rec.created_at).toLocaleDateString('pt-BR');

  const medsHTML = meds.length > 0
    ? meds.map(m => `<div class="med-card"><div class="med-name">💊 ${m.name}</div>${(m.dosage || m.frequency) ? `<div class="med-desc">Dosagem: ${m.dosage || '—'} | Frequência: ${m.frequency || '—'}</div>` : ''}</div>`).join('')
    : `<p class="no-info">Nenhum remédio de uso contínuo informado.</p>`;

  const obsLines = [
    mfd.sec4_obs && `Saúde física: ${mfd.sec4_obs}`,
    mfd.sec3_historico_obs && `Histórico psiquiátrico: ${mfd.sec3_historico_obs}`,
    mfd.sec5_psicoativas_obs && `Substâncias recentes: ${mfd.sec5_psicoativas_obs}`,
  ].filter(Boolean);
  const obsHTML = obsLines.length > 0
    ? `<div class="observations">${obsLines.join('\n')}</div>`
    : `<p class="no-info">Nenhuma observação declarada.</p>`;

  printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Ficha Médica - ${displayName}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;600&display=swap');
      body { font-family: 'Lora', Georgia, serif; color: #2b2b2b; line-height: 1.6; padding: 3rem; max-width: 800px; margin: 0 auto; }
      .header { text-align: center; border-bottom: 2px double #8b7e66; padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
      .header h1 { font-family: 'Cinzel', serif; font-size: 1.8rem; color: #2d4a3e; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
      .header p { font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #666; margin: 0.5rem 0 0; text-transform: uppercase; letter-spacing: 1px; }
      .section-title { font-family: 'Montserrat', sans-serif; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #2d4a3e; border-bottom: 1px solid #d4cbb8; padding-bottom: 0.4rem; margin-top: 2rem; margin-bottom: 1.5rem; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; font-size: 0.95rem; }
      .info-item strong { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; text-transform: uppercase; color: #555; display: block; margin-bottom: 0.2rem; }
      .med-card { padding: 0.8rem 1.2rem; background: #faf9f6; border-left: 3px solid #2d4a3e; border: 1px solid #e8e2d5; border-left-width: 3px; border-radius: 6px; margin-bottom: 0.8rem; }
      .med-name { font-weight: bold; color: #1a1a1a; }
      .med-desc { font-size: 0.8rem; color: #555; font-style: italic; margin-top: 0.2rem; }
      .observations { font-style: italic; color: #444; white-space: pre-wrap; background: #faf9f6; padding: 1rem 1.5rem; border: 1px dashed #d4cbb8; border-radius: 6px; margin-top: 0.5rem; font-size: 0.9rem; }
      .no-info { color: #888; font-style: italic; font-size: 0.9rem; }
      .decl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem; }
      .decl-item { padding: 0.4rem 0.6rem; background: #faf9f6; border-radius: 4px; }
      .signature-area { margin-top: 4rem; text-align: center; border-top: 1px solid #d4cbb8; padding-top: 1.5rem; }
      .signature-text { font-family: 'Lora', serif; font-size: 1.15rem; font-style: italic; color: #1a1a1a; }
      .signature-date { font-family: 'Montserrat', sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #666; margin-top: 0.3rem; }
    </style></head><body>
    <div class="header"><h1>Ficha Médica</h1><p>Journey · Confidencial · ${fichaDate}</p></div>
    <div class="section-title">Identificação</div>
    <div class="info-grid">
      <div class="info-item"><strong>Viajante</strong>${displayName}</div>
      <div class="info-item"><strong>Nome Completo</strong>${contact.nome_completo || mfd.nome_completo || '—'}</div>
      <div class="info-item"><strong>Telefone</strong>${contact.phone || '—'}</div>
      <div class="info-item"><strong>Remédios</strong>${rec.remedio === 'não' ? '✅ Sem remédios' : '⚠ Usa remédios'}</div>
    </div>
    <div class="section-title">Medicamentos de Uso Contínuo</div>${medsHTML}
    <div class="section-title">Observações e Saúde</div>${obsHTML}
    <div class="section-title">Declarações</div>
    <div class="decl-grid">
      <div class="decl-item">Maioridade: ${mfd.sec2_maioridade ? '✓' : '✕'}</div>
      <div class="decl-item">Voluntária: ${mfd.sec2_voluntaria ? '✓' : '✕'}</div>
      <div class="decl-item">Doc. preparação: ${mfd.sec2_leitura ? 'Lido ✓' : mfd.sec2_leitura_nao_li ? 'A ler ⚠' : '✕'}</div>
      <div class="decl-item">Sem psicose/esquizofrenia: ${mfd.sec3_esquizofrenia ? '✓' : '✕'}</div>
      <div class="decl-item">Sem ideação suicida: ${mfd.sec3_ideacao ? '✓' : '✕'}</div>
      <div class="decl-item">Uso recente psicodélicos: ${mfd.sec5_experiencias_recentes ? 'Sim ⚠' : 'Não ✓'}</div>
      <div class="decl-item">Abstinência 72h: ${mfd.sec5_abstinencia ? '✓' : '✕'}</div>
      <div class="decl-item">Dúvidas com equipe: ${mfd.sec6_duvidas ? 'Sim ⚠' : 'Não ✓'}</div>
    </div>
    <div class="signature-area">
      <div class="signature-text">Assinado eletronicamente por ${mfd.assinatura || displayName}</div>
      <div class="signature-date">Preenchido em ${fichaDate}</div>
    </div>
    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); }</script>
    </body></html>`);
  printWindow.document.close();
}

export default function Home() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [formData, setFormData] = useState({ nickname: '', nome_completo: '', });
  const [countryCode, setCountryCode] = useState('+55');
  const [phoneBody, setPhoneBody] = useState('');
  const [originalPhoneState, setOriginalPhoneState] = useState({ body: '', code: '+55' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [participationsMap, setParticipationsMap] = useState({});
  const [manualDatesMap, setManualDatesMap] = useState({});
  const [allEvents, setAllEvents] = useState([]);
  const [addingCeremonyFor, setAddingCeremonyFor] = useState(null);
  const [pendingCeremony, setPendingCeremony] = useState(null);
  const [pendingDays, setPendingDays] = useState(new Set());
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { checkUser(); }, []);

  useEffect(() => {
    if (editingContact) {
      supabase
        .from('medical_records')
        .select('*')
        .eq('contact_id', editingContact.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setMedicalRecords(data || []));
    } else {
      setMedicalRecords([]);
    }
  }, [editingContact]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); }
    else { setUser(user); fetchData(); }
  }

  async function fetchData() {
    setLoading(true);
    const [
      { data: contactsData },
      { data: parts },
      { data: manuals },
      { data: eventsData },
    ] = await Promise.all([
      supabase.from('contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('event_participants').select('contact_id, event_id, date1_confirmed, date2_confirmed, date3_confirmed, status, events(id, name, date, date2, date3, linked_event_id, disable_auto_pair)').neq('status', 'desistiu'),
      supabase.from('contact_manual_dates').select('id, contact_id, event_id, date'),
      supabase.from('events').select('id, name, date, date2, date3').order('date', { ascending: true }),
    ]);
    if (contactsData) setContacts(contactsData);
    if (eventsData) setAllEvents(eventsData);

    // Group event_participants by contact → groups of dates per ceremony
    const pMap = {};
    (parts || []).forEach(p => {
      if (!pMap[p.contact_id]) pMap[p.contact_id] = [];
      const ev = p.events;
      if (ev) {
        const dates = [];
        if (p.date1_confirmed && ev.date) dates.push(ev.date);
        if (p.date2_confirmed && ev.date2) dates.push(ev.date2);
        if (p.date3_confirmed && ev.date3) dates.push(ev.date3);
        if (dates.length > 0) {
          pMap[p.contact_id].push({ eventId: p.event_id, linkedEventId: ev.linked_event_id, disableAutoPair: ev.disable_auto_pair, dates: dates.sort(), source: 'event' });
        }
      }
    });

    // Merge paired ceremonies (linked_event_id) into a single group
    Object.keys(pMap).forEach(contactId => {
      const groups = pMap[contactId];
      const merged = [];
      const used = new Set();
      groups.forEach((g, i) => {
        if (used.has(i)) return;
        const pairIdx = groups.findIndex((g2, j) => {
          if (j === i || used.has(j)) return false;
          if (g.linkedEventId && (g.linkedEventId === g2.eventId || g2.linkedEventId === g.eventId)) return true;
          if (!g.disableAutoPair && !g2.disableAutoPair && g.dates[0] && g2.dates[0]) {
            const diff = Math.abs(new Date(g.dates[0]) - new Date(g2.dates[0]));
            if (diff <= 29 * 24 * 60 * 60 * 1000) return true;
          }
          return false;
        });
        if (pairIdx !== -1) {
          used.add(i);
          used.add(pairIdx);
          const pair = groups[pairIdx];
          merged.push({ key: `ev-${g.eventId}-${pair.eventId}`, dates: [...g.dates, ...pair.dates].sort(), source: 'event', eventId: g.eventId });
        } else {
          used.add(i);
          merged.push({ ...g, key: `ev-${g.eventId}` });
        }
      });
      pMap[contactId] = merged;
    });

    setParticipationsMap(pMap);

    // Group manual dates by contact → group by event_id
    const mMap = {};
    (manuals || []).forEach(m => {
      if (!mMap[m.contact_id]) mMap[m.contact_id] = [];
      mMap[m.contact_id].push({ id: m.id, event_id: m.event_id, date: m.date });
    });
    setManualDatesMap(mMap);

    setLoading(false);
  }

  function getGroupedDates(contactId) {
    // From event_participants: already one group per ceremony (pairs merged in pMap)
    const fromEvents = (participationsMap[contactId] || []).map(g => ({
      key: g.key || `ev-${g.eventId}`,
      dates: g.dates,
      source: 'event',
      eventId: g.eventId,
    }));

    // From manual dates: group by event_id
    const manuals = manualDatesMap[contactId] || [];
    const manualByEvent = {};
    manuals.forEach(m => {
      const key = m.event_id || `solo-${m.id}`;
      if (!manualByEvent[key]) manualByEvent[key] = { key: `man-${key}`, dates: [], ids: [], source: 'manual', eventId: m.event_id };
      manualByEvent[key].dates.push(m.date);
      manualByEvent[key].ids.push(m.id);
    });
    const manualGroups = Object.values(manualByEvent).map(g => ({ ...g, dates: g.dates.sort() }));

    // Auto-merge manual groups within 29 days (same rule as event list)
    const mergedManual = [];
    const usedManual = new Set();
    manualGroups.forEach((g, i) => {
      if (usedManual.has(i)) return;
      const pairIdx = manualGroups.findIndex((g2, j) => {
        if (j === i || usedManual.has(j)) return false;
        if (g.dates[0] && g2.dates[0]) {
          return Math.abs(new Date(g.dates[0]) - new Date(g2.dates[0])) <= 29 * 24 * 60 * 60 * 1000;
        }
        return false;
      });
      if (pairIdx !== -1) {
        usedManual.add(i);
        usedManual.add(pairIdx);
        const pair = manualGroups[pairIdx];
        mergedManual.push({
          key: `${g.key}-${pair.key}`,
          dates: [...g.dates, ...pair.dates].sort(),
          source: 'manual',
          eventId: null,
          ids: [...g.ids, ...pair.ids],
        });
      } else {
        usedManual.add(i);
        mergedManual.push(g);
      }
    });

    const all = [...fromEvents, ...mergedManual];
    all.sort((a, b) => (a.dates[0] || '').localeCompare(b.dates[0] || ''));
    return all;
  }

  function fmtDateBadge(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  // Returns event_ids already registered (manually) for a contact
  function getManualEventIds(contactId) {
    return new Set((manualDatesMap[contactId] || []).map(m => m.event_id).filter(Boolean));
  }

  async function addManualCeremony(contactId, event, dates) {
    const rows = dates.map(date => ({ contact_id: contactId, event_id: event.id, date }));
    const { data, error } = await supabase.from('contact_manual_dates').insert(rows).select('id, event_id, date');
    if (error) { alert('Erro: ' + error.message); return; }
    setManualDatesMap(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), ...(data || [])],
    }));
    setAddingCeremonyFor(null);
    setPendingCeremony(null);
    setPendingDays(new Set());
  }

  async function removeManualGroup(contactId, eventId, ids) {
    if (!confirm('Remover esta cerimônia do histórico?')) return;
    let query = supabase.from('contact_manual_dates').delete();
    if (eventId) {
      query = query.eq('contact_id', contactId).eq('event_id', eventId);
    } else {
      query = query.in('id', ids);
    }
    const { error } = await query;
    if (!error) {
      setManualDatesMap(prev => ({
        ...prev,
        [contactId]: (prev[contactId] || []).filter(m =>
          eventId ? m.event_id !== eventId : !ids.includes(m.id)
        ),
      }));
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const combinedPhone = phoneBody ? `${countryCode}${phoneBody.replace(/\D/g, '')}` : '';

    if (combinedPhone) {
      const cleanNew = combinedPhone.replace(/\D/g, '');
      const phoneChanged = editingContact
        ? (phoneBody !== originalPhoneState.body || countryCode !== originalPhoneState.code)
        : true;
      if (phoneChanged) {
        const dup = contacts.find(c => {
          const cClean = (c.phone || '').replace(/\D/g, '');
          return cClean && cClean === cleanNew && c.id !== editingContact?.id;
        });
        if (dup) { alert(`Este número já está cadastrado para "${dup.nickname || dup.name}".`); return; }
      }
    }

    const dataToSave = {
      name: formData.nickname,
      nickname: formData.nickname,
      nome_completo: formData.nome_completo || '',
      phone: combinedPhone,
    };

    if (editingContact) {
      const { error } = await supabase.from('contacts').update(dataToSave).eq('id', editingContact.id);
      if (error) { alert('Erro: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('contacts').insert([dataToSave]);
      if (error) { alert('Erro: ' + error.message); return; }
    }
    setIsModalOpen(false);
    resetForm();
    fetchData();
  }

  function resetForm() {
    setEditingContact(null);
    setFormData({ nickname: '', nome_completo: '' });
    setCountryCode('+55');
    setPhoneBody('');
  }

  function handleOpenContact(contact) {
    setEditingContact(contact);
    setFormData({
      nickname: contact.nickname || contact.name || '',
      nome_completo: contact.nome_completo || '',
    });
    const phoneVal = contact.phone || '';
    let foundDdi = '+55', foundBody = phoneVal;
    const sorted = [...ddiOptions].sort((a, b) => b.code.length - a.code.length);
    for (const opt of sorted) {
      if (phoneVal.startsWith(opt.code)) { foundDdi = opt.code; foundBody = phoneVal.slice(opt.code.length); break; }
    }
    setCountryCode(foundDdi);
    setPhoneBody(foundBody);
    setOriginalPhoneState({ body: foundBody, code: foundDdi });
    setIsModalOpen(true);
  }

  async function handleDelete(contact) {
    if (!confirm(`Excluir "${contact.nickname || contact.name}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from('contacts').delete().eq('id', contact.id);
    if (error) { alert('Erro ao excluir: ' + error.message); }
    else setContacts(prev => prev.filter(c => c.id !== contact.id));
  }

  const openWhatsApp = (phone) => window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');

  const filteredContacts = contacts.filter(c =>
    (c.nickname || c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return <div style={{ textAlign: 'center', padding: '5rem', fontFamily: "'Courier Prime', monospace", color: '#aaa49c' }}>Verificando acesso...</div>;

  const s = {
    page: { minHeight: '100vh', background: '#f7f4ee', fontFamily: "'Courier Prime', monospace", color: '#3a3530' },
    nav: { position: 'sticky', top: 0, zIndex: 100, background: '#1a1714', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    navBrand: { fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#f7f4ee', fontWeight: 400, textDecoration: 'none' },
    navLink: { fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0a898', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' },
    navLinkActive: { color: '#f7f4ee', borderBottom: '0.5px solid #4a7a5a', paddingBottom: '2px' },
    content: { padding: '2rem 2.5rem 4rem', maxWidth: '900px', margin: '0 auto' },
    label: { fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c' },
    fieldInput: { width: '100%', fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#3a3530', background: '#fdfbf7', border: '0.5px solid #c8c2b8', borderRadius: '2px', padding: '8px 10px', outline: 'none', boxSizing: 'border-box' },
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.navBrand}>Journey<span style={{ color: '#4a7a5a' }}>.</span></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
          <a href="/" style={{ ...s.navLink, ...s.navLinkActive }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>
            {!isMobile && ' Pessoas'}
          </a>
          <a href="/events" style={s.navLink}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V10"/><path d="M12 10C10 6 6 4 3 5c0 5 4 8 9 5Z"/><path d="M12 14c2-4 6-6 9-5c0 5-4 8-9 5Z"/></svg>
            {!isMobile && ' Cerimônias'}
          </a>
          <a href="/pagamentos" style={s.navLink}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2M12 16v2M9.5 9.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2.5-5 2.5-5 5s.9 2 2.5 2 2.5-.9 2.5-2"/></svg>
            {!isMobile && ' Pagamentos'}
          </a>
          <a href="/diario" style={s.navLink}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            {!isMobile && ' Diário'}
          </a>

          <a href="/settings/users" style={{ ...s.navLink, color: '#6a6258' }} title="Gestão de usuários">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </a>
          <button onClick={handleLogout} style={{ ...s.navLink, background: 'none', border: '0.5px dashed #5a5248', padding: '4px 10px', cursor: 'pointer' }}>sair</button>
        </div>
      </nav>

      <div style={s.content}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.2rem', borderBottom: '0.5px solid #d0cbc2' }}>
          <div>
            <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: '36px', fontWeight: 400, color: '#3a3530', margin: 0 }}>Pessoas</h1>
            <div style={{ fontSize: '10px', color: '#aaa49c', letterSpacing: '0.08em', marginTop: '4px' }}>{contacts.length} contatos na base</div>
          </div>
          <button onClick={() => setIsModalOpen(true)} style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f7f4ee', background: '#3a3530', border: 'none', borderRadius: '2px', padding: '8px 16px', cursor: 'pointer' }}>
            + novo
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <input type="text" placeholder="buscar por nome..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ ...s.fieldInput, width: '280px' }} />
        </div>

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#aaa49c', fontSize: '12px', letterSpacing: '0.08em' }}>carregando...</div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 90px' : '220px 1fr 90px', gap: '1rem', padding: '0 0 0.6rem', borderBottom: '0.5px solid #3a3530' }}>
              <div style={s.label}>participante</div>
              {!isMobile && <div style={s.label}>cerimônias</div>}
              <div style={{ ...s.label, textAlign: 'right' }}>ações</div>
            </div>

            {filteredContacts.map((contact) => {
              const groups = getGroupedDates(contact.id);
              const isAdding = addingCeremonyFor === contact.id;
              const manualEventIds = getManualEventIds(contact.id);
              const eventParticipantEventIds = new Set((participationsMap[contact.id] || []).map(g => g.eventId));
              // Events the contact isn't already registered in (neither via event_participants nor manual)
              const availableEvents = allEvents.filter(ev =>
                !eventParticipantEventIds.has(ev.id) && !manualEventIds.has(ev.id)
              );
              const datesBadges = (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'flex-start' }}>
                  {groups.map(group => (
                    <div
                      key={group.key}
                      onClick={group.source === 'manual' ? () => removeManualGroup(contact.id, group.eventId, group.ids) : undefined}
                      title={group.source === 'manual' ? 'Lançado manualmente — clique para remover' : 'Cerimônia confirmada no sistema'}
                      style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: group.source === 'manual' ? 'pointer' : 'default' }}
                    >
                      {group.dates.map(date => (
                        <span
                          key={date}
                          style={{
                            fontFamily: "'Courier Prime', monospace",
                            fontSize: '9px',
                            color: group.source === 'manual' ? '#8a7a58' : '#4a7a5a',
                            border: `0.5px solid ${group.source === 'manual' ? '#c8b888' : '#9dcfb4'}`,
                            borderRadius: '2px',
                            padding: '2px 5px',
                            background: group.source === 'manual' ? '#faf7f0' : '#eef7f2',
                            userSelect: 'none',
                          }}
                        >
                          {fmtDateBadge(date)}
                        </span>
                      ))}
                    </div>
                  ))}
                  {isAdding && !pendingCeremony && (
                    <select
                      autoFocus
                      defaultValue=""
                      onChange={e => {
                        const ev = allEvents.find(x => x.id === e.target.value);
                        if (ev) {
                          setPendingCeremony(ev);
                          setPendingDays(new Set([ev.date, ev.date2, ev.date3].filter(Boolean)));
                        }
                      }}
                      onBlur={() => setAddingCeremonyFor(null)}
                      style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#3a3530', border: '0.5px solid #b8b0a4', borderRadius: '2px', padding: '2px 4px', background: '#fdfbf7', outline: 'none', maxWidth: '160px' }}
                    >
                      <option value="" disabled>← escolher cerimônia</option>
                      {availableEvents.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name} · {fmtDateBadge(ev.date)}
                        </option>
                      ))}
                    </select>
                  )}
                  {isAdding && pendingCeremony && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: '#faf9f6', border: '0.5px solid #c8c2b8', borderRadius: '2px', padding: '6px 8px' }}>
                      <div style={{ fontSize: '9px', color: '#7a7268', letterSpacing: '0.06em' }}>{pendingCeremony.name}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {[pendingCeremony.date, pendingCeremony.date2, pendingCeremony.date3].filter(Boolean).map(date => (
                          <label key={date} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '9px', cursor: 'pointer', color: '#3a3530', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={pendingDays.has(date)}
                              onChange={() => setPendingDays(prev => {
                                const next = new Set(prev);
                                if (next.has(date)) next.delete(date); else next.add(date);
                                return next;
                              })}
                              style={{ width: '10px', height: '10px', margin: 0, accentColor: '#4a7a5a', cursor: 'pointer' }}
                            />
                            {fmtDateBadge(date)}
                          </label>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '1px' }}>
                        <button
                          onClick={() => addManualCeremony(contact.id, pendingCeremony, [...pendingDays])}
                          disabled={pendingDays.size === 0}
                          style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#f7f4ee', background: pendingDays.size === 0 ? '#b8b0a4' : '#4a7a5a', border: 'none', borderRadius: '2px', padding: '2px 8px', cursor: pendingDays.size === 0 ? 'default' : 'pointer' }}
                        >
                          salvar
                        </button>
                        <button
                          onClick={() => { setAddingCeremonyFor(null); setPendingCeremony(null); setPendingDays(new Set()); }}
                          style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#8a8278', background: 'transparent', border: '0.5px dashed #c8c2b8', borderRadius: '2px', padding: '2px 6px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  {!isAdding && (
                    <button
                      onClick={() => { setAddingCeremonyFor(contact.id); setPendingCeremony(null); setPendingDays(new Set()); }}
                      title="Lançar participação em cerimônia anterior"
                      style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#b0a898', border: '0.5px dashed #c8c2b8', borderRadius: '2px', padding: '2px 6px', background: 'transparent', cursor: 'pointer', lineHeight: 1.4, alignSelf: 'flex-start' }}
                    >
                      +
                    </button>
                  )}
                </div>
              );
              return (
              <div key={contact.id} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 90px' : '220px 1fr 90px', gap: '1rem', padding: '0.85rem 0', borderBottom: '0.5px dashed #ddd9cf', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '16px', color: '#3a3530' }}>
                    {contact.nickname || contact.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#aaa49c', marginTop: '2px' }}>
                    {contact.phone || 'sem telefone'}
                    {contact.nome_completo ? ` · ${contact.nome_completo}` : ''}
                  </div>
                  {isMobile && <div style={{ marginTop: '6px' }}>{datesBadges}</div>}
                </div>
                {!isMobile && datesBadges}
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <button onClick={() => handleOpenContact(contact)} title="Editar" style={{ width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '0.5px dashed #b8b0a4', borderRadius: '2px', cursor: 'pointer', color: '#7a7268', padding: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  {contact.phone && (
                    <button onClick={() => openWhatsApp(contact.phone)} title="WhatsApp" style={{ width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '0.5px dashed #b8b0a4', borderRadius: '2px', cursor: 'pointer', color: '#7a7268', padding: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.533 5.856L.057 23.885a.5.5 0 0 0 .615.612l6.152-1.612A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.576-.495-5.063-1.36l-.363-.215-3.754.985.999-3.647-.237-.377A9.958 9.958 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    </button>
                  )}
                  <button onClick={() => handleDelete(contact)} title="Excluir" style={{ width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '0.5px dashed #c8a8a8', borderRadius: '2px', cursor: 'pointer', color: '#c8a8a8', padding: 0, fontSize: '13px', lineHeight: 1 }}>
                    ✕
                  </button>
                </div>
              </div>
            );
            })}

            {filteredContacts.length === 0 && (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: '#aaa49c', fontSize: '12px', letterSpacing: '0.06em' }}>nenhum contato encontrado.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal de cadastro / edição */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(58,53,48,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fdfbf7', border: '0.5px solid #b8b0a4', borderRadius: '2px', width: '100%', maxWidth: '420px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>

            <div style={{ padding: '1.5rem 2rem 1rem', borderBottom: '0.5px solid #d0cbc2', flexShrink: 0 }}>
              <h2 style={{ fontFamily: "'IM Fell English', serif", fontSize: '24px', fontWeight: 400, color: '#3a3530', margin: 0 }}>
                {editingContact ? (editingContact.nickname || editingContact.name) : 'Novo contato'}
              </h2>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem 2rem' }}>
              <form onSubmit={handleSubmit} id="contact-form">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={s.label}>Nome *</label>
                    <input type="text" required value={formData.nickname} onChange={e => setFormData({ ...formData, nickname: e.target.value })} style={{ ...s.fieldInput, marginTop: '5px' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={s.label}>Nome Completo (Documentos)</label>
                      {formData.nickname && (
                        <button type="button"
                          onClick={() => setFormData(f => ({ ...f, nome_completo: f.nickname }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#9a9288', letterSpacing: '0.06em', textDecoration: 'underline', textUnderlineOffset: '2px', padding: 0 }}>
                          copiar ↑
                        </button>
                      )}
                    </div>
                    <input type="text" value={formData.nome_completo} onChange={e => setFormData({ ...formData, nome_completo: e.target.value })} style={{ ...s.fieldInput, marginTop: '5px' }} />
                  </div>
                  <div>
                    <label style={s.label}>Telefone (WhatsApp)</label>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                      <select value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{ ...s.fieldInput, width: '96px', cursor: 'pointer' }}>
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
                      <input type="tel" placeholder="DDD + número" value={phoneBody} onChange={e => setPhoneBody(e.target.value.replace(/[^\d]/g, ''))} style={{ ...s.fieldInput, flex: 1 }} />
                    </div>
                  </div>
                </div>
              </form>

              {/* Histórico de Fichas Médicas */}
              {editingContact && (
                <div style={{ marginTop: '1.8rem', paddingTop: '1.4rem', borderTop: '0.5px dashed #d0cbc2' }}>
                  <div style={{ ...s.label, marginBottom: '0.8rem' }}>fichas médicas</div>
                  {medicalRecords.length === 0 ? (
                    <div style={{ fontSize: '11px', color: '#b0a898', fontStyle: 'italic' }}>nenhuma ficha preenchida ainda.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {medicalRecords.map((rec) => {
                        const meds = rec.medications_list || [];
                        const complete = rec.medical_form_step >= 6;
                        const expired = complete && (Date.now() - new Date(rec.created_at).getTime()) > 30 * 24 * 60 * 60 * 1000;
                        const hasDuvidas = rec.medical_form_data?.sec6_duvidas;
                        const hasAtencao = rec.medical_form_data?.sec2_leitura_nao_li || rec.medical_form_data?.sec3_historico_obs || rec.medical_form_data?.sec5_experiencias_recentes;
                        return (
                          <div
                            key={rec.id}
                            onClick={complete ? () => exportMedicalRecordPDF(rec, editingContact) : undefined}
                            style={{ padding: '0.7rem 0.9rem', background: '#f7f4ee', border: `0.5px solid ${complete ? (expired ? '#e0c87a' : '#a8c8b0') : '#d0cbc2'}`, borderRadius: '2px', cursor: complete ? 'pointer' : 'default' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#3a3530', fontWeight: 'bold' }}>
                                {new Date(rec.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '10px', color: expired ? '#c4892a' : complete ? '#4a7a5a' : '#8a7a58' }}>
                                  {expired ? '↺ expirada' : complete ? '✓ completa' : `incompleta · passo ${rec.medical_form_step || 0}`}
                                </span>
                                {complete && (
                                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#b0a898' }}>PDF →</span>
                                )}
                              </div>
                            </div>
                            <div style={{ fontSize: '10px', color: '#7a7268', marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {meds.length > 0
                                ? <span>💊 {meds.map(m => m.name).join(', ')}</span>
                                : <span>sem remédios</span>}
                              {hasDuvidas && <span style={{ color: '#c0392b' }}>⚠ dúvidas</span>}
                              {hasAtencao && <span style={{ color: '#d35400' }}>! atenção</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '0.5px solid #d0cbc2', flexShrink: 0, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a8278', background: 'transparent', border: '0.5px dashed #c8c2b8', borderRadius: '2px', padding: '8px 16px', cursor: 'pointer' }}>cancelar</button>
              <button type="submit" form="contact-form" style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f7f4ee', background: '#3a3530', border: 'none', borderRadius: '2px', padding: '8px 20px', cursor: 'pointer' }}>salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
