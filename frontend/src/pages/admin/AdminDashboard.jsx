import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { CrownIcon, PlusIcon, FileTextIcon, UserIcon, UsersIcon, TrendingUpIcon, ArrowRightIcon, SparklesIcon } from '../../components/Icons';

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

  const statItems = [
    { icon: <FileTextIcon size={22} />, label: 'Total Quizzes', value: stats?.totalQuizzes ?? 0, bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' },
    { icon: <SparklesIcon size={22} />, label: 'Active Now', value: activeQuizzes, bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' },
    { icon: <UsersIcon size={22} />, label: 'Submissions', value: stats?.totalSubmissions ?? 0, bg: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent)' },
    { icon: <TrendingUpIcon size={22} />, label: 'Avg. Score', value: `${stats?.avgScore ?? 0}%`, bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' },
  ];

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(14, 165, 233, 0.08) 100%)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '34px 40px',
              marginBottom: 36,
              color: 'var(--text-primary)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              <CrownIcon size={14} />
              Admin Portal • Overview
            </div>
            <h1
              className="inline-icon gap-icon"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.1rem',
                fontWeight: 800,
                marginBottom: 8,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
            >
              Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 600 }}>
              Welcome back, {user?.name}. Manage quizzes, view submissions, and track student performance.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/admin/create-quiz" className="btn btn-primary inline-icon gap-icon">
                <PlusIcon size={18} />
                <span>Create New Quiz</span>
              </Link>
              <Link to="/admin/quizzes" className="btn btn-outline inline-icon gap-icon">
                <FileTextIcon size={18} />
                <span>All Quizzes</span>
              </Link>
              <Link to="/admin/manage-users" className="btn btn-outline inline-icon gap-icon">
                <UserIcon size={18} />
                <span>Manage Users</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="loading-wrapper"><div className="spinner" /></div>
          ) : (
            <>
              <div className="stats-grid">
                {statItems.map((s) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-icon" style={{ background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.icon}
                    </div>
                    <span className="stat-value">{s.value}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Recent Quizzes */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Recent Quizzes</h2>
                  <Link to="/admin/quizzes" className="btn btn-secondary btn-sm inline-icon gap-icon">
                    <span>View All</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
                {recentQuizzes.length === 0 ? (
                  <div className="empty-state" style={{ padding: '32px' }}>
                    <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileTextIcon size={48} style={{ color: 'var(--text-muted)' }} />
                    </div>
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
