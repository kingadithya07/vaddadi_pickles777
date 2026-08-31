import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Icon } from '../components/Icons';

export default function Login() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { login, register, toast } = useApp();
  const isAdminLogin = params.get('role') === 'admin';
  const next = params.get('next');

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const user =
        mode === 'login'
          ? await login({ email: form.email, password: form.password, role: isAdminLogin ? 'admin' : 'customer' })
          : await register(form);
      toast(`Welcome, ${user.name.split(' ')[0]}!`, 'ok');
      nav(next || (user.role === 'admin' ? '/admin' : '/account'), { replace: true });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const fill = (email, password) => setForm((f) => ({ ...f, email, password }));

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <span className="eyebrow">◆ Vaddadi Pickles</span>
        <h2>{isAdminLogin ? 'Admin control room' : 'Welcome back to the jaadi.'}</h2>
        <p style={{ color: '#f0d9c9', lineHeight: 1.7, maxWidth: '44ch' }}>
          {isAdminLogin
            ? 'Manage the catalogue, weight-wise pricing, live stock and every order placed across India.'
            : 'Sign in to save multiple delivery addresses, verify PIN codes with India Post and track every jar you order.'}
        </p>
        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Save unlimited delivery addresses with PIN verification</li>
          <li>Reorder your favourite 250 g / 500 g / 1 kg jars in a tap</li>
          <li>Live order tracking from Placed to Delivered</li>
        </ul>
      </div>

      <div className="auth-form">
        <div className="auth-card">
          <Link to="/" className="brand" style={{ marginBottom: 4 }}>
            <img className="brand-logo" src="/brand/vaddadi-mark.png" alt="" width="211" height="220" style={{ height: 72 }} />
            <span className="brand-word">
              <span className="brand-name" style={{ fontSize: 27 }}>Vaddadi&nbsp;Pickles</span>
              <span className="brand-tag">Sujathanagar · Visakhapatnam</span>
            </span>
          </Link>

          {isAdminLogin ? (
            <div className="alert alert-info row gap-8">
              <Icon.Shield width={16} height={16} /> Administrator sign-in
            </div>
          ) : (
            <div className="tabs">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button>
            </div>
          )}

          <form className="stack gap-14" onSubmit={submit}>
            {err && <div className="alert alert-err">{err}</div>}

            {mode === 'register' && (
              <>
                <div className="field">
                  <label>Full name</label>
                  <input className="input" value={form.name} onChange={set('name')} placeholder="Sita Rama Raju" required />
                </div>
                <div className="field">
                  <label>Mobile number</label>
                  <input className="input" value={form.phone} onChange={set('phone')} placeholder="9000012345" maxLength={10} />
                </div>
              </>
            )}

            <div className="field">
              <label>Email address</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>

            <div className="field">
              <label>Password</label>
              <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
            </div>

            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create my account'}
            </button>
          </form>

          <div className="demo-box">
            <b>Demo accounts</b>
            <div className="row gap-8" style={{ marginTop: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setMode('login'); fill('customer@vaddadipickles.in', 'customer123'); }}>
                Use customer login
              </button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setMode('login'); fill('admin@vaddadipickles.in', 'admin123'); }}>
                Use admin login
              </button>
            </div>
            <div style={{ marginTop: 8 }}>
              customer@vaddadipickles.in / customer123<br />
              admin@vaddadipickles.in / admin123
            </div>
          </div>

          <p className="small center muted">
            {isAdminLogin ? (
              <Link to="/login">← Customer sign-in</Link>
            ) : (
              <Link to="/login?role=admin">Are you an administrator? Sign in here →</Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
