import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { TargetIcon, ArrowRightIcon, InfoIcon } from '../../components/Icons';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <TargetIcon size={26} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 60%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              Quizora
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              Interactive Quizzes
            </span>
          </div>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to take quizzes and view your progress</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email address</label>
            <input
              className="input" type="email" name="email"
              placeholder="you@example.com" value={form.email}
              onChange={handleChange} required autoFocus
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input" type="password" name="password"
              placeholder="Enter your password" value={form.password}
              onChange={handleChange} required
            />
          </div>
          <button className="btn btn-primary btn-full btn-lg inline-icon gap-icon" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            {!loading && <ArrowRightIcon size={16} />}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        {/* Demo credentials hint */}
        <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--primary)', marginTop: 2 }}>
            <InfoIcon size={16} />
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Register with role <strong>admin</strong> to access the admin dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
