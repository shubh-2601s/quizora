import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Leaderboard from '../../components/Leaderboard';
import { useAuth } from '../../context/AuthContext';

const OPTIONS = ['A', 'B', 'C', 'D'];

const QuizResult = () => {
  const { submissionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'leaderboard'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/submissions/result/${submissionId}`);
        setSubmission(data.submission);
        const lb = await api.get(`/submissions/leaderboard/${data.submission.quiz._id}`);
        setLeaderboard(lb.data.leaderboard);
      } catch {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [submissionId, navigate]);

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;
  if (!submission) return null;

  const { score, total, quiz, answers, timeTaken } = submission;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 50;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 760 }}>
          {/* Score Card */}
          <div className="result-card" style={{ marginBottom: 24 }}>
            <div
              className="score-ring"
              style={{ '--pct': percentage }}
            >
              <div className="score-ring-inner">
                <span className="score-pct">{percentage}%</span>
                <span className="score-label">Score</span>
              </div>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>
              {passed ? '🎉 Great Job!' : '😔 Keep Practicing!'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              {quiz.title}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{score}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Correct</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--error)' }}>{total - score}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wrong</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                  {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Time Taken</p>
              </div>
            </div>
            <span className={`badge ${passed ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
              {passed ? '✅ Passed' : '❌ Failed'}
            </span>
          </div>

          {/* Tabs */}
          <div style={{ marginBottom: 20 }}>
            <div className="tabs">
              <button className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
                📋 Answer Review
              </button>
              <button className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>
                🏆 Leaderboard
              </button>
            </div>
          </div>

          {activeTab === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {answers.map((ans, i) => {
                const q = ans.question;
                if (!q) return null;
                return (
                  <div key={i} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="badge badge-primary">Q{i + 1}</span>
                      <span className={`badge ${ans.isCorrect ? 'badge-success' : 'badge-error'}`}>
                        {ans.isCorrect ? '✅ Correct' : '❌ Wrong'}
                      </span>
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.95rem' }}>{q.question}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {OPTIONS.map((opt) => {
                        const isSelected = ans.selectedAnswer === opt;
                        const isCorrect = q.correctAnswer === opt;
                        let cls = 'option-btn';
                        if (isCorrect) cls += ' correct';
                        else if (isSelected && !isCorrect) cls += ' incorrect';
                        return (
                          <div key={opt} className={cls} style={{ cursor: 'default' }}>
                            <span className="option-label">{opt}</span>
                            <span>{q[`option${opt}`]}</span>
                            {isSelected && !isCorrect && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>← Your answer</span>}
                            {isCorrect && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>✅ Correct</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>🏆 Quiz Leaderboard</h2>
              <Leaderboard data={leaderboard} currentUserId={user?._id} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Link to="/dashboard" className="btn btn-outline">← Back to Dashboard</Link>
            <Link to="/history" className="btn btn-secondary">📜 My History</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizResult;
