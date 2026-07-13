'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

const nav = {
  nav: { position: 'sticky', top: 0, zIndex: 100, background: '#3a3530', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' },
  brand: { fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#f7f4ee', fontWeight: 400, textDecoration: 'none' },
  exit: { fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0a898', background: 'none', border: '0.5px dashed #5a5248', padding: '4px 10px', cursor: 'pointer', borderRadius: '2px' },
};

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

function PreviewModal({ title, content, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      <style>{previewStyles}</style>
      {/* Bar */}
      <div style={{ background: '#3a3530', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b0a898' }}>
          pré-visualização
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#b0a898', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
      </div>
      {/* Page simulation */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#fdfbf7' }}>
        <div style={{ borderBottom: '0.5px solid #e8e2d8', padding: '2.5rem 2rem 2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.8rem' }}>
            etapa inicial da cerimônia
          </div>
          <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: '2.4rem', fontWeight: 400, color: '#3a3530', margin: '0 0 0.5rem' }}>
            {title || 'Nome da Cerimônia'}
          </h1>
        </div>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
          <div className="prep-preview" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        <div style={{ borderTop: '0.5px solid #e8e2d8', padding: '1.5rem 2rem', textAlign: 'center' }}>
          <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '1.1rem', color: '#c8c2b8', fontStyle: 'italic' }}>✦ journey</span>
        </div>
      </div>
    </div>
  );
}

const empty = { title: '', content: '' };

export default function PreparationsPage() {
  const router = useRouter();
  const [texts, setTexts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login');
      else fetchTexts();
    });
  }, []);

  async function fetchTexts() {
    const { data } = await supabase.from('preparation_texts').select('id, title, created_at').order('created_at', { ascending: false });
    if (data) setTexts(data);
  }

  function openNew() { setForm(empty); setEditing('new'); }

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

  const Nav = () => (
    <nav style={nav.nav}>
      <a href="/events" style={nav.brand}>Journey<span style={{ color: '#4a7a5a' }}>.</span></a>
      <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={nav.exit}>sair</button>
    </nav>
  );

  if (editing !== null) {
    return (
      <div style={s.page}>
        <Nav />
        {preview && <PreviewModal title={form.title} content={form.content} onClose={() => setPreview(false)} />}
        <div style={s.content}>
          <button onClick={() => setEditing(null)} style={s.back}>← voltar à lista</button>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <h1 style={{ ...s.heading, margin: 0 }}>
              {editing === 'new' ? 'Novo texto de preparação' : 'Editar texto'}
            </h1>
            <button type="button" onClick={() => setPreview(true)} style={{ ...s.btn, ...s.btnGhost }}>
              ◎ visualizar
            </button>
          </div>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={s.label}>Título (será exibido na página)</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Preparação Retiro Outono 2026"
                style={s.input}
              />
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
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Nav />
      <div style={s.content}>
        <button onClick={() => router.push('/events')} style={s.back}>← voltar às cerimônias</button>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ ...s.heading, margin: 0 }}>Textos de Preparação</h1>
          <button onClick={openNew} style={{ ...s.btn, ...s.btnPrimary }}>+ novo texto</button>
        </div>

        {texts.length === 0 && (
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: '12px', color: '#aaa49c' }}>
            Nenhum texto criado ainda.
          </p>
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
      </div>

      {preview && <PreviewModal title={form.title} content={form.content} onClose={() => setPreview(false)} />}
    </div>
  );
}
