import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Leaderboard from '../../components/Leaderboard';
import toast from 'react-hot-toast';

const QuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('submissions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [qRes, subRes, lbRes] = await Promise.all([
          api.get(`/quizzes/${quizId}/details`),
          api.get(`/submissions/quiz/${quizId}`),
          api.get(`/submissions/leaderboard/${quizId}`),
        ]);
        setQuiz(qRes.data.quiz);
        setSubmissions(subRes.data.submissions);
        setLeaderboard(lbRes.data.leaderboard);
      } catch { toast.error('Failed to load quiz details'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [quizId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this quiz and ALL its data permanently?')) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      toast.success('Quiz deleted');
      navigate('/admin/quizzes');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <><Navbar /><div className="loading-wrapper"><div className="spinner" /></div></>;
  if (!quiz) return null;

  const now = new Date();
  const start = new Date(quiz.startTime), end = new Date(quiz.endTime);
  let status = 'Upcoming', badgeCls = 'badge-warning';
  if (now >= start && now <= end) { status = 'Active'; badgeCls = 'badge-success'; }
  else if (now > end) { status = 'Ended'; badgeCls = 'badge-error'; }

  const avgScore = submissions.length
    ? Math.round(submissions.reduce((a, s) => a + (s.score / s.total) * 100, 0) / submissions.length)
    : 0;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          {/* Header */}
          <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>{quiz.title}</h1>
                  <span className={`badge ${badgeCls}`}>{status}</span>
                </div>
                {quiz.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 10 }}>{quiz.description}</p>}
                <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{quiz.code}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link to={`/admin/quiz/${quizId}/questions`} className="btn btn-secondary btn-sm">📝 Questions</Link>
                <Link to={`/admin/quiz/${quizId}/edit`} className="btn btn-outline btn-sm">✏️ Edit</Link>
                <button onClick={handleDelete} className="btn btn-danger btn-sm">🗑 Delete</button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { icon: '⏱', label: 'Duration', value: `${quiz.duration} min` },
              { icon: '👥', label: 'Attempts', value: submissions.length },
              { icon: '📈', label: 'Avg Score', value: `${avgScore}%` },
              { icon: '📅', label: 'Ends', value: end.toLocaleDateString() },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{s.icon}</div>
                <span className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
              👥 Submissions ({submissions.length})
            </button>
            <button className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>
              🏆 Leaderboard
            </button>
          </div>

          {activeTab === 'submissions' && (
            submissions.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-icon">📭</div>
                <p>No submissions yet</p>
              </div>
            ) : (
              <div className="card">
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>#</th><th>User</th><th>Email</th><th>Score</th><th>%</th><th>Time</th><th>Submitted</th></tr>
                    </thead>
                    <tbody>
                      {submissions.map((s, i) => {
                        const pct = Math.round((s.score / s.total) * 100);
                        return (
                          <tr key={s._id}>
                            <td>{i + 1}</td>
                            <td style={{ fontWeight: 600 }}>{s.user?.name}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.user?.email}</td>
                            <td><strong>{s.score}</strong>/{s.total}</td>
                            <td><span className={`badge ${pct >= 50 ? 'badge-success' : 'badge-error'}`}>{pct}%</span></td>
                            <td style={{ fontSize: '0.85rem' }}>{Math.floor(s.timeTaken / 60)}m {s.timeTaken % 60}s</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(s.submittedAt).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {activeTab === 'leaderboard' && (
            <div className="card">
              <Leaderboard data={leaderboard} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuizDetail;
