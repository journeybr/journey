'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

const ddiOptions = [
  { code: '+55', name: '🇧🇷 Brasil' },
  { code: '+1', name: '🇺🇸 EUA/Canadá' },
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

const inputStyle = {
  width: '100%',
  padding: '9px 11px',
  background: '#fff',
  border: '0.5px solid #c8c2b8',
  borderRadius: '2px',
  fontFamily: "'Courier Prime', monospace",
  fontSize: '13px',
  color: '#3a3530',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontFamily: "'Courier Prime', monospace",
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#7a7268',
  marginBottom: '0.45rem',
};

function formatEventDates(event) {
  if (!event?.date) return event?.name || '';
  const d1 = new Date(event.date + 'T00:00:00');
  const day1 = d1.getDate();
  const month1 = d1.toLocaleDateString('pt-BR', { month: 'long' });
  if (!event.date2) return `${day1} de ${month1}`;
  const d2 = new Date(event.date2 + 'T00:00:00');
  const day2 = d2.getDate();
  const month2 = d2.toLocaleDateString('pt-BR', { month: 'long' });
  return month1 === month2 ? `${day1} e ${day2} de ${month1}` : `${day1} de ${month1} e ${day2} de ${month2}`;
}

export default function RegisterInterest() {
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [duplicatePhone, setDuplicatePhone] = useState(null);

  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+55');
  const [phoneBody, setPhoneBody] = useState('');
  const [participation, setParticipation] = useState(null);
  const [foundContact, setFoundContact] = useState(null); // null=unchecked, false=not found, {id,name}=found
  const [notYou, setNotYou] = useState(false);

  useEffect(() => {
    if (params && params.id) {
      fetchEvent(params.id);
    }
  }, [params]);

  async function lookupPhone(body, code) {
    const clean = body.replace(/\D/g, '');
    if (clean.length < 8) { setFoundContact(null); return; }
    const fullPhone = `${code}${clean}`;
    const last9 = clean.slice(-9);
    let { data: exact } = await supabase.from('contacts').select('id, name').eq('phone', fullPhone);
    if (exact?.length) { setFoundContact(exact[0]); return; }
    let { data: partial } = await supabase.from('contacts').select('id, name').ilike('phone', `%${last9}%`);
    if (partial?.length) { setFoundContact(partial[0]); return; }
    setFoundContact(false);
  }

  async function fetchEvent(id) {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      setErrorMsg('Cerimônia não encontrada. Por favor, verifique o link.');
    } else {
      setEvent(data);
    }
    setLoading(false);
  }

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (countryCode === '+55') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length > 7) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
    }
    setPhoneBody(value);
    setFoundContact(null);
    setNotYou(false);
    lookupPhone(value, countryCode);
  };

  async function handleRegister(e) {
    e.preventDefault();
    const effectiveName = foundContact ? foundContact.name : name;
    if (!effectiveName.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }
    if (!phoneBody.replace(/\D/g, '')) {
      alert('Por favor, informe seu telefone.');
      return;
    }
    if (!participation) {
      alert('Por favor, selecione como você gostaria de participar.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const cleanPhoneBody = phoneBody.replace(/\D/g, '');
      const fullPhone = `${countryCode}${cleanPhoneBody}`;

      let existingContactId = null;

      let { data: phoneMatches, error: phoneErr } = await supabase
        .from('contacts')
        .select('id')
        .eq('phone', fullPhone);

      if (phoneErr) throw phoneErr;

      if (phoneMatches && phoneMatches.length > 0) {
        existingContactId = phoneMatches[0].id;
      } else {
        const last9 = cleanPhoneBody.slice(-9);
        if (last9.length >= 8) {
          let { data: partialMatches, error: partialErr } = await supabase
            .from('contacts')
            .select('id')
            .ilike('phone', `%${last9}%`);

          if (partialErr) throw partialErr;

          if (partialMatches && partialMatches.length > 0) {
            existingContactId = partialMatches[0].id;
          }
        }
      }

      let contactId = existingContactId;

      if (!contactId) {
        const { data: newContact, error: insertErr } = await supabase
          .from('contacts')
          .insert([{
            name: effectiveName.trim(),
            nickname: effectiveName.trim(),
            phone: fullPhone,
            status: 'Prospecto',
            remedio: 'não informado',
            medications_list: [],
            medical_form_step: 0,
            primeira_vez: true,
          }])
          .select()
          .single();

        if (insertErr) throw insertErr;
        contactId = newContact.id;
      }

      const { data: checkParticipation, error: checkErr } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', event.id)
        .eq('contact_id', contactId);

      if (checkErr) throw checkErr;

      if (checkParticipation && checkParticipation.length > 0) {
        setDuplicatePhone(`${countryCode} ${phoneBody}`);
        setSubmitting(false);
        return;
      }

      const interestName = (effectiveName.trim() || 'viajante').split(' ')[0];
      const daysLabel = participation === 'both' ? 'Dia I e Dia II' : participation === 'day1' ? 'Dia I' : 'Dia II';
      const enrollLog = [{ at: new Date().toISOString(), by: interestName, msg: `${interestName} manifestou interesse (${daysLabel})` }];
      const { error: linkErr } = await supabase
        .from('event_participants')
        .insert([{
          event_id: event.id,
          contact_id: contactId,
          status: 'intenção de ir',
          date1_confirmed: participation !== 'day2',
          date2_confirmed: participation !== 'day1',
          remedio_status: 'enviar',
          payment_status: 'em aberto',
          vaga: 'Automático',
          enrollment_log: enrollLog
        }]);

      if (linkErr) throw linkErr;

      setSuccess(true);
    } catch (err) {
      console.error('Error registering interest:', err);
      setErrorMsg('Houve um erro ao registrar seu interesse. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  const pageStyle = {
    minHeight: '100vh',
    background: '#f7f4ee',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '3rem 1rem 5rem',
  };

  const marginLine = (
    <div style={{
      position: 'fixed',
      left: '3.2rem',
      top: 0,
      bottom: 0,
      width: '1px',
      background: '#e8c8c8',
      opacity: 0.45,
      pointerEvents: 'none',
    }} />
  );

  const cornerDeco = (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '2rem',
      fontFamily: "'Courier Prime', monospace",
      fontSize: '10px',
      color: '#c8c2b8',
      letterSpacing: '0.12em',
      pointerEvents: 'none',
    }}>
      journey · interesse
    </div>
  );

  if (loading) {
    return (
      <div style={{ ...pageStyle, alignItems: 'center' }}>
        {marginLine}
        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Carregando cerimônia...
        </div>
        {cornerDeco}
      </div>
    );
  }

  if (errorMsg && !event) {
    return (
      <div style={{ ...pageStyle, alignItems: 'center' }}>
        {marginLine}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '2.5rem', color: '#3a3530', fontWeight: 400, marginBottom: '0.8rem' }}>
            Cerimônia não encontrada.
          </div>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.08em' }}>
            {errorMsg}
          </p>
        </div>
        {cornerDeco}
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {marginLine}

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: '#fdfbf7',
        border: '0.5px solid #c8c2b8',
        borderRadius: '2px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Banner */}
        {event.image_url ? (
          <div style={{ width: '100%', overflow: 'hidden', borderBottom: '0.5px solid #c8c2b8' }}>
            <img
              src={event.image_url}
              alt={event.name}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'sepia(10%)' }}
            />
          </div>
        ) : (
          <div style={{
            width: '100%',
            height: '100px',
            background: '#3a3530',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: '0.5px solid #1c1c1c',
          }}>
            <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '22px', color: '#f7f4ee', opacity: 0.75, letterSpacing: '0.05em' }}>
              Journey<span style={{ color: '#d4af37' }}>.</span>
            </span>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '2rem' }}>

          {/* Event info */}
          <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: '2rem', color: '#3a3530', fontWeight: 400, lineHeight: 1.1, margin: '0 0 0.4rem' }}>
            {event.name}
          </h1>

          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#9a9288', letterSpacing: '0.06em', marginBottom: event.description ? '0.8rem' : '1.5rem' }}>
            <span style={{ fontWeight: 'bold', color: '#7a7268', marginRight: '4px' }}>Dia I:</span>
            {event.date ? new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'A definir'}
            {event.date2 && (
              <>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <span style={{ fontWeight: 'bold', color: '#7a7268', marginRight: '4px' }}>Dia II:</span>
                {new Date(event.date2 + 'T00:00:00').toLocaleDateString('pt-BR')}
              </>
            )}
          </div>

          {event.description && (
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#7a7268', fontStyle: 'italic', margin: '0 0 1.5rem', lineHeight: 1.4 }}>
              "{event.description}"
            </p>
          )}

          <hr style={{ border: 'none', borderTop: '0.5px solid #d0cbc2', margin: '0 0 1.5rem' }} />

          {success ? (
            <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
              <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '2rem', color: '#3a3530', fontWeight: 400, marginBottom: '1rem', lineHeight: 1.2 }}>
                Interesse registrado.
              </div>
              <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '13px', color: '#7a7268', lineHeight: 1.7, marginBottom: '2rem' }}>
                Obrigado pelo interesse de caminhar conosco em {formatEventDates(event)}.<br />
                Vamos entrar em contato em breve para os próximos passos.
              </p>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#b0a898', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                até breve · journey
              </div>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div style={{ padding: '0.7rem 1rem', background: '#faf0f0', border: '0.5px solid #e8c0c0', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#9a3a3a', marginBottom: '1.5rem', letterSpacing: '0.04em' }}>
                  {errorMsg}
                </div>
              )}

              {duplicatePhone && (
                <div style={{ padding: '0.9rem 1rem', background: '#fdf8ee', border: '0.5px solid #d4c090', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#7a6530', marginBottom: '1.5rem', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                  Já existe um registro com esse número de telefone: <strong>{duplicatePhone}</strong>. Caso não reconheça, entra em contato com a gente.
                </div>
              )}

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

                {/* Telefone — primeiro */}
                <div>
                  <label style={labelStyle}>Telefone de Contato</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                      value={countryCode}
                      onChange={(e) => { setCountryCode(e.target.value); setPhoneBody(''); setFoundContact(null); setNotYou(false); }}
                      style={{ ...inputStyle, width: '90px', flex: 'none', cursor: 'pointer', padding: '9px 6px' }}
                    >
                      {ddiOptions.map(opt => (
                        <option key={opt.code} value={opt.code}>{opt.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder={countryCode === '+55' ? '(81) 99999-9999' : 'Número de telefone'}
                      value={phoneBody}
                      onChange={handlePhoneChange}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                </div>

                {/* Nome — condicional */}
                {foundContact ? (
                  notYou ? (
                    <div style={{ padding: '0.8rem 1rem', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#7a7268', lineHeight: 1.6 }}>
                      Entre em contato com a gente para atualizar seus dados.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                      <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '17px', color: '#3a3530' }}>
                        Olá, {foundContact.name.split(' ')[0]}!
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotYou(true)}
                        style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#aaa49c', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textDecoration: 'underline', padding: 0 }}
                      >
                        não é você?
                      </button>
                    </div>
                  )
                ) : (
                  <div>
                    <label style={labelStyle}>Nome Completo</label>
                    <input
                      type="text"
                      required={!foundContact}
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                )}

                {/* Dias */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { value: 'both', label: 'Quero participar.', bold: true, prominent: true },
                    { value: 'day1', label: 'Quero participar, mas apenas do primeiro dia.' },
                    ...(event.date2 ? [{ value: 'day2', label: 'Quero participar, mas apenas do segundo dia.' }] : []),
                  ].map(opt => (
                    <label key={opt.value} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      cursor: 'pointer',
                      padding: '10px 13px',
                      border: participation === opt.value ? '1px solid #3a3530' : opt.prominent ? '1px solid #c8c2b8' : '0.5px dashed #c8c2b8',
                      borderRadius: '2px',
                      background: participation === opt.value ? '#faf7f0' : opt.prominent ? '#faf7f0' : 'transparent',
                      transition: 'all 0.15s',
                      fontFamily: opt.prominent ? "'IM Fell English', serif" : "'Courier Prime', monospace",
                      fontSize: opt.prominent ? '15px' : '11px',
                      letterSpacing: opt.prominent ? '0.02em' : '0.06em',
                      color: participation === opt.value ? '#3a3530' : opt.prominent ? '#5a5248' : '#9a9288',
                      fontWeight: opt.bold ? 'normal' : 'normal',
                    }}>
                      <input
                        type="radio"
                        name="participation"
                        value={opt.value}
                        checked={participation === opt.value}
                        onChange={() => setParticipation(opt.value)}
                        style={{ accentColor: '#3a3530', width: '13px', height: '13px', cursor: 'pointer' }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

                {/* Aviso */}
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#aaa49c', letterSpacing: '0.04em', lineHeight: 1.6, margin: '0.2rem 0 0' }}>
                  Ainda <strong style={{ color: '#7a7268' }}>NÃO</strong> há a garantia da sua participação. Entraremos em contato com você em breve para fazer a confirmação.
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#f7f4ee',
                    background: submitting ? '#7a7268' : '#3a3530',
                    border: 'none',
                    padding: '13px 20px',
                    borderRadius: '2px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    width: '100%',
                    marginTop: '0.4rem',
                    transition: 'background 0.2s',
                  }}
                >
                  {submitting ? 'registrando...' : 'manifestar interesse'}
                </button>

              </form>
            </>
          )}
        </div>
      </div>

      {cornerDeco}
    </div>
  );
}
