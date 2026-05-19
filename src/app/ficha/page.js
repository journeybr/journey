'use client';

import React, { useState, useEffect, Fragment } from 'react';
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
  'Pantoprazol', 'Loratadina', 'Desloratadina', 'Allegra', 'Fexofenadina', 'Prednisona', 'Dexametasona'
].sort();

export default function PublicFicha() {
  const [contactId, setContactId] = useState(null);
  const [isGenericLink, setIsGenericLink] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [medications, setMedications] = useState([]);
  const [currentMed, setCurrentMed] = useState('');
  const [currentDosage, setCurrentDosage] = useState('');
  const [currentFreq, setCurrentFreq] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [formData, setFormData] = useState({
    sec1_maioridade: false,
    sec1_voluntaria: false,
    sec1_leitura: false,
    sec1_leitura_nao_li: false,
    sec1_instrucoes: false,
    sec1_conforto: false,
    
    sec2_esquizofrenia: false,
    sec2_psicose_familiar: false,
    sec2_condicoes_instaveis: false,
    sec2_ideacao: false,
    sec2_raiva: false,
    sec2_historico_nao_informado: false,
    sec2_historico_obs: '',
    
    sec3_cushing: false,
    sec3_incapacitantes: false,
    sec3_cardio: false,
    sec3_neuro: false,
    sec3_obs: '',
    
    sec4_compromisso_informar: false,
    sec4_experiencias_recentes: false,
    sec4_interacoes: false,
    sec4_contraindicados: false,
    sec4_dependencia: false,
    sec4_abstinencia: false,
    sec4_substancias_nao_autorizadas: false,
    sec4_psicoativas_obs: '',
    
    sec5_processos_intensos: false,
    sec5_sem_garantia: false,
    sec5_riscos: false,
    sec5_informacoes_suficientes: false,
    sec5_veracidade: false,
    sec5_responsabilidade_conduta: false,
    sec5_omissoes: false,
    sec5_limitacao: false,
    sec5_duvidas: false,
    
    sec6_leitura_integral: false,
    sec6_veracidade_final: false,
    nome_completo: '',
    data_nascimento: '',
    cpf: '',
    telefone: '',
    contato_emergencia: '',
    data_assinatura: new Date().toLocaleDateString('pt-BR'),
    assinatura: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');

      if (idParam) {
        const loadContact = async () => {
          const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', idParam)
            .single();

          if (data && !error) {
            setContactId(idParam);
            setIsGenericLink(false);
            
            // Popula os dados já existentes
            let formattedPhone = data.phone || '';
            let formattedCpf = data.cpf || '';
            
            if (data.medical_form_step) {
              setCurrentStep(Math.min(data.medical_form_step, 6));
            }
            if (data.medications_list) {
              setMedications(data.medications_list);
            }
            if (data.medical_form_data && Object.keys(data.medical_form_data).length > 0) {
              setFormData(prev => ({ ...prev, ...data.medical_form_data }));
            } else {
              setFormData(prev => ({ ...prev, nome_completo: data.name || '', telefone: formattedPhone, cpf: formattedCpf }));
            }
          }
        };
        loadContact();
      }
    }
  }, []);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cpf') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length > 9) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
      else if (value.length > 6) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
      else if (value.length > 3) value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    
    if (name === 'telefone' || name === 'contato_emergencia') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length > 10) value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      else if (value.length > 6) value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
      else if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      else if (value.length > 0) value = `(${value.slice(0, 2)}`;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMedNameChange = (e) => {
    const val = e.target.value;
    setCurrentMed(val);
    if (val.trim() === '') {
      setSuggestions([]);
    } else {
      const filtered = MEDICATIONS_DATABASE.filter(m => m.toLowerCase().startsWith(val.toLowerCase())).slice(0, 5);
      setSuggestions(filtered);
    }
  };

  const addMedication = () => {
    if (!currentMed.trim()) return;
    setMedications([...medications, { name: currentMed.trim(), dosage: currentDosage.trim(), frequency: currentFreq.trim() }]);
    setCurrentMed('');
    setCurrentDosage('');
    setCurrentFreq('');
    setSuggestions([]);
  };

  const saveProgress = async (stepToSave, isFinalSubmit = false) => {
    setLoading(true);
    try {
      const payload = {
        medical_form_step: stepToSave,
        medical_form_data: formData,
        medications_list: medications
      };

      let activeContactId = contactId;

      if (!activeContactId && !isFinalSubmit) {
        // 1. Criação do Contato Anônimo (Step Inicial via Link Genérico)
        const { data, error } = await supabase.from('contacts').insert([{
          name: formData.nome_completo || 'Visitante Não Identificado',
          status: 'Ficha em Preenchimento',
          avisar: 'Sempre',
          experiences_count: 0,
          ...payload
        }]).select();
        
        if (error) throw error;
        if (data && data[0]) {
          activeContactId = data[0].id;
          setContactId(activeContactId);
        }
      } else if (activeContactId && !isFinalSubmit) {
        // 2. Atualização incremental (Steps 2 a 5)
        const { error } = await supabase.from('contacts').update(payload).eq('id', activeContactId);
        if (error) throw error;
      } else if (isFinalSubmit) {
        // 3. STEP 6 - Cruzamento de Dados e Submissão Final
        const cleanPhone = formData.telefone.replace(/\D/g, '');
        const cleanCpf = formData.cpf.replace(/\D/g, '');
        
        let matchedExistingId = null;
        let existingObs = '';
        
        // Tenta cruzar caso seja um link genérico ou quisermos garantir unificação
        if (isGenericLink) {
          // A. Cruzamento por Telefone Exato
          let { data: phoneMatches } = await supabase.from('contacts').select('id, observations').eq('phone', cleanPhone);
          phoneMatches = phoneMatches?.filter(m => m.id !== activeContactId) || [];
          
          if (phoneMatches.length > 0) {
            matchedExistingId = phoneMatches[0].id;
            existingObs = phoneMatches[0].observations || '';
          } else {
            // B. Cruzamento por Telefone Parcial (últimos 9 dígitos)
            const last9 = cleanPhone.slice(-9);
            if (last9.length >= 8) {
              let { data: partialPhone } = await supabase.from('contacts').select('id, observations').ilike('phone', `%${last9}%`);
              partialPhone = partialPhone?.filter(m => m.id !== activeContactId) || [];
              if (partialPhone.length > 0) {
                matchedExistingId = partialPhone[0].id;
                existingObs = partialPhone[0].observations || '';
              }
            }
          }
          
          // C. Cruzamento por CPF
          if (!matchedExistingId && cleanCpf) {
            let { data: cpfMatches } = await supabase.from('contacts').select('id, observations').eq('cpf', cleanCpf);
            cpfMatches = cpfMatches?.filter(m => m.id !== activeContactId) || [];
            if (cpfMatches.length > 0) {
              matchedExistingId = cpfMatches[0].id;
              existingObs = cpfMatches[0].observations || '';
            }
          }
        }
        
        payload.name = formData.nome_completo;
        payload.cpf = cleanCpf;
        payload.phone = formData.telefone;
        payload.remedio = medications.length > 0 ? 'em andamento' : 'não';
        // Quando finalizar o form, o step pode ir para 7 indicando 100% completo, ou manter no 6.
        payload.medical_form_step = 6; 
        
        const medicalNote = `[Ficha Médica Completa via Wizard]\n\nContato de Emergência: ${formData.contato_emergencia}\nData de Nascimento: ${formData.data_nascimento}\n\nObservações Médicas: ${formData.sec3_obs}\nHistórico Psiquiátrico: ${formData.sec2_historico_obs}\nSubstâncias Recentes: ${formData.sec4_psicoativas_obs}`;
        payload.observations = existingObs ? `${existingObs}\n\n${medicalNote}` : medicalNote;
        
        if (matchedExistingId) {
          // MATCH ENCONTRADO: Atualiza o contato real e apaga o temporário anônimo!
          const { error: updateReal } = await supabase.from('contacts').update(payload).eq('id', matchedExistingId);
          if (updateReal) throw updateReal;
          
          if (activeContactId) {
             await supabase.from('contacts').delete().eq('id', activeContactId);
          }
        } else {
          // NENHUM MATCH: Converte o temporário anônimo no perfil oficial!
          if (activeContactId) {
             const { error: finalUpdate } = await supabase.from('contacts').update(payload).eq('id', activeContactId);
             if (finalUpdate) throw finalUpdate;
          } else {
             // Caso raríssimo de falha de gravação no Step 1, força criação.
             await supabase.from('contacts').insert([{ ...payload, status: 'Prospecto', avisar: 'Sempre', experiences_count: 0 }]);
          }
        }
      }

      if (isFinalSubmit) {
        setSubmitted(true);
      } else {
        setCurrentStep(stepToSave);
      }
    } catch (err) {
      alert('Erro ao salvar progresso: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Basic validation per step can be added here
    saveProgress(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (!formData.nome_completo || !formData.cpf || !formData.telefone || !formData.assinatura) {
      alert("Por favor, preencha os campos obrigatórios (Nome, CPF, Telefone e Assinatura).");
      return;
    }
    saveProgress(6, true);
  };

  const renderCheckbox = (name, label, options = {}) => (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', padding: '1rem', background: '#faf9f6', border: '1px solid #e5dfd3', borderRadius: '8px', transition: 'all 0.2s', ...(options.style || {}) }}>
      <input type="checkbox" name={name} checked={formData[name]} onChange={handleCheckboxChange} style={{ width: '22px', height: '22px', accentColor: '#2d4a3e', marginTop: '0.2rem', flexShrink: 0 }} />
      <span style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5' }}>{label}</span>
    </label>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f6f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#3a413d' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 600px) {
          .responsive-card { padding: 1.5rem !important; }
        }
        .step-transition { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
      <div className="responsive-card" style={{ background: '#ffffff', border: '1px solid #d4cbb8', borderRadius: '20px', padding: '3rem', width: '100%', maxWidth: '650px', boxShadow: '0 16px 40px rgba(139, 126, 102, 0.08)' }}>
        
        {submitted ? (
          <div className="step-transition" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', color: '#2d4a3e', marginBottom: '1.5rem' }}>✓</div>
            <h2 style={{ color: '#2d4a3e', marginBottom: '1rem', fontSize: '1.6rem', fontWeight: '600' }}>Ficha Concluída e Assinada!</h2>
            <p style={{ color: '#5a605c', lineHeight: '1.6', fontSize: '0.95rem' }}>Suas declarações foram gravadas com sucesso. Agradecemos sua total transparência.</p>
          </div>
        ) : (
          <div className="step-transition">
            {/* Header / Progresso */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#8b7e66', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', marginBottom: '0.5rem' }}>Formulário Oficial de Anamnese</div>
              <h1 style={{ fontSize: '1.8rem', color: '#2d4a3e', fontWeight: '700', margin: 0 }}>Etapa {currentStep} de 6</h1>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '1.5rem' }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ height: '4px', flex: 1, maxWidth: '40px', borderRadius: '2px', background: i <= currentStep ? '#2d4a3e' : '#e5dfd3', transition: 'background 0.3s' }} />
                ))}
              </div>
            </div>

            <form onSubmit={currentStep === 6 ? submitForm : (e) => { e.preventDefault(); nextStep(); }}>
              
              {currentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#1a1a1a' }}>1. Declaração Inicial</h3>
                  {renderCheckbox('sec1_maioridade', 'Confirmo ter maioridade e capacidade legal para responder este questionário.')}
                  {renderCheckbox('sec1_voluntaria', 'Confirmo minha participação voluntária e consciente na vivência.')}
                  {renderCheckbox('sec1_leitura', 'Li o documento completo de preparação enviado pela organização.')}
                  {renderCheckbox('sec1_leitura_nao_li', 'Não li o documento de preparação ainda, mas me comprometo a fazê-lo.', { style: { background: '#fff9e6' } })}
                  {renderCheckbox('sec1_instrucoes', 'Comprometo-me a seguir todas as instruções da equipe de guias.')}
                  {renderCheckbox('sec1_conforto', 'Sinto conforto e aceito a responsabilidade pela autorreflexão e comunicação honesta das minhas emoções.')}
                </div>
              )}

              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#1a1a1a' }}>2. Saúde Mental e Histórico Psiquiátrico</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Confirmo a AUSÊNCIA das seguintes condições abaixo:</p>
                  {renderCheckbox('sec2_esquizofrenia', 'Esquizofrenia, transtornos psicóticos, bipolaridade tipo I ou II, transtornos de personalidade (borderline, narcisista, esquizoide).')}
                  {renderCheckbox('sec2_psicose_familiar', 'Histórico familiar direto de esquizofrenia ou psicose.')}
                  {renderCheckbox('sec2_condicoes_instaveis', 'Condições mentais instáveis ou agudas no momento.')}
                  {renderCheckbox('sec2_ideacao', 'Ideação suicida ou homicida recente.')}
                  {renderCheckbox('sec2_raiva', 'Problemas graves de controle de raiva ou impulsividade.')}
                  
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5dfd3' }}>
                    {renderCheckbox('sec2_historico_nao_informado', 'Possuo histórico psiquiátrico ou condição relevante não citada acima que precisa ser informada.', { style: { background: '#fcfaf6' } })}
                    {formData.sec2_historico_nao_informado && (
                      <textarea
                        name="sec2_historico_obs"
                        value={formData.sec2_historico_obs}
                        onChange={handleInputChange}
                        placeholder="Descreva aqui o histórico ou condição em detalhes..."
                        style={{ width: '100%', minHeight: '100px', padding: '1rem', marginTop: '1rem', border: '1px solid #d4cbb8', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#1a1a1a' }}>3. Saúde Física e Histórico Médico</h3>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Confirmo a AUSÊNCIA das seguintes condições médicas:</p>
                  {renderCheckbox('sec3_cushing', 'Síndrome de Cushing.')}
                  {renderCheckbox('sec3_incapacitantes', 'Condições médicas graves e incapacitantes.')}
                  {renderCheckbox('sec3_cardio', 'Doenças cardiovasculares graves, hipertensão não controlada, aneurisma ou arritmias.')}
                  {renderCheckbox('sec3_neuro', 'Distúrbios neurológicos graves (AVC, epilepsia crônica, convulsões recentes, lesão cerebral).')}
                  
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#3a413d', display: 'block', marginBottom: '0.5rem' }}>Observações Físicas / Cirurgias Recentes (Opcional)</label>
                    <textarea
                      name="sec3_obs"
                      value={formData.sec3_obs}
                      onChange={handleInputChange}
                      placeholder="Alguma alergia severa, limitação de mobilidade ou observação relevante?"
                      style={{ width: '100%', minHeight: '100px', padding: '1rem', border: '1px solid #d4cbb8', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>4. Substâncias, Medicamentos e Suplementos</h3>
                  {renderCheckbox('sec4_compromisso_informar', 'Comprometo-me a informar absolutamente tudo que uso ou usei no último mês (mesmo ocasional, natural ou recreativo).')}
                  {renderCheckbox('sec4_experiencias_recentes', 'Tenho experiências recentes com psicodélicos ou medicinas (ayahuasca, psilocibina, LSD, MDMA, DMT, mescalina, iboga, cannabis, rapé, sananga, ketamina, microdosagens).')}
                  {renderCheckbox('sec4_interacoes', 'Estou ciente sobre as interações e riscos severos entre certas medicações e experiências profundas.')}
                  {renderCheckbox('sec4_contraindicados', 'Confirmo a ausência de uso de medicamentos estritamente contraindicados (sem o aval e plano de desmame médico).')}
                  {renderCheckbox('sec4_dependencia', 'Declaro ausência de histórico de dependência química grave atualmente sem acompanhamento.')}
                  {renderCheckbox('sec4_abstinencia', 'Comprometo-me a realizar abstinência de substâncias não acordadas 72h antes da experiência.')}
                  {renderCheckbox('sec4_substancias_nao_autorizadas', 'Comprometo-me a NÃO portar ou utilizar substâncias não autorizadas durante a vivência.')}
                  
                  <div style={{ background: '#f5f3ef', padding: '1.5rem', borderRadius: '8px', border: '1px solid #d4cbb8', marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2d4a3e', display: 'block', marginBottom: '1rem' }}>Medicamentos de Uso Contínuo e Suplementos</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <input type="text" placeholder="Nome do remédio..." value={currentMed} onChange={handleMedNameChange} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px' }} />
                        {suggestions.length > 0 && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', zIndex: 10, borderRadius: '6px', overflow: 'hidden' }}>
                            {suggestions.map((s, i) => (
                              <div key={i} onClick={() => {setCurrentMed(s); setSuggestions([])}} style={{ padding: '0.8rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{s}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input type="text" placeholder="Dose (ex: 50mg)" value={currentDosage} onChange={e => setCurrentDosage(e.target.value)} style={{ flex: '1 1 100px', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px' }} />
                      <input type="text" placeholder="Frequência (ex: 1x ao dia)" value={currentFreq} onChange={e => setCurrentFreq(e.target.value)} style={{ flex: '1 1 120px', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px' }} />
                      <button type="button" onClick={addMedication} style={{ padding: '0.8rem 1.5rem', background: '#2d4a3e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Adicionar</button>
                    </div>
                    {medications.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {medications.map((m, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: '#fff', borderLeft: '3px solid #2d4a3e', borderRadius: '4px' }}>
                            <div><strong>{m.name}</strong> <span style={{ fontSize: '0.8rem', color: '#666' }}>({m.dosage} - {m.frequency})</span></div>
                            <button type="button" onClick={() => setMedications(medications.filter((_, i) => i !== idx))} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>Remover</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#3a413d', display: 'block', marginBottom: '0.5rem' }}>Substâncias Psicoativas usadas no último mês</label>
                    <textarea
                      name="sec4_psicoativas_obs"
                      value={formData.sec4_psicoativas_obs}
                      onChange={handleInputChange}
                      placeholder="Descreva a substância, data, dose, contexto e reações (caso tenha marcado a caixa de experiências recentes)."
                      style={{ width: '100%', minHeight: '100px', padding: '1rem', border: '1px solid #d4cbb8', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#1a1a1a' }}>5. Ciência sobre Riscos e Responsabilidades</h3>
                  {renderCheckbox('sec5_processos_intensos', 'Estou ciente de que podem ocorrer processos emocionais profundos, intensos, além de desconforto físico/psicológico, náuseas ou confusão.')}
                  {renderCheckbox('sec5_sem_garantia', 'Reconheço que não há garantia de resultado terapêutico ou espiritual específico.')}
                  {renderCheckbox('sec5_riscos', 'Reconheço a existência de riscos físicos e emocionais intrínsecos à vivência.')}
                  {renderCheckbox('sec5_informacoes_suficientes', 'Recebi informações suficientes para tomar esta decisão de forma autônoma e consciente.')}
                  {renderCheckbox('sec5_veracidade', 'Assumo total responsabilidade legal e moral pela veracidade das informações fornecidas nestas etapas.')}
                  {renderCheckbox('sec5_responsabilidade_conduta', 'Assumo responsabilidade integral pela minha conduta antes, durante e após o evento.')}
                  {renderCheckbox('sec5_omissoes', 'Estou ciente de que a omissão de dados psiquiátricos, médicos ou uso de substâncias aumenta severamente os riscos.')}
                  {renderCheckbox('sec5_limitacao', 'Compreendo a limitação de responsabilidade dos organizadores na máxima extensão legal permitida.')}
                  {renderCheckbox('sec5_duvidas', 'Ainda tenho dúvidas ou receios e desejo conversar com a equipe antes de assinar definitivamente.', { style: { background: '#fff9e6' } })}
                </div>
              )}

              {currentStep === 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>6. Confirmação Final de Identidade</h3>
                  
                  {renderCheckbox('sec6_leitura_integral', 'Confirmo a leitura integral deste termo.')}
                  {renderCheckbox('sec6_veracidade_final', 'Declaro sob as penas da lei a veracidade incondicional de todas as informações.')}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Nome Completo *</label>
                      <input required type="text" name="nome_completo" value={formData.nome_completo} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px', marginTop: '0.3rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>CPF *</label>
                      <input required type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px', marginTop: '0.3rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Data de Nascimento *</label>
                      <input required type="text" placeholder="DD/MM/AAAA" name="data_nascimento" value={formData.data_nascimento} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px', marginTop: '0.3rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Telefone / WhatsApp *</label>
                      <input required type="text" name="telefone" value={formData.telefone} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px', marginTop: '0.3rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Contato de Emergência</label>
                      <input type="text" placeholder="(Nome e Telefone)" name="contato_emergencia" value={formData.contato_emergencia} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px', marginTop: '0.3rem' }} />
                    </div>
                    <div style={{ gridColumn: '1 / span 2', marginTop: '1rem', padding: '1.5rem', background: '#fcfaf6', border: '1px dashed #d4cbb8', borderRadius: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2d4a3e' }}>Assinatura Eletrônica (Digite seu nome completo como assinatura) *</label>
                      <input required type="text" name="assinatura" placeholder="Escreva seu nome de punho eletrônico..." value={formData.assinatura} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', border: '1px solid #8b7e66', borderRadius: '6px', marginTop: '0.8rem', fontStyle: 'italic', fontFamily: 'serif', fontSize: '1.1rem' }} />
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', textAlign: 'right' }}>Assinado e datado em: {formData.data_assinatura}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Controles de Navegação */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5dfd3' }}>
                {currentStep > 1 ? (
                  <button type="button" onClick={prevStep} disabled={loading} style={{ padding: '0.8rem 1.8rem', background: 'transparent', color: '#555', border: '1px solid #d4cbb8', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    ← Voltar
                  </button>
                ) : <div />}
                
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ padding: '0.8rem 2.5rem', background: '#2d4a3e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.3s' }}
                >
                  {loading ? 'Salvando...' : (currentStep === 6 ? 'Finalizar e Assinar' : 'Próximo →')}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
