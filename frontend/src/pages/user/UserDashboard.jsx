import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/quizzes/code/${code.trim()}`);
      navigate(`/quiz/${code.trim()}/instructions`, { state: { quizData: data } });
    } catch (err) {
      const msg = err.response?.data?.message;
      const alreadyAttempted = err.response?.data?.alreadyAttempted;
      if (alreadyAttempted) {
        toast.error('You have already attempted this quiz!');
        const sub = err.response?.data?.submission;
        if (sub) navigate(`/result/${sub._id}`);
      } else {
        toast.error(msg || 'Invalid quiz code');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            borderRadius: 'var(--radius-xl)', padding: '36px 40px', marginBottom: 32,
            color: '#fff', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 160, height: 160, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -40, right: 80, width: 100, height: 100, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
              Hello, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ opacity: 0.85, fontSize: '1rem' }}>Enter a quiz code below to start your quiz</p>
          </div>

          {/* Quiz Code Entry */}
          <div className="card" style={{ maxWidth: 520, margin: '0 auto', padding: '36px' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 6, textAlign: 'center' }}>
              🎯 Enter Quiz Code
            </h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, fontSize: '0.9rem' }}>
              Get the quiz code from your teacher or admin
            </p>
            <form onSubmit={handleCodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                className="code-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="QUIZ CODE"
                maxLength={10}
                autoFocus
              />
              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading || !code.trim()}>
                {loading ? 'Searching...' : 'Find Quiz →'}
              </button>
            </form>
          </div>

          {/* Tips */}
          <div style={{ maxWidth: 520, margin: '24px auto 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: '⏱', label: 'Timed Quiz', desc: 'Auto-submits when time ends' },
              { icon: '📊', label: 'Instant Score', desc: 'See your results immediately' },
              { icon: '🏆', label: 'Leaderboard', desc: 'Compete with others' },
              { icon: '📱', label: 'Mobile Friendly', desc: 'Works on any device' },
            ].map((tip) => (
              <div key={tip.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{tip.icon}</div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{tip.label}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
