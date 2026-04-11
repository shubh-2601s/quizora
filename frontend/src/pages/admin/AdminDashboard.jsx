import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, quizzesRes] = await Promise.all([
          api.get('/submissions/admin/stats'),
          api.get('/quizzes'),
        ]);
        setStats(statsRes.data);
        setRecentQuizzes(quizzesRes.data.quizzes.slice(0, 4));
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const now = new Date();
  const activeQuizzes = recentQuizzes.filter(q => now >= new Date(q.startTime) && now <= new Date(q.endTime)).length;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          {/* Welcome */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            borderRadius: 'var(--radius-xl)', padding: '32px 40px', marginBottom: 32, color: '#fff',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 180, height: 180, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>👑 Admin Dashboard</h1>
            <p style={{ opacity: 0.85 }}>Welcome back, {user?.name}! Manage your quizzes from here.</p>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/admin/create-quiz" className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
                ➕ Create Quiz
              </Link>
              <Link to="/admin/quizzes" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                📋 View All Quizzes
              </Link>
              <Link to="/admin/manage-users" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                👤 Manage Users
              </Link>
            </div>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="loading-wrapper"><div className="spinner" /></div>
          ) : (
            <>
              <div className="stats-grid">
                {[
                  { icon: '📋', label: 'Total Quizzes', value: stats?.totalQuizzes ?? 0, bg: '#EDE9FF', color: '#6C63FF' },
                  { icon: '🟢', label: 'Active Now', value: activeQuizzes, bg: '#D1FAE5', color: '#065F46' },
                  { icon: '👥', label: 'Total Attempts', value: stats?.totalSubmissions ?? 0, bg: '#EBF3FF', color: '#1E40AF' },
                  { icon: '📈', label: 'Avg Score', value: `${stats?.avgScore ?? 0}%`, bg: '#FEF3C7', color: '#92400E' },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                    <span className="stat-value">{s.value}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Recent Quizzes */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Recent Quizzes</h2>
                  <Link to="/admin/quizzes" className="btn btn-secondary btn-sm">View All →</Link>
                </div>
                {recentQuizzes.length === 0 ? (
                  <div className="empty-state" style={{ padding: '32px' }}>
                    <div className="empty-icon">📝</div>
                    <p style={{ marginBottom: 12 }}>No quizzes created yet</p>
                    <Link to="/admin/create-quiz" className="btn btn-primary btn-sm">Create your first quiz</Link>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead><tr><th>Title</th><th>Code</th><th>Questions</th><th>Attempts</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {recentQuizzes.map((quiz) => {
                          const start = new Date(quiz.startTime), end = new Date(quiz.endTime);
                          let status = 'Upcoming', badgeCls = 'badge-warning';
                          if (now >= start && now <= end) { status = 'Active'; badgeCls = 'badge-success'; }
                          else if (now > end) { status = 'Ended'; badgeCls = 'badge-error'; }
                          return (
                            <tr key={quiz._id}>
                              <td style={{ fontWeight: 600 }}>{quiz.title}</td>
                              <td><span className="badge badge-primary" style={{ fontFamily: 'monospace' }}>{quiz.code}</span></td>
                              <td>{quiz.questionCount}</td>
                              <td>{quiz.submissionCount}</td>
                              <td><span className={`badge ${badgeCls}`}>{status}</span></td>
                              <td><Link to={`/admin/quiz/${quiz._id}`} className="btn btn-secondary btn-sm">Details</Link></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
