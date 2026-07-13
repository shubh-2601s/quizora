import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Leaderboard from '../../components/Leaderboard';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon, XCircleIcon, FileTextIcon, TrophyIcon, ArrowLeftIcon, HistoryIcon } from '../../components/Icons';

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
              {passed ? 'Great Job!' : 'Keep Practicing!'}
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
            <span className={`badge ${passed ? 'badge-success' : 'badge-error'} inline-icon gap-icon`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
              {passed ? <CheckCircleIcon size={16} /> : <XCircleIcon size={16} />}
              <span>{passed ? 'Passed' : 'Failed'}</span>
            </span>
          </div>

          {/* Certificate Download Panel */}
          {percentage >= 80 && (
            <div className="card" style={{ marginBottom: 24, textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--primary-light) 100%)', border: '1px solid var(--primary)', padding: '24px 32px' }}>
              <TrophyIcon size={36} style={{ color: 'var(--warning)', marginBottom: 12 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Certificate Earned!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Excellent performance! You scored <strong>{percentage}%</strong>, qualifying you for an official Completion Certificate.
              </p>
              <button
                className="btn btn-primary inline-icon gap-icon"
                onClick={() => {
                  const canvas = document.createElement('canvas');
                  canvas.width = 800;
                  canvas.height = 560;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;

                  // Draw background
                  ctx.fillStyle = '#faf9f6'; // cream
                  ctx.fillRect(0, 0, 800, 560);

                  // Draw border
                  ctx.strokeStyle = '#d4af37'; // gold
                  ctx.lineWidth = 10;
                  ctx.strokeRect(15, 15, 770, 530);

                  ctx.strokeStyle = '#c5a028';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(25, 25, 750, 510);

                  // Draw corner accents
                  ctx.fillStyle = '#d4af37';
                  ctx.fillRect(15, 15, 40, 6);
                  ctx.fillRect(15, 15, 6, 40);
                  ctx.fillRect(745, 15, 40, 6);
                  ctx.fillRect(779, 15, 6, 40);
                  ctx.fillRect(15, 539, 40, 6);
                  ctx.fillRect(15, 504, 6, 40);
                  ctx.fillRect(745, 539, 40, 6);
                  ctx.fillRect(779, 504, 6, 40);

                  // Draw background watermark
                  ctx.save();
                  ctx.translate(400, 280);
                  ctx.rotate(-Math.PI / 12);
                  ctx.fillStyle = 'rgba(212, 175, 55, 0.05)';
                  ctx.font = 'bold 120px sans-serif';
                  ctx.textAlign = 'center';
                  ctx.fillText('PASSED', 0, 0);
                  ctx.restore();

                  // Header Title
                  ctx.textAlign = 'center';
                  ctx.fillStyle = '#1c1b22';
                  ctx.font = 'bold 36px Georgia, serif';
                  ctx.fillText('CERTIFICATE OF COMPLETION', 400, 110);

                  // Subtext
                  ctx.fillStyle = '#5c5b62';
                  ctx.font = 'italic 16px Georgia, serif';
                  ctx.fillText('This is proudly presented to', 400, 165);

                  // Student Name
                  ctx.fillStyle = '#6366f1';
                  ctx.font = 'bold 28px sans-serif';
                  ctx.fillText(user?.name || 'Quiz Candidate', 400, 220);

                  // Name Underline
                  ctx.strokeStyle = '#e0e0e0';
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.moveTo(200, 240);
                  ctx.lineTo(600, 240);
                  ctx.stroke();

                  // Details
                  ctx.fillStyle = '#5c5b62';
                  ctx.font = '14px sans-serif';
                  ctx.fillText('for successfully passing the assessment:', 400, 275);

                  // Quiz Title
                  ctx.fillStyle = '#1c1b22';
                  ctx.font = 'bold italic 20px Georgia, serif';
                  ctx.fillText(quiz?.title || 'Quiz Assessment', 400, 315);

                  // Score / Date
                  ctx.fillStyle = '#5c5b62';
                  ctx.font = '14px sans-serif';
                  ctx.fillText(`with a grade of ${percentage}% on ${new Date().toLocaleDateString()}`, 400, 360);

                  // Signatures
                  ctx.strokeStyle = '#9c9b9f';
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.moveTo(180, 470);
                  ctx.lineTo(330, 470);
                  ctx.stroke();

                  ctx.fillStyle = '#1c1b22';
                  ctx.font = 'italic 16px Georgia, serif';
                  ctx.fillText('Quizora Assessment', 255, 460);
                  ctx.fillStyle = '#5c5b62';
                  ctx.font = '12px sans-serif';
                  ctx.fillText('Issuer', 255, 490);

                  ctx.beginPath();
                  ctx.moveTo(470, 470);
                  ctx.lineTo(620, 470);
                  ctx.stroke();

                  ctx.fillStyle = '#1c1b22';
                  ctx.font = 'italic 16px Georgia, serif';
                  ctx.fillText('Quiz Administrator', 545, 460);
                  ctx.fillStyle = '#5c5b62';
                  ctx.font = '12px sans-serif';
                  ctx.fillText('Platform Representative', 545, 490);

                  const dataUrl = canvas.toDataURL('image/png');
                  const link = document.createElement('a');
                  link.download = `Certificate_${quiz?.title?.replace(/\s+/g, '_') || 'Completion'}.png`;
                  link.href = dataUrl;
                  link.click();
                  toast.success('Certificate downloaded!');
                }}
                style={{ margin: '0 auto' }}
              >
                <span>Download Certificate</span>
              </button>
            </div>
          )}

          {/* Tabs */}
          <div style={{ marginBottom: 20 }}>
            <div className="tabs">
              <button className={`tab-btn ${activeTab === 'review' ? 'active' : ''} inline-icon gap-icon`} onClick={() => setActiveTab('review')}>
                <FileTextIcon size={16} />
                <span>Answer Review</span>
              </button>
              <button className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''} inline-icon gap-icon`} onClick={() => setActiveTab('leaderboard')}>
                <TrophyIcon size={16} />
                <span>Leaderboard</span>
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
                      <span className={`badge ${ans.isCorrect ? 'badge-success' : 'badge-error'} inline-icon gap-icon`}>
                        {ans.isCorrect ? <CheckCircleIcon size={12} /> : <XCircleIcon size={12} />}
                        <span>{ans.isCorrect ? 'Correct' : 'Wrong'}</span>
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
                            {isSelected && !isCorrect && <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.8rem', opacity: 0.8 }}>← Your answer</span>}
                            {isCorrect && (
                              <span className="inline-icon gap-icon" style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.8rem', fontWeight: 600 }}>
                                <CheckCircleIcon size={14} />
                                <span>Correct</span>
                              </span>
                            )}
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
              <h2 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrophyIcon size={20} style={{ color: 'var(--warning)' }} />
                <span>Quiz Leaderboard</span>
              </h2>
              <Leaderboard data={leaderboard} currentUserId={user?._id} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Link to="/dashboard" className="btn btn-outline inline-icon gap-icon">
              <ArrowLeftIcon size={16} />
              <span>Back to Dashboard</span>
            </Link>
            <Link to="/history" className="btn btn-secondary inline-icon gap-icon">
              <HistoryIcon size={16} />
              <span>My History</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizResult;
