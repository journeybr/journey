'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

// ─── Estilos compartilhados ────────────────────────────────────────────────

const navStyle = { position: 'sticky', top: 0, zIndex: 100, background: '#3a3530', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' };
const brandStyle = { fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#f7f4ee', fontWeight: 400, textDecoration: 'none' };
const exitStyle = { fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0a898', background: 'none', border: '0.5px dashed #5a5248', padding: '4px 10px', cursor: 'pointer', borderRadius: '2px' };

const s = {
  page: { minHeight: '100vh', background: '#fdfbf7' },
  content: { padding: '2.5rem 2rem', maxWidth: '860px', margin: '0 auto' },
  back: { fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '1.4rem', display: 'flex', alignItems: 'center', gap: '6px' },
  heading: { fontFamily: "'IM Fell English', serif", fontSize: '2.2rem', fontWeight: 400, color: '#3a3530', margin: '0 0 2rem' },
  card: { border: '0.5px solid #ddd8d0', borderRadius: '2px', background: '#fdfbf7', padding: '1.2rem 1.4rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' },
  cardTitle: { fontFamily: "'IM Fell English', serif", fontSize: '1.15rem', color: '#3a3530' },
  cardMeta: { fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#aaa49c', marginTop: '3px' },
  btn: { fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px', borderRadius: '2px', cursor: 'pointer', border: 'none' },
  btnPrimary: { background: '#3a3530', color: '#f7f4ee' },
  btnGhost: { background: 'transparent', border: '0.5px dashed #c8c2b8', color: '#7a7268' },
  btnDanger: { background: 'transparent', border: '0.5px dashed #c07070', color: '#8B0000' },
  label: { display: 'block', fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a7268', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '8px 10px', background: '#faf7f0', border: '0.5px solid #c8c2b8', borderRadius: '2px', fontFamily: "'IM Fell English', serif", fontSize: '15px', color: '#3a3530', boxSizing: 'border-box', outline: 'none' },
};

const previewStyles = `
  @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
  .prep-preview { font-family:'IM Fell English',serif; font-size:16px; line-height:1.8; color:#3a3530; }
  .prep-preview h1 { font-family:'IM Fell English',serif; font-size:1.5rem; font-weight:400; color:#3a3530; margin:2rem 0 0.6rem; line-height:1.25; }
  .prep-preview h2 { font-family:'IM Fell English',serif; font-size:1.2rem; font-weight:400; color:#3a3530; margin:2rem 0 0.5rem; }
  .prep-preview h3 { font-family:'Courier Prime',monospace; font-size:13.5px; letter-spacing:0.14em; text-transform:uppercase; color:#7a7268; margin:2rem 0 0.4rem; }
  .prep-preview p { margin:0 0 1.4rem; }
  .prep-preview ul,.prep-preview ol { padding-left:1.5rem; margin:0 0 1rem; }
  .prep-preview li { margin-bottom:0.35rem; }
  .prep-preview blockquote { border-left:2px solid #c8c2b8; margin:1.2rem 0; padding:0.4rem 1.2rem; color:#8a7a6a; font-style:italic; }
  .prep-preview hr { border:none; border-top:0.5px solid #ddd8d0; margin:2rem 0; }
  .prep-preview strong { font-weight:700; }
  .prep-preview em { font-style:italic; }
  .prep-preview u { text-decoration:underline; }
`;

// ─── Preview Modal (textos) ────────────────────────────────────────────────

function PreviewModal({ title, content, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <style>{previewStyles}</style>
      <div style={{ background: '#3a3530', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b0a898' }}>pré-visualização</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#b0a898', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: '#fdfbf7' }}>
        <div style={{ borderBottom: '0.5px solid #e8e2d8', padding: '2.5rem 2rem 2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.8rem' }}>etapa inicial da cerimônia</div>
          <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: '2.4rem', fontWeight: 400, color: '#3a3530', margin: '0 0 0.5rem' }}>{title || 'Título'}</h1>
        </div>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
          <div className="prep-preview" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}

// ─── Aba: Imagens de Link ──────────────────────────────────────────────────

function ImagesTab() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(null);

  useEffect(() => { fetchImages(); }, []);

  async function fetchImages() {
    const { data } = await supabase.from('og_images').select('key, url, updated_at').order('key');
    if (data) setImages(data);
  }

  async function handleUpload(key, file) {
    if (!file) return;
    setUploading(key);
    try {
      const ext = file.name.split('.').pop();
      const path = `og-images/${key}.${ext}`;
      const { error: upErr } = await supabase.storage.from('event-images').upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw new Error(upErr.message);
      const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(path);
      const { error: dbErr } = await supabase.from('og_images').upsert({ key, url: publicUrl, updated_at: new Date().toISOString() });
      if (dbErr) throw new Error(dbErr.message);
      await fetchImages();
    } catch (err) {
      alert('Erro ao enviar imagem: ' + err.message);
    } finally {
      setUploading(null);
    }
  }

  const labels = {
    pagamento: 'Pagamento',
    ficha: 'Ficha de Triagem',
    preparacao: 'Preparação',
    pos_journey: 'Pós-Journey',
  };

  return (
    <div>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#aaa49c', marginBottom: '2rem', lineHeight: 1.6 }}>
        Estas imagens aparecem no preview quando um link é compartilhado no WhatsApp.
      </p>
      {images.filter(img => labels[img.key]).map(img => (
        <div key={img.key} style={{ ...s.card, alignItems: 'flex-start' }}>
          {/* Preview da imagem */}
          <div style={{ width: '100px', height: '70px', flexShrink: 0, border: '0.5px solid #ddd8d0', borderRadius: '2px', overflow: 'hidden', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {img.url
              ? <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '9px', color: '#c8c2b8', textAlign: 'center', padding: '4px' }}>sem imagem</span>
            }
          </div>
          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={s.cardTitle}>{labels[img.key] || img.key}</div>
            {img.updated_at && (
              <div style={s.cardMeta}>atualizada em {new Date(img.updated_at).toLocaleDateString('pt-BR')}</div>
            )}
          </div>
          {/* Upload */}
          <label style={{ ...s.btn, ...s.btnGhost, display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: uploading === img.key ? 0.6 : 1, cursor: uploading === img.key ? 'default' : 'pointer' }}>
            {uploading === img.key ? 'enviando…' : '↑ trocar imagem'}
            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={!!uploading} onChange={e => handleUpload(img.key, e.target.files?.[0])} />
          </label>
        </div>
      ))}
    </div>
  );
}

// ─── Aba: Textos de Preparação ─────────────────────────────────────────────

const emptyForm = { title: '', content: '' };

function TextsTab() {
  const [texts, setTexts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => { fetchTexts(); }, []);

  async function fetchTexts() {
    const { data } = await supabase.from('preparation_texts').select('id, title, created_at').order('created_at', { ascending: false });
    if (data) setTexts(data);
  }

  function openNew() { setForm(emptyForm); setEditing('new'); }

  async function openEdit(t) {
    const { data } = await supabase.from('preparation_texts').select('id, title, content').eq('id', t.id).single();
    if (data) { setForm({ title: data.title, content: data.content }); setEditing(data); }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editing === 'new') {
        const { error } = await supabase.from('preparation_texts').insert([{ title: form.title, content: form.content }]);
        if (error) { alert('Erro: ' + error.message); return; }
      } else {
        const { error } = await supabase.from('preparation_texts').update({ title: form.title, content: form.content }).eq('id', editing.id);
        if (error) { alert('Erro: ' + error.message); return; }
      }
      setEditing(null);
      fetchTexts();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este texto? As cerimônias vinculadas a ele ficarão sem página de preparação.')) return;
    await supabase.from('preparation_texts').delete().eq('id', id);
    fetchTexts();
  }

  async function handlePreviewFromList(t) {
    const { data } = await supabase.from('preparation_texts').select('title, content').eq('id', t.id).single();
    if (data) { setForm({ title: data.title, content: data.content }); setPreview(true); }
  }

  // Editing view
  if (editing !== null) {
    return (
      <>
        {preview && <PreviewModal title={form.title} content={form.content} onClose={() => setPreview(false)} />}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <button onClick={() => setEditing(null)} style={s.back}>← voltar à lista</button>
          <button type="button" onClick={() => setPreview(true)} style={{ ...s.btn, ...s.btnGhost }}>◎ visualizar</button>
        </div>
        <h2 style={{ fontFamily: "'IM Fell English', serif", fontSize: '1.6rem', fontWeight: 400, color: '#3a3530', margin: '0 0 1.5rem' }}>
          {editing === 'new' ? 'Novo texto de preparação' : 'Editar texto'}
        </h2>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={s.label}>Título (será exibido na página)</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Preparação Retiro Outono 2026" style={s.input} />
          </div>
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={s.label}>Conteúdo da página</label>
            <TiptapEditor content={form.content} onChange={html => setForm(f => ({ ...f, content: html }))} />
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button type="submit" disabled={saving} style={{ ...s.btn, ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'salvando…' : 'salvar'}
            </button>
            <button type="button" onClick={() => setEditing(null)} style={{ ...s.btn, ...s.btnGhost }}>cancelar</button>
          </div>
        </form>
      </>
    );
  }

  // List view
  return (
    <>
      {preview && <PreviewModal title={form.title} content={form.content} onClose={() => setPreview(false)} />}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <span />
        <button onClick={openNew} style={{ ...s.btn, ...s.btnPrimary }}>+ novo texto</button>
      </div>
      {texts.length === 0 && (
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#aaa49c' }}>Nenhum texto criado ainda.</p>
      )}
      {texts.map(t => (
        <div key={t.id} style={s.card}>
          <div>
            <div style={s.cardTitle}>{t.title}</div>
            <div style={s.cardMeta}>criado em {new Date(t.created_at).toLocaleDateString('pt-BR')}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button onClick={() => handlePreviewFromList(t)} style={{ ...s.btn, ...s.btnGhost }}>◎ ver</button>
            <button onClick={() => openEdit(t)} style={{ ...s.btn, ...s.btnGhost }}>editar</button>
            <button onClick={() => handleDelete(t.id)} style={{ ...s.btn, ...s.btnDanger }}>excluir</button>
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Aba: Modelos de Mensagem ──────────────────────────────────────────────

const VARS_HINT = '[nome] · [link] · [nome da cerimônia] · [data da cerimônia] · [dia inscrito]';

const TEMPLATE_CATEGORIES = [
  { value: 'convidar', label: 'Convidar' },
  { value: 'endereco', label: 'Endereço / Local' },
  { value: 'preparacao', label: 'Preparação' },
  { value: 'pagamento', label: 'Pagamento' },
  { value: 'ficha', label: 'Ficha de Triagem' },
];

const emptyTemplate = { name: '', category: '', content: '' };

function TemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTemplate);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTemplates(); }, []);

  async function fetchTemplates() {
    const { data } = await supabase.from('message_templates').select('id, name, category, updated_at, created_at').order('updated_at', { ascending: false });
    if (data) setTemplates(data);
  }

  function openNew() { setForm(emptyTemplate); setEditing('new'); }

  async function openEdit(t) {
    const { data } = await supabase.from('message_templates').select('id, name, category, content').eq('id', t.id).single();
    if (data) { setForm({ name: data.name, category: data.category || '', content: data.content }); setEditing(data); }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const now = new Date().toISOString();
    try {
      if (editing === 'new') {
        const { error } = await supabase.from('message_templates').insert([{ name: form.name, category: form.category, content: form.content, updated_at: now }]);
        if (error) { alert('Erro: ' + error.message); return; }
      } else {
        const { error } = await supabase.from('message_templates').update({ name: form.name, category: form.category, content: form.content, updated_at: now }).eq('id', editing.id);
        if (error) { alert('Erro: ' + error.message); return; }
      }
      setEditing(null);
      fetchTemplates();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este modelo?')) return;
    await supabase.from('message_templates').delete().eq('id', id);
    fetchTemplates();
  }

  if (editing !== null) {
    return (
      <>
        <button onClick={() => setEditing(null)} style={s.back}>← voltar à lista</button>
        <h2 style={{ fontFamily: "'IM Fell English', serif", fontSize: '1.6rem', fontWeight: 400, color: '#3a3530', margin: '0 0 1.5rem' }}>
          {editing === 'new' ? 'Novo modelo' : 'Editar modelo'}
        </h2>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.4rem' }}>
            <div>
              <label style={s.label}>Nome interno</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Preparação padrão" style={s.input} />
            </div>
            <div>
              <label style={s.label}>Categoria</label>
              <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...s.input, fontFamily: "'Courier Prime', monospace", fontSize: '12px' }}>
                <option value="" disabled>— escolha —</option>
                {TEMPLATE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={s.label}>Texto da mensagem</label>
            <textarea
              required
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={10}
              style={{ ...s.input, fontFamily: "'Courier Prime', monospace", fontSize: '13px', resize: 'vertical', lineHeight: 1.7 }}
            />
          </div>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', color: '#aaa49c', marginBottom: '1.4rem', letterSpacing: '0.05em' }}>
            Variáveis disponíveis: {VARS_HINT}
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button type="submit" disabled={saving} style={{ ...s.btn, ...s.btnPrimary, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'salvando…' : 'salvar'}
            </button>
            <button type="button" onClick={() => setEditing(null)} style={{ ...s.btn, ...s.btnGhost }}>cancelar</button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button onClick={openNew} style={{ ...s.btn, ...s.btnPrimary }}>+ novo modelo</button>
      </div>
      {templates.length === 0 && (
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#aaa49c' }}>Nenhum modelo criado ainda.</p>
      )}
      {templates.map(t => (
        <div key={t.id} style={s.card}>
          <div>
            <div style={s.cardTitle}>{t.name}</div>
            <div style={s.cardMeta}>
              {TEMPLATE_CATEGORIES.find(c => c.value === t.category)?.label || '—'} · {new Date(t.updated_at || t.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button onClick={() => openEdit(t)} style={{ ...s.btn, ...s.btnGhost }}>editar</button>
            <button onClick={() => handleDelete(t.id)} style={{ ...s.btn, ...s.btnDanger }}>excluir</button>
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────

const TABS = [
  { key: 'imagens', label: 'Imagens de Link' },
  { key: 'modelos', label: 'Modelos de Mensagem' },
  { key: 'textos', label: 'Textos de Preparação' },
];

export default function SettingsHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('imagens');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login');
      else setReady(true);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (!ready) return null;

  return (
    <div style={s.page}>
      <nav style={navStyle}>
        <a href="/events" style={brandStyle}>Journey<span style={{ color: '#4a7a5a' }}>.</span></a>
        <button onClick={handleSignOut} style={exitStyle}>sair</button>
      </nav>

      <div style={s.content}>
        <button onClick={() => router.push('/events')} style={s.back}>← voltar às cerimônias</button>
        <h1 style={s.heading}>Configurações</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid #ddd8d0', marginBottom: '2rem' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #3a3530' : '2px solid transparent',
                color: activeTab === tab.key ? '#3a3530' : '#aaa49c',
                padding: '0.5rem 1.2rem 0.7rem',
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'imagens' && <ImagesTab />}
        {activeTab === 'modelos' && <TemplatesTab />}
        {activeTab === 'textos' && <TextsTab />}
      </div>
    </div>
  );
}
