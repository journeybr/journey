'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const MEDICATIONS_DATABASE = [
  'Sertralina', 'Escitalopram', 'Lexapro', 'Reconter', 'Fluoxetina', 'Prozac', 'Daforin',
  'Citalopram', 'Paroxetina', 'Aropax', 'Pondera', 'Venlafaxina', 'Efexor', 'Desvenlafaxina',
  'Pristiq', 'Duloxetina', 'Cymbalta', 'Bupropiona', 'Wellbutrin', 'Bup', 'Mirtazapina',
  'Remeron', 'Amitriptilina', 'Amytril', 'Nortriptilina', 'Pamelor', 'Clomipramina',
  'Anafranil', 'Imipramina', 'Tofranil', 'Trazodona', 'Donaren', 'Vortioxetina', 'Brintellix',
  'Clonazepam', 'Rivotril', 'Alprazolam', 'Frontal', 'Diazepam', 'Valium', 'Lorazepam',
  'Lorax', 'Zolpidem', 'Stilnox', 'Eszopiclona', 'Prysma', 'Pregabalina', 'Lyrica', 'Gabapentina',
  'Carbonato de Lítio', 'Carbolitium', 'Ácido Valproico', 'Valproato de Sódio', 'Depakene',
  'Depakote', 'Carbamazepina', 'Tegretol', 'Oxcarbazepina', 'Trileptal', 'Lamotrigina',
  'Lamictal', 'Topiramato', 'Amato', 'Quetiapina', 'Seroquel', 'Risperidona', 'Risperdal',
  'Olanzapina', 'Zyprexa', 'Aripiprazol', 'Aristab', 'Haloperidol', 'Haldol', 'Clorpromazina',
  'Amplictil', 'Clozapina', 'Leponex', 'Metilfenidato', 'Ritalina', 'Concerta', 'Lisdexanfetamina',
  'Venvanse', 'Atomoxetina', 'Atentah', 'Losartana', 'Atenolol', 'Propranolol', 'Enalapril',
  'Captopril', 'Hidroclorotiazida', 'Anlodipino', 'Metformina', 'Glimepirida', 'Insulina',
  'Levotiroxina Sódica', 'Puran T4', 'Synthroid', 'Atorvastatina', 'Simvastatina', 'Rosuvastatina',
  'AAS', 'Dipirona', 'Paracetamol', 'Ibuprofeno', 'Nimesulida', 'Cetoprofeno', 'Omeprazol',
  'Pantoprazol', 'Loratadina', 'Desloratadina', 'Allegra', 'Fexofenadina', 'Prednisona', 'Dexametasona',
  '5-HTP', 'Triptofano', 'Erva-de-são-joão', 'SAM-e', 'Melatonina',
].sort();

const S = { DECLARACAO: 1, MENTAL: 2, FISICO: 3, MEDS1: 4, MEDS2: 5, RISCOS: 6, CONFIRMACAO: 7 };

function sectionStatus(step, fd, meds) {
  if (step === S.DECLARACAO) {
    if (!fd.sec1_maioridade || !fd.sec1_voluntaria || !fd.sec1_instrucoes || !fd.sec1_conforto) return 'warn';
    return 'ok';
  }
  if (step === S.MENTAL) {
    if (fd.sec2_historico) return 'warn';
    if (!fd.sec2_esquizofrenia || !fd.sec2_familiar || !fd.sec2_instaveis || !fd.sec2_ideacao || !fd.sec2_raiva) return 'warn';
    return 'ok';
  }
  if (step === S.FISICO) {
    if (!fd.sec3_cushing || !fd.sec3_incapacitante || !fd.sec3_cardio || !fd.sec3_neuro) return 'warn';
    return 'ok';
  }
  if (step === S.MEDS1) {
    if (!fd.sec4a_informar || !fd.sec4a_informar_tudo || !fd.sec4a_sem_psicodelicos || !fd.sec4a_nao_portar) return 'warn';
    return 'ok';
  }
  if (step === S.MEDS2) {
    if (!fd.sec4b_remedio || fd.sec4b_dependencia || !fd.sec4b_abstinencia_remedio) return 'warn';
    return 'ok';
  }
  if (step === S.RISCOS) {
    if (fd.sec5_duvidas || !fd.sec5_informacoes || !fd.sec5_veracidade || !fd.sec5_responsabilidade) return 'warn';
    return 'ok';
  }
  if (step === S.CONFIRMACAO) {
    if (!fd.sec6_confirma || !fd.nome_completo || !fd.data_nascimento || !fd.telefone) return 'warn';
    return 'ok';
  }
  return 'ok';
}

const EMPTY_FORM = {
  sec1_maioridade: false, sec1_voluntaria: false, sec1_leitura: false,
  sec1_nao_leu: false, sec1_instrucoes: false, sec1_conforto: false,
  sec2_esquizofrenia: false, sec2_familiar: false, sec2_instaveis: false,
  sec2_ideacao: false, sec2_raiva: false, sec2_historico: false, sec2_historico_obs: '',
  sec3_cushing: false, sec3_incapacitante: false, sec3_cardio: false, sec3_neuro: false,
  sec4a_informar: false, sec4a_informar_tudo: false, sec4a_sem_psicodelicos: false,
  sec4a_abstinencia: false, sec4a_nao_portar: false,
  sec4b_remedio: false, sec4b_abstinencia_remedio: false, sec4b_dependencia: false,
  sec5_informacoes: false, sec5_veracidade: false, sec5_responsabilidade: false, sec5_duvidas: false,
  sec6_confirma: false,
  nome_completo: '', data_nascimento: '', telefone_ddi: '+55', telefone: '',
  contato_emergencia: '', data_assinatura: new Date().toLocaleDateString('pt-BR'), cpf: '',
  sec4c_outros: '',
};

export default function PublicFicha() {
  const [contactId, setContactId] = useState(null);
  const [currentStep, setCurrentStep] = useState(S.DECLARACAO);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [medications, setMedications] = useState([]);
  const [currentMed, setCurrentMed] = useState('');
  const [currentDosage, setCurrentDosage] = useState('');
  const [currentFreq, setCurrentFreq] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const visibleSteps = [1, 2, 3, 4, 5, 6, 7];
  const currentIdx = visibleSteps.indexOf(currentStep);
  const totalSteps = visibleSteps.length;

  useEffect(() => { document.title = 'Formulário de Triagem'; }, []);

  // Load contact from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from('contacts').select('*').eq('id', id).single();
      if (!data || error) return;
      setContactId(id);
      if (data.medical_form_step) setCurrentStep(Math.min(data.medical_form_step, 8));
      if (data.medications_list) setMedications(data.medications_list);
      if (data.medical_form_data && Object.keys(data.medical_form_data).length > 0) {
        setFormData(prev => ({ ...prev, ...data.medical_form_data }));
      } else {
        setFormData(prev => ({ ...prev, nome_completo: data.name || '', telefone: data.phone || '', cpf: data.cpf || '' }));
      }
    })();
  }, []);

  // Canvas setup when reaching confirmation step
  useEffect(() => {
    if (currentStep !== S.CONFIRMACAO) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (signatureDataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = signatureDataUrl;
      setHasSignature(true);
    }
  }, [currentStep]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDobChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 4) v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    else if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    setFormData(prev => ({ ...prev, data_nascimento: v }));
  };

  const handlePhoneChange = (e) => {
    let v = e.target.value;
    if (formData.telefone_ddi === '+55') {
      v = v.replace(/\D/g, '').slice(0, 11);
      if (v.length > 10) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      else if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
      else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      else if (v.length > 0) v = `(${v}`;
    }
    setFormData(prev => ({ ...prev, telefone: v }));
  };

  // Canvas drawing
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const canvasStart = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const canvasDraw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const canvasEnd = () => { isDrawingRef.current = false; };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureDataUrl(null);
  };

  // Medication autocomplete
  const handleMedName = (e) => {
    const v = e.target.value;
    setCurrentMed(v);
    setSuggestions(v.trim() ? MEDICATIONS_DATABASE.filter(m => m.toLowerCase().startsWith(v.toLowerCase())).slice(0, 5) : []);
  };

  const addMedication = () => {
    if (!currentMed.trim()) return;
    setMedications(prev => [...prev, { name: currentMed.trim(), dosage: currentDosage.trim(), frequency: currentFreq.trim() }]);
    setCurrentMed(''); setCurrentDosage(''); setCurrentFreq('');
    setSuggestions([]);
  };

  const saveProgress = async (nextStep, isFinal = false) => {
    setLoading(true);
    try {
      const fd = { ...formData };
      const payload = { medical_form_step: nextStep, medical_form_data: fd, medications_list: medications };
      let aid = contactId;

      if (!aid) {
        if (isFinal) {
          const cleanPhone = fd.telefone.replace(/\D/g, '');
          const cleanCpf = (fd.cpf || '').replace(/\D/g, '');
          let matchedId = null;
          if (cleanPhone) {
            const { data: pm } = await supabase.from('contacts').select('id').eq('phone', cleanPhone);
            if (pm?.length) matchedId = pm[0].id;
          }
          if (!matchedId && cleanCpf) {
            const { data: cm } = await supabase.from('contacts').select('id').eq('cpf', cleanCpf);
            if (cm?.length) matchedId = cm[0].id;
          }
          if (matchedId) {
            aid = matchedId;
          } else {
            const { data, error } = await supabase.from('contacts').insert([{
              name: fd.nome_completo || 'Anônimo',
              phone: cleanPhone || null,
              cpf: cleanCpf || null,
              status: 'Prospecto',
              avisar: 'Sempre',
              experiences_count: 0,
            }]).select();
            if (error) throw error;
            aid = data[0].id;
          }
          setContactId(aid);
        } else {
          const { data, error } = await supabase.from('contacts').insert([{
            name: 'Ficha em andamento',
            status: 'Ficha em Preenchimento',
            avisar: 'Nunca',
            experiences_count: 0,
            ...payload,
          }]).select();
          if (error) throw error;
          aid = data[0].id;
          setContactId(aid);
          setCurrentStep(nextStep);
          return;
        }
      }

      const update = { ...payload };

      if (isFinal) {
        const sigUrl = canvasRef.current ? canvasRef.current.toDataURL('image/png') : '';
        update.medical_form_data = { ...fd, assinatura: sigUrl };
        const needsReview = !fd.sec4b_remedio || fd.sec4b_dependencia || medications.length > 0;
        update.remedio = needsReview ? 'em andamento' : 'não';
        update.status = 'Prospecto';
        update.name = fd.nome_completo || 'Anônimo';
        const cp = fd.telefone.replace(/\D/g, '');
        if (cp) update.phone = cp;
        if (fd.cpf) update.cpf = fd.cpf.replace(/\D/g, '');

        const { data: c } = await supabase.from('contacts').select('observations').eq('id', aid).single();
        const rawObs = c?.observations || '';
        const markerIdx = rawObs.indexOf('[Triagem via Formulário]');
        const baseObs = markerIdx >= 0 ? rawObs.substring(0, markerIdx).trim() : rawObs;
        const note = `[Triagem via Formulário]\n\nContato de Emergência: ${fd.contato_emergencia || '—'}\nData de Nascimento: ${fd.data_nascimento || '—'}\n\nHistórico Psiquiátrico: ${fd.sec2_historico_obs || 'Não informado'}\nSubstâncias/Outros: ${fd.sec4c_outros || 'Não informado'}`;
        update.observations = baseObs ? `${baseObs}\n\n${note}` : note;
      }

      const { error } = await supabase.from('contacts').update(update).eq('id', aid);
      if (error) throw error;

      if (isFinal) {
        const { error: recErr } = await supabase.from('medical_records').insert([{
          contact_id: aid,
          medical_form_data: update.medical_form_data,
          medications_list: medications,
          medical_form_step: nextStep,
          remedio: update.remedio,
        }]);
        if (recErr) console.error('medical_records:', recErr.message);

        const firstName = (fd.nome_completo || 'Viajante').trim().split(' ')[0];
        const logEntry = { at: new Date().toISOString(), by: firstName, msg: `${firstName} preencheu a ficha de triagem`, type: 'ficha' };
        const { data: parts } = await supabase
          .from('event_participants')
          .select('event_id, enrollment_log, events(active)')
          .eq('contact_id', aid);
        for (const part of (parts || []).filter(p => p.events?.active !== false)) {
          await supabase.from('event_participants')
            .update({ enrollment_log: [...(part.enrollment_log || []), logEntry] })
            .eq('contact_id', aid)
            .eq('event_id', part.event_id);
        }

        setSubmitted(true);
        return;
      }

      setCurrentStep(nextStep);
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (currentStep === S.RISCOS && formData.sec5_duvidas) return;
    if (currentStep === S.CONFIRMACAO) {
      if (!hasSignature) { alert('Por favor, desenhe sua assinatura.'); return; }
      if (!formData.sec6_confirma) { alert('Confirme a declaração de veracidade.'); return; }
      if (!formData.nome_completo || !formData.data_nascimento || !formData.telefone) {
        alert('Preencha nome, data de nascimento e telefone.'); return;
      }
      saveProgress(S.CONFIRMACAO, true);
      return;
    }
    const idx = visibleSteps.indexOf(currentStep);
    if (idx < visibleSteps.length - 1) saveProgress(visibleSteps[idx + 1]);
  };

  const goPrev = () => {
    if (currentStep === S.CONFIRMACAO && canvasRef.current && hasSignature) {
      setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
    }
    const idx = visibleSteps.indexOf(currentStep);
    if (idx > 0) setCurrentStep(visibleSteps[idx - 1]);
  };

  const CB = ({ name, label, isNeg }) => (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.9rem', cursor: 'pointer',
      padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #e5dfd3',
      background: '#faf9f6',
    }}>
      <input type="checkbox" name={name} checked={formData[name]} onChange={handleCheckboxChange}
        style={{ width: '20px', height: '20px', accentColor: '#2d4a3e', marginTop: '0.15rem', flexShrink: 0 }} />
      <span style={{ fontSize: '0.9rem', color: '#3a413d', lineHeight: '1.55' }}>{label}</span>
    </label>
  );

  const stepLabel = currentIdx + 1;

  const stepTitle = {
    [S.DECLARACAO]: '1. Declaração inicial',
    [S.MENTAL]: '2. Saúde mental e histórico psiquiátrico',
    [S.FISICO]: '3. Saúde física e histórico médico',
    [S.MEDS1]: '4. Medicamentos, suplementos e substâncias',
    [S.MEDS2]: '5. Medicamentos, suplementos e substâncias (cont.)',
    [S.RISCOS]: '6. Ciência sobre riscos e responsabilidade',
    [S.CONFIRMACAO]: '7. Confirmação final',
  }[currentStep];

  const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #d4cbb8', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.95rem', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f4f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem 4rem', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#3a413d' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) { .fc { padding: 1.25rem !important; } }
        .fc-anim { animation: fcIn 0.3s ease; }
        @keyframes fcIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        canvas { touch-action: none; }
      ` }} />
      <div className="fc" style={{ background: '#fff', border: '1px solid #d4cbb8', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '660px', boxShadow: '0 12px 32px rgba(139,126,102,0.08)' }}>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
            <svg viewBox="0 0 40 40" width="56" height="56" style={{ display: 'block', margin: '0 auto 1.25rem' }}>
              <circle cx="20" cy="20" r="19" fill="none" stroke="#2d4a3e" strokeWidth="2" />
              <path d="M12 20l6 6 10-12" fill="none" stroke="#2d4a3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 style={{ color: '#2d4a3e', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>Formulário enviado!</h2>
            <p style={{ color: '#5a605c', lineHeight: '1.6', fontSize: '0.95rem' }}>Suas declarações foram registradas com sucesso. Agradecemos sua honestidade e transparência.</p>
          </div>
        ) : (
          <div className="fc-anim">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#8b7e66', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', marginBottom: '0.25rem' }}>Formulário de triagem, ciência e responsabilidade</div>
              <div style={{ fontSize: '1rem', color: '#2d4a3e', fontWeight: '700', marginBottom: '1rem' }}>Preparação para Cerimônia</div>

              {/* Step dots */}
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
                {visibleSteps.map((step, i) => {
                  const isPast = i < currentIdx;
                  const isCurrent = step === currentStep;
                  return (
                    <div key={step} style={{ flexShrink: 0 }}>
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: isCurrent ? '#2d4a3e' : isPast ? '#4a7c59' : '#e5dfd3',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: '700',
                        color: isCurrent || isPast ? '#fff' : '#8b7e66',
                        outline: isCurrent ? '2px solid #2d4a3e' : 'none',
                        outlineOffset: '2px',
                        transition: 'background 0.3s',
                      }}>
                        {i + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8b7e66', marginTop: '0.5rem' }}>Etapa {stepLabel} de {totalSteps}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

              {/* STEP 1 — Declaração inicial */}
              {currentStep === S.DECLARACAO && (<>
                <div style={{ padding: '1rem', background: '#f5f3ef', borderRadius: '8px', border: '1px solid #e5dfd3', fontSize: '0.85rem', color: '#5a605c', lineHeight: '1.6', marginBottom: '0.25rem' }}>
                  Este formulário tem como objetivo apoiar a sua segurança e da equipe. As informações devem ser respondidas com honestidade, completude e atualização.<br /><br />
                  A omissão, imprecisão ou falsa declaração sobre condições médicas, psicológicas, psiquiátricas, uso de medicamentos, suplementos ou substâncias aumenta significativamente os riscos da experiência.
                </div>
                <h3 style={{ margin: '0.5rem 0 0.25rem', color: '#1a1a1a', fontSize: '1rem' }}>{stepTitle}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.25rem' }}>Como participante, declaro que:</p>
                <CB name="sec1_maioridade" label="Sou adulto legalmente responsável e tenho capacidade plena para decidir sobre minha participação." />
                <CB name="sec1_voluntaria" label="Minha participação é voluntária, consciente e baseada nas informações que recebi até o momento." />
                <CB name="sec1_instrucoes" label="Comprometo-me a seguir as instruções da equipe antes, durante e depois da experiência." />
                <CB name="sec1_conforto" label="Sinto-me confortável em praticar autorreflexão, escutar com atenção, comunicar-me de forma honesta e assumir responsabilidade por questões emocionais, psicológicas ou pessoais que possam surgir." />
              </>)}

              {/* STEP 2 — Saúde mental */}
              {currentStep === S.MENTAL && (<>
                <h3 style={{ margin: '0 0 0.25rem', color: '#1a1a1a', fontSize: '1rem' }}>{stepTitle}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.25rem' }}>Confirmo que:</p>
                <CB name="sec2_esquizofrenia" label="Não tenho diagnóstico atual ou histórico conhecido de esquizofrenia, transtornos psicóticos, transtorno bipolar tipo I ou II, ou transtornos de personalidade, incluindo, mas não se limitando a transtorno de personalidade borderline, narcisista ou esquizoide." />
                <CB name="sec2_familiar" label="Não tenho histórico familiar conhecido de esquizofrenia ou transtornos psicóticos graves." />
                <CB name="sec2_instaveis" label="Não tenho condição de saúde mental incapacitante, instável ou aguda, incluindo crises psiquiátricas recentes, episódios dissociativos graves, mania, psicose, depressão severa descompensada ou condição relacionada a dependência química não estabilizada." />
                <CB name="sec2_ideacao" label="Não tenho ideação suicida ou homicida, atual ou recente." />
                <CB name="sec2_raiva" label="Não tenho problemas graves ou recorrentes de controle de raiva, impulsividade ou comportamento agressivo." />
                <CB name="sec2_historico" label="Tenho ou já tive condição psiquiátrica, emocional ou comportamental relevante que ainda não informei." isNeg />
                {formData.sec2_historico && (
                  <div style={{ marginLeft: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#3a413d', display: 'block', marginBottom: '0.4rem' }}>Mais informações:</label>
                    <textarea name="sec2_historico_obs" value={formData.sec2_historico_obs} onChange={handleInputChange}
                      placeholder="Descreva a condição, diagnóstico ou histórico relevante..." rows={3}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }} />
                  </div>
                )}
              </>)}

              {/* STEP 3 — Saúde física */}
              {currentStep === S.FISICO && (<>
                <h3 style={{ margin: '0 0 0.25rem', color: '#1a1a1a', fontSize: '1rem' }}>{stepTitle}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.25rem' }}>Confirmo que:</p>
                <CB name="sec3_cushing" label="Não tenho síndrome de Cushing." />
                <CB name="sec3_incapacitante" label="Não tenho condição médica incapacitante, instável ou relevante que possa representar risco aumentado durante a experiência." />
                <CB name="sec3_cardio" label="Não tenho doenças cardiovasculares, hipertensão não controlada, aneurisma, arritmias graves ou outras condições cardíacas ou circulatórias importantes." />
                <CB name="sec3_neuro" label="Não tenho histórico de distúrbios neurológicos relevantes, incluindo, mas não se limitando a AVC, epilepsia, convulsões, lesão cerebral grave ou outras condições neurológicas importantes." />
              </>)}

              {/* STEP 4 — Meds parte 1 */}
              {currentStep === S.MEDS1 && (<>
                <h3 style={{ margin: '0 0 0.25rem', color: '#1a1a1a', fontSize: '1rem' }}>{stepTitle}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.25rem' }}>Confirmo que:</p>
                <CB name="sec4a_informar" label="Informarei de forma completa e verdadeira todos os medicamentos, suplementos, substâncias, tratamentos ou produtos que estou usando atualmente ou que usei no último mês." />
                <CB name="sec4a_informar_tudo" label="Entendo que devo informar tudo, mesmo que pareça irrelevante, ocasional, natural, recreativo, prescrito, não prescrito ou de venda livre." />
                <CB name="sec4a_sem_psicodelicos" label="Não participarei de qualquer experiência com substâncias psicodélicas, enteógenas ou psicoativas nos 15 dias que antecedem a cerimônia e até 5 dias após a cerimônia — entre elas ayahuasca, psilocibina, LSD, MDMA, DMT, mescalina, iboga, ketamina e microdosagem, sem se limitar a essas." />
                <CB name="sec4a_nao_portar" label="Comprometo-me a não levar, portar, compartilhar ou consumir durante a experiência qualquer substância, medicina, planta, suplemento ou produto psicoativo, incluindo, mas não se limitando a cannabis, rapé, sananga, álcool, estimulantes, sedativos, psicodélicos, enteógenos ou medicamentos de uso não informado, ciente de que o descumprimento deste compromisso poderá resultar na minha exclusão da experiência atual e de futuras cerimônias." />
              </>)}

              {/* STEP 5 — Meds parte 2 + lista de medicamentos */}
              {currentStep === S.MEDS2 && (<>
                <h3 style={{ margin: '0 0 0.25rem', color: '#1a1a1a', fontSize: '1rem' }}>{stepTitle}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.25rem' }}>Confirmo que:</p>
                <CB name="sec4b_dependencia" label="Tenho histórico de dependência, abuso ou uso problemático de álcool, drogas, medicamentos prescritos ou outras substâncias." isNeg />
                <CB name="sec4b_remedio" label="Não estou usando nenhum medicamento, suplemento ou substância que possa interagir com psicodélicos ou enteógenos — incluindo medicamentos psiquiátricos (antidepressivos, ISRSs, IRSNs, IMAOs, estabilizadores de humor, antipsicóticos, ansiolíticos, benzodiazepínicos, sedativos, hipnóticos, estimulantes), remédios para pressão, analgésicos, hormônios, antibióticos, suplementos, vitaminas, fitoterápicos (erva-de-são-joão, 5-HTP, triptofano, SAM-e, melatonina), cannabis, álcool, microdosagem ou qualquer outra substância." isNeg={!formData.sec4b_remedio} />

                {!formData.sec4b_remedio && (<>
                  <div style={{ background: '#f5f3ef', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e5dfd3' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#2d4a3e', marginBottom: '0.75rem' }}>Adicionar medicamento ou substância</div>
                    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                      <input type="text" placeholder="Nome do remédio ou substância..." value={currentMed} onChange={handleMedName}
                        style={{ ...inputStyle }} />
                      {suggestions.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d4cbb8', borderRadius: '6px', zIndex: 20, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          {suggestions.map((s, i) => (
                            <div key={i} onClick={() => { setCurrentMed(s); setSuggestions([]); }}
                              style={{ padding: '0.65rem 0.9rem', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #f0ece4' : 'none', fontSize: '0.9rem' }}>
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <input type="text" placeholder="Dose (ex: 50mg)" value={currentDosage} onChange={e => setCurrentDosage(e.target.value)} style={inputStyle} />
                      <input type="text" placeholder="Frequência (ex: 1x ao dia)" value={currentFreq} onChange={e => setCurrentFreq(e.target.value)} style={inputStyle} />
                    </div>
                    <button type="button" onClick={addMedication}
                      style={{ width: '100%', padding: '0.7rem', background: '#2d4a3e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>
                      + Adicionar
                    </button>
                  </div>

                  {medications.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {medications.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.75rem 1rem', background: '#fff', border: '1px solid #e5dfd3', borderLeft: '3px solid #2d4a3e', borderRadius: '6px', gap: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{m.name}</div>
                            {(m.dosage || m.frequency) && (
                              <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.15rem' }}>
                                {[m.dosage, m.frequency].filter(Boolean).join(' · ')}
                              </div>
                            )}
                          </div>
                          <button type="button" onClick={() => setMedications(medications.filter((_, i) => i !== idx))}
                            style={{ color: '#dc2626', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, padding: '0.2rem' }}>
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#3a413d', display: 'block', marginBottom: '0.4rem' }}>Outros medicamentos, suplementos ou substâncias:</label>
                    <textarea name="sec4c_outros" value={formData.sec4c_outros} onChange={handleInputChange}
                      placeholder="Liste aqui o que não encontrou na busca acima, ou qualquer outra substância relevante..." rows={3}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                  </div>
                </>)}

                <CB name="sec4b_abstinencia_remedio" label="Comprometo-me a informar à organização qualquer alteração no uso de remédios e suplementos, de hoje até o dia da cerimônia." />
              </>)}

              {/* STEP 7 — Riscos */}
              {currentStep === S.RISCOS && (<>
                <h3 style={{ margin: '0 0 0.25rem', color: '#1a1a1a', fontSize: '1rem' }}>{stepTitle}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.25rem' }}>Declaro que:</p>
                <CB name="sec5_informacoes" label="Recebi informações suficientes para decidir participar de forma voluntária e consciente." />
                <CB name="sec5_veracidade" label="Assumo responsabilidade pela veracidade, completude e atualização das informações fornecidas por mim à equipe." />
                <CB name="sec5_responsabilidade" label="Assumo responsabilidade pela minha decisão de participar, pela minha conduta antes, durante e depois da experiência, e pelo cumprimento das orientações de segurança recebidas." />
                <CB name="sec5_duvidas" label="Não compreendi algum ponto deste formulário ou ainda tenho dúvidas antes de assinar." isNeg />
                {formData.sec5_duvidas && (
                  <div style={{ padding: '1rem 1.25rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontWeight: '700', color: '#b91c1c', fontSize: '0.95rem' }}>Converse com a equipe antes de avançar e assinar!</p>
                  </div>
                )}
              </>)}

              {/* STEP 8 — Confirmação final */}
              {currentStep === S.CONFIRMACAO && (<>
                <h3 style={{ margin: '0 0 0.5rem', color: '#1a1a1a', fontSize: '1rem' }}>{stepTitle}</h3>
                <CB name="sec6_confirma" label="Confirmo que as informações fornecidas por mim neste formulário são verdadeiras, completas e atualizadas até a presente data." />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#3a413d', display: 'block', marginBottom: '0.35rem' }}>Telefone</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select value={formData.telefone_ddi} onChange={e => setFormData(p => ({ ...p, telefone_ddi: e.target.value }))}
                        style={{ padding: '0.75rem 0.5rem', border: '1px solid #d4cbb8', borderRadius: '6px', background: '#fff', fontSize: '0.9rem', flexShrink: 0 }}>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+351">🇵🇹 +351</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+598">🇺🇾 +598</option>
                        <option value="+56">🇨🇱 +56</option>
                      </select>
                      <input type="tel" name="telefone" value={formData.telefone} onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999" style={{ ...inputStyle, flex: 1 }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#3a413d', display: 'block', marginBottom: '0.35rem' }}>Nome completo</label>
                    <input type="text" name="nome_completo" value={formData.nome_completo} onChange={handleInputChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#3a413d', display: 'block', marginBottom: '0.35rem' }}>Data de nascimento</label>
                    <input type="text" placeholder="DD/MM/AAAA" value={formData.data_nascimento} onChange={handleDobChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#3a413d', display: 'block', marginBottom: '0.35rem' }}>Contato de emergência</label>
                    <input type="text" name="contato_emergencia" placeholder="Nome e telefone" value={formData.contato_emergencia} onChange={handleInputChange} style={inputStyle} />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#3a413d', display: 'block', marginBottom: '0.35rem' }}>Data</label>
                    <input type="text" value={formData.data_assinatura} readOnly style={{ ...inputStyle, background: '#f5f3ef', color: '#666' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#3a413d' }}>Assinatura</label>
                      <button type="button" onClick={clearSignature}
                        style={{ fontSize: '0.78rem', color: '#8b7e66', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem' }}>
                        Limpar
                      </button>
                    </div>
                    <div style={{ border: `2px solid ${hasSignature ? '#2d4a3e' : '#d4cbb8'}`, borderRadius: '8px', background: '#fafaf8', overflow: 'hidden', position: 'relative' }}>
                      <canvas
                        ref={canvasRef}
                        style={{ display: 'block', width: '100%', height: '160px', cursor: 'crosshair' }}
                        onMouseDown={canvasStart}
                        onMouseMove={canvasDraw}
                        onMouseUp={canvasEnd}
                        onMouseLeave={canvasEnd}
                        onTouchStart={canvasStart}
                        onTouchMove={canvasDraw}
                        onTouchEnd={canvasEnd}
                      />
                      {!hasSignature && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                          <span style={{ fontSize: '0.82rem', color: '#b0a898' }}>Desenhe sua assinatura aqui</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>)}

            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e5dfd3' }}>
              {currentIdx > 0 ? (
                <button type="button" onClick={goPrev} disabled={loading}
                  style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#555', border: '1px solid #d4cbb8', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                  ← Voltar
                </button>
              ) : <div />}

              <button type="button" onClick={goNext} disabled={loading || (currentStep === S.RISCOS && formData.sec5_duvidas)}
                style={{
                  padding: '0.75rem 2.25rem',
                  background: (currentStep === S.RISCOS && formData.sec5_duvidas) ? '#ccc' : '#2d4a3e',
                  color: '#fff', border: 'none', borderRadius: '6px',
                  cursor: (currentStep === S.RISCOS && formData.sec5_duvidas) ? 'not-allowed' : 'pointer',
                  fontWeight: '700', fontSize: '0.95rem',
                }}>
                {loading ? 'Salvando...' : currentStep === S.CONFIRMACAO ? 'Finalizar e Assinar' : 'Próximo →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
