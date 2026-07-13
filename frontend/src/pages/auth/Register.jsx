import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { TargetIcon, ArrowRightIcon } from '../../components/Icons';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password, role: form.role,
      });
      login(data.user, data.token);
      toast.success(`Account created! Welcome, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TargetIcon size={24} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>QuizApp</span>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join thousands of quiz takers and creators</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" type="text" name="name" placeholder="John Doe"
              value={form.name} onChange={handleChange} required autoFocus />
          </div>
          <div className="form-group">
            <label className="label">Email address</label>
            <input className="input" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">I want to</label>
            <select className="select" name="role" value={form.role} onChange={handleChange}>
              <option value="user">Take Quizzes (User)</option>
              <option value="admin">Create Quizzes (Admin)</option>
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" name="password" placeholder="Min 6 chars"
                value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input className="input" type="password" name="confirmPassword" placeholder="Repeat password"
                value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg inline-icon gap-icon" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            {!loading && <ArrowRightIcon size={16} />}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
