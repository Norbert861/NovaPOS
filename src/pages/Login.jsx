import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, Eye, EyeOff, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const navigate  = useNavigate();

  const [email,   setEmail]   = useState('');
  const [pin,     setPin]     = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email.trim().toLowerCase(), pin);
      if (result && result.ok) {
        navigate('/');
      } else {
        setError(result?.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon" style={{ width: 48, height: 48 }}>
            <Baby size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.1 }}>Nova POS</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Baby Care Retail System</p>
          </div>
        </div>

        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>Welcome back</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to continue
          </p>
        </div>

        {error && (
          <div className="alert-banner danger">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@novapos.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="pin">PIN</label>
            <div style={{ position: 'relative' }}>
              <input
                id="pin"
                type={showPin ? 'text' : 'password'}
                className="input"
                placeholder="Enter your PIN"
                value={pin}
                onChange={e => setPin(e.target.value)}
                required
                maxLength={6}
                inputMode="numeric"
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPin(v => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
                }}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : <><LogIn size={17} /> Sign In</>}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div style={{
          background: 'var(--background)', borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)',
        }}>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Demo Accounts
          </p>
          <p>Owner: sarah@novapos.com / PIN: 1234</p>
          <p>Cashier: jennifer@novapos.com / PIN: 5678</p>
          <p>Inventory: kofi@novapos.com / PIN: 9012</p>
        </div>
      </div>
    </div>
  );
}
