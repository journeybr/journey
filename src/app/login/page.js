'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Erro ao entrar: ' + error.message);
    } else {
      router.push('/events');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ee', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ background: '#1a1714', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: "'IM Fell English', serif", fontSize: '20px', color: '#f7f4ee', fontWeight: 400 }}>
          Journey<span style={{ color: '#4a7a5a' }}>.</span>
        </span>
      </nav>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <h1 style={{ fontFamily: "'IM Fell English', serif", fontSize: '32px', fontWeight: 400, color: '#3a3530', margin: '0 0 2rem', textAlign: 'center' }}>
            login
          </h1>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8278', display: 'block', marginBottom: '6px' }}>
                e-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', fontFamily: "'Courier Prime', monospace", fontSize: '13px', color: '#3a3530', background: '#fdfbf7', border: '0.5px solid #c8c2b8', borderRadius: '2px', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "'Courier Prime', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8278', display: 'block', marginBottom: '6px' }}>
                senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', fontFamily: "'Courier Prime', monospace", fontSize: '13px', color: '#3a3530', background: '#fdfbf7', border: '0.5px solid #c8c2b8', borderRadius: '2px', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: '0.5rem', fontFamily: "'Courier Prime', monospace", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f7f4ee', background: '#3a3530', border: 'none', borderRadius: '2px', padding: '12px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'entrando...' : 'entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
