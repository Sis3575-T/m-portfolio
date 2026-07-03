import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons, Icon } from '../lib/icons';
import axios from 'axios';
import '../LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('remember_me') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(!!localStorage.getItem('remember_me'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(() => isLocal ? '' : (localStorage.getItem('api_url') || ''));
  const [serverStatus, setServerStatus] = useState('');
  const [errorDetail, setErrorDetail] = useState('');

  const testConnection = async () => {
    if (!serverUrl) return;
    setServerStatus('testing');
    setErrorDetail('');
    try {
      const baseUrl = serverUrl.replace(/\/api$/, '').replace(/\/+$/, '');
      const { data } = await axios.get(baseUrl + '/api/health');
      if (data.success) {
        if (!isLocal) localStorage.setItem('api_url', baseUrl + '/api');
        setServerStatus('connected');
      } else {
        setServerStatus('disconnected');
      }
    } catch (e) {
      setServerStatus('disconnected');
      setErrorDetail(e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetail('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (serverUrl && !isLocal) {
        const baseUrl = serverUrl.replace(/\/api$/, '').replace(/\/+$/, '');
        localStorage.setItem('api_url', baseUrl + '/api');
      }
      await login(email, password);
      if (remember) localStorage.setItem('remember_me', email);
      else localStorage.removeItem('remember_me');
      navigate('/admin/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const detail = data?.message || err.message || 'Unknown error';
      setErrorDetail(`Status: ${status || 'N/A'} — ${detail}`);
      if (status === 401) {
        setError('Invalid email or password');
      } else if (status === 429) {
        setError('Too many attempts. Try again later.');
      } else if (!status || status >= 500) {
        setError('Server error. Check your Server URL below.');
      } else {
        setError(detail || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetAdmin = async () => {
    if (!serverUrl && !isLocal) {
      setError('Set Server URL first');
      return;
    }
    setLoading(true);
    setError('');
    setErrorDetail('');
    try {
      const baseUrl = serverUrl.replace(/\/api$/, '').replace(/\/+$/, '');
      const { data } = await axios.post(baseUrl + '/api/auth/reset');
      if (data.success) {
        setError('');
        setErrorDetail(`Admin re-seeded! Email: ${data.email}. Now sign in.`);
      }
    } catch (err) {
      setError('Reset failed: ' + (err.response?.data?.message || err.message));
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
            {errorDetail && (
              <div className="login-error" style={{ fontSize: 11, wordBreak: 'break-all', background: '#f8fafc', color: '#64748b' }}>
                {errorDetail}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="login-server-config">
              <div className="login-server-toggle" onClick={() => setShowServerConfig(!showServerConfig)}>
                <Icon path={showServerConfig ? Icons['chevron-down'] : Icons['chevron-right']} size={14} />
                Server Configuration
              </div>
              {showServerConfig && (
                <div className="login-server-field">
                  <label>Backend API URL</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="http://localhost:5001/api"
                      style={{ flex: 1 }}
                    />
                    <button type="button" className="btn btn-primary" onClick={testConnection} style={{ whiteSpace: 'nowrap' }}>
                      Test
                    </button>
                  </div>
                  {serverStatus === 'testing' && <div className="login-server-status">Testing connection...</div>}
                  {serverStatus === 'connected' && <div className="login-server-status connected">Connected</div>}
                  {serverStatus === 'disconnected' && <div className="login-server-status disconnected">Cannot connect</div>}
                  {serverStatus === 'connected' && (
                    <button type="button" className="btn btn-danger" onClick={handleResetAdmin} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                      Reset Admin (re-seed)
                    </button>
                  )}
                </div>
              )}
            </div>
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
