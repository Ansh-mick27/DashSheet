// ==========================================
// DashSheet — Login Page
// ==========================================
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate brief loading
    await new Promise(r => setTimeout(r, 500));

    const success = login(username, password);
    if (success) {
      navigate('/', { replace: true });
    } else {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg__circle login-bg__circle--1" />
        <div className="login-bg__circle login-bg__circle--2" />
        <div className="login-bg__circle login-bg__circle--3" />
      </div>

      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="login-card__title">DashSheet</h1>
          <p className="login-card__subtitle">Task Dashboard — Admin Access</p>
        </div>

        <form className="login-card__form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-card__error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="login-card__field">
            <label htmlFor="login-username" className="login-card__label">Username</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="login-card__input"
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="login-card__field">
            <label htmlFor="login-password" className="login-card__label">Password</label>
            <div className="login-card__password-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="login-card__input"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="login-card__eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-card__submit"
            disabled={loading}
          >
            {loading ? (
              <span className="login-card__spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="login-card__footer">
          Access restricted to authorized managers and admins only.
        </p>
      </div>
    </div>
  );
}
