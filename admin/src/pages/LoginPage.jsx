import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons, Icon } from '../lib/icons';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('remember_me') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(!!localStorage.getItem('remember_me'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      if (remember) localStorage.setItem('remember_me', email);
      else localStorage.removeItem('remember_me');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-brand">
            <div className="login-brand-icon">P</div>
            <h1>Portfolio CMS</h1>
            <p>Sign in to manage your portfolio dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <Icon path={Icons['eye-off']} size={18} /> : <Icon path={Icons.eye} size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="login-forgot">Forgot password?</a>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      <div className="login-right">
        <div className="login-right-bg" />
        <div className="login-right-content">
          <h2>Manage your portfolio with enterprise-grade tools</h2>
          <p>Everything you need to manage projects, track analytics, handle messages, and customize your portfolio.</p>
          <div className="login-right-features">
            <div className="login-right-feature">
              <Icon path={Icons.check} size={20} />
              Drag-and-drop page builder
            </div>
            <div className="login-right-feature">
              <Icon path={Icons.check} size={20} />
              Real-time analytics dashboard
            </div>
            <div className="login-right-feature">
              <Icon path={Icons.check} size={20} />
              SEO optimization tools
            </div>
            <div className="login-right-feature">
              <Icon path={Icons.check} size={20} />
              Theme & appearance customizer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
