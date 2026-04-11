import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Timer from '../../components/Timer';
import ProgressBar from '../../components/ProgressBar';
import toast from 'react-hot-toast';

const OPTIONS = ['A', 'B', 'C', 'D'];

const QuizAttempt = () => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const [tabWarnCount, setTabWarnCount] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!quiz) { navigate('/dashboard'); return; }
    const fetchQuestions = async () => {
      try {
        const { data } = await api.get(`/questions/${quiz._id}`);
        setQuestions(data.questions);
      } catch (err) {
        toast.error('Failed to load questions');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quiz, navigate]);

  // Tab switch warning
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setTabWarning(true);
        setTabWarnCount((c) => c + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const submitQuiz = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const answersArray = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: answers[q._id] || null,
    }));
    try {
      const { data } = await api.post('/submissions', {
        quizId: quiz._id,
        answers: answersArray,
        timeTaken,
      });
      toast.success('Quiz submitted!');
      navigate(`/result/${data.submissionId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [submitting, questions, answers, quiz, navigate]);

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  if (!quiz) return null;
  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  if (loading) return (
    <div className="loading-wrapper"><div className="spinner" /></div>
  );

  return (
    <div className="quiz-attempt-wrapper">
      {/* Tab switch warning */}
      {tabWarning && (
        <div className="tab-warning-banner">
          <span>⚠️ Warning #{tabWarnCount}: Please stay on this tab during the quiz!</span>
          <button
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setTabWarning(false)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="quiz-topbar" style={{ marginTop: tabWarning ? 48 : 0 }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
          🎯 {quiz.title}
        </div>
        <Timer durationSeconds={quiz.duration * 60} onExpire={submitQuiz} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {answeredCount}/{questions.length} answered
          </span>
          <button
            className="btn btn-success"
            onClick={() => {
              if (window.confirm('Submit quiz? You cannot undo this.')) submitQuiz();
            }}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>

      <div className="quiz-main">
        <ProgressBar current={currentIdx + 1} total={questions.length} />

        {/* Question navigation dots */}
        <div className="question-nav">
          {questions.map((q, i) => (
            <button
              key={q._id}
              className={`q-dot ${answers[q._id] ? 'answered' : ''} ${i === currentIdx ? 'current' : ''}`}
              onClick={() => setCurrentIdx(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <span className="badge badge-primary" style={{ marginBottom: 12 }}>Question {currentIdx + 1}</span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {currentQ.question}
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {OPTIONS.map((opt) => {
                const optionText = currentQ[`option${opt}`];
                const isSelected = answers[currentQ._id] === opt;
                return (
                  <button
                    key={opt}
                    className={`option-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(currentQ._id, opt)}
                  >
                    <span className="option-label">{opt}</span>
                    <span>{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button
            className="btn btn-outline"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
          >
            ← Previous
          </button>
          {currentIdx < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentIdx((i) => i + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn btn-success" onClick={() => { if (window.confirm('Submit quiz?')) submitQuiz(); }} disabled={submitting}>
              {submitting ? 'Submitting...' : '✅ Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
