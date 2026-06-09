'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const s = {
  page: { minHeight: '100vh', background: '#f7f4ee', fontFamily: "'Courier Prime', monospace", color: '#3a3530' },
  nav: { position: 'sticky', top: 0, zIndex: 100, background: '#3a3530', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' },
  navBrand: { fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#f7f4ee', fontWeight: 400, textDecoration: 'none' },
  content: { padding: '2rem 2.5rem 4rem', maxWidth: '640px', margin: '0 auto' },
  label: { fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', display: 'block', marginBottom: '4px' },
  input: { fontFamily: "'Courier Prime', monospace", fontSize: '13px', color: '#3a3530', background: '#fdfbf7', border: '0.5px solid #c8c2b8', borderRadius: '2px', padding: '7px 10px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  btn: { fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', border: '0.5px solid #3a3530', background: '#3a3530', color: '#f7f4ee', padding: '7px 16px', borderRadius: '2px', cursor: 'pointer' },
  btnGhost: { fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', border: '0.5px dashed #b8b0a4', background: 'transparent', color: '#7a7268', padding: '4px 10px', borderRadius: '2px', cursor: 'pointer' },
  btnDanger: { fontFamily: "'Courier Prime', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', border: '0.5px dashed #c47a7a', background: 'transparent', color: '#a05050', padding: '4px 10px', borderRadius: '2px', cursor: 'pointer' },
};

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState('');
  const router = useRouter();

  useEffect(() => { init(); }, []);

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    setCurrentUser(user);
    await loadUsers();
  }

  async function loadUsers() {
    setLoading(true);
    setError('');
    const token = await getToken();
    const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (!res.ok) { setError(json.error); setLoading(false); return; }
    setUsers(json.users.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    setAdding(true);
    setFeedback('');
    const token = await getToken();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: newEmail, password: newPassword }),
    });
    const json = await res.json();
    if (!res.ok) { setFeedback(`Erro: ${json.error}`); }
    else { setNewEmail(''); setNewPassword(''); setFeedback('Usuário criado com sucesso.'); await loadUsers(); }
    setAdding(false);
  }

  async function handleReset(userId) {
    if (!confirm('Enviar email de redefinição de senha?')) return;
    const token = await getToken();
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) alert(`Erro: ${json.error}`);
    else alert('Email de redefinição enviado.');
  }

  async function handleDelete(userId, email) {
    if (!confirm(`Remover o usuário ${email}? Esta ação não pode ser desfeita.`)) return;
    const token = await getToken();
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) alert(`Erro: ${json.error}`);
    else await loadUsers();
  }

  const fmtDate = (str) => new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.navBrand}>Journey<span style={{ color: '#4a7a5a' }}>.</span></a>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b0a898', background: 'none', border: '0.5px dashed #5a5248', padding: '4px 10px', cursor: 'pointer', borderRadius: '2px' }}
        >
          sair
        </button>
      </nav>

      <div style={s.content}>
        <div style={{ marginBottom: '2rem', paddingBottom: '1.2rem', borderBottom: '0.5px solid #d0cbc2' }}>
          <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: '36px', fontWeight: 400, color: '#3a3530', margin: 0 }}>
            Usuários
          </h1>
          <div style={{ fontSize: '10px', color: '#aaa49c', letterSpacing: '0.08em', marginTop: '4px' }}>
            gestão de acesso ao sistema
          </div>
        </div>

        {/* Add user form */}
        <form onSubmit={handleAdd} style={{ marginBottom: '2.5rem', padding: '1.2rem 1.4rem', border: '0.5px dashed #c8c2b8', borderRadius: '3px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7a7268', marginBottom: '1rem' }}>
            Adicionar usuário
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email@exemplo.com"
                style={s.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Senha inicial</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
                minLength={6}
                style={s.input}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
            <button type="submit" disabled={adding} style={s.btn}>
              {adding ? 'Criando...' : '+ Criar usuário'}
            </button>
            {feedback && (
              <span style={{ fontSize: '10px', color: feedback.startsWith('Erro') ? '#a05050' : '#5d9470', letterSpacing: '0.06em' }}>
                {feedback}
              </span>
            )}
          </div>
        </form>

        {/* Users list */}
        {error ? (
          <div style={{ padding: '1.5rem', border: '0.5px dashed #c47a7a', borderRadius: '3px', color: '#a05050', fontSize: '11px', lineHeight: 1.5 }}>
            <strong>Erro ao carregar usuários:</strong><br />{error}
            {error.includes('SERVICE_ROLE_KEY') && (
              <div style={{ marginTop: '0.75rem', color: '#7a7268', fontSize: '10px' }}>
                Adicione <code>SUPABASE_SERVICE_ROLE_KEY</code> nas variáveis de ambiente do Vercel (Settings → Environment Variables) e faça um novo deploy.
              </div>
            )}
          </div>
        ) : loading ? (
          <div style={{ color: '#aaa49c', fontSize: '11px', letterSpacing: '0.08em' }}>carregando...</div>
        ) : (
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#aaa49c', marginBottom: '0.75rem' }}>
              {users.length} usuário{users.length !== 1 ? 's' : ''}
            </div>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '0.5px dashed #ddd9cf', gap: '12px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: '#3a3530', fontFamily: "'IM Fell English', serif" }}>
                    {u.email}
                    {u.id === currentUser?.id && (
                      <span style={{ fontSize: '9px', color: '#5d9470', letterSpacing: '0.08em', marginLeft: '8px', fontFamily: "'Courier Prime', monospace" }}>você</span>
                    )}
                  </div>
                  <div style={{ fontSize: '9px', color: '#aaa49c', letterSpacing: '0.04em', marginTop: '2px' }}>
                    criado em {fmtDate(u.created_at)}
                    {u.last_sign_in_at && ` · último acesso ${fmtDate(u.last_sign_in_at)}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => handleReset(u.id)} style={s.btnGhost} title="Enviar link de redefinição de senha">
                    resetar senha
                  </button>
                  {u.id !== currentUser?.id && (
                    <button onClick={() => handleDelete(u.id, u.email)} style={s.btnDanger}>
                      remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
