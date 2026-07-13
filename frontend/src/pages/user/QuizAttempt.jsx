import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Timer from '../../components/Timer';
import ProgressBar from '../../components/ProgressBar';
import toast from 'react-hot-toast';
import { TargetIcon, AlertCircleIcon, ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from '../../components/Icons';

const OPTIONS = ['A', 'B', 'C', 'D'];

const QuizAttempt = () => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
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
        // Sort questions by round, then by order
        const sorted = data.questions.sort((a, b) => {
          if (a.round !== b.round) return a.round - b.round;
          return a.order - b.order;
        });
        setQuestions(sorted);
      } catch (err) {
        toast.error('Failed to load questions');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quiz, navigate]);

  const submitQuiz = useCallback(async (isDisqualified = false) => {
    if (submitting) return;
    setSubmitting(true);
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }

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
        isEliminated: isDisqualified,
        eliminatedRound: isDisqualified ? currentRound : null,
      });
      if (isDisqualified) {
        toast.error('Disqualified due to anti-cheat violations!');
      } else {
        toast.success('Quiz submitted successfully!');
      }
      navigate(`/result/${data.submissionId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [submitting, questions, answers, quiz, navigate, currentRound]);

  const submitQuizRef = useRef(submitQuiz);
  useEffect(() => {
    submitQuizRef.current = submitQuiz;
  }, [submitQuiz]);

  // Anti-cheat Listeners
  useEffect(() => {
    if (!quiz) return;

    // Force fullscreen if strict anti-cheat is enabled
    if (quiz.strictAntiCheat) {
      const enterFS = async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
        } catch (e) {
          console.warn("Fullscreen request rejected", e);
        }
      };
      enterFS();
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setTabWarning(true);
        setTabWarnCount((c) => {
          const newCount = c + 1;
          if (quiz.strictAntiCheat && newCount >= 3) {
            submitQuizRef.current(true);
          }
          return newCount;
        });
      }
    };

    const handleFSChange = () => {
      if (quiz.strictAntiCheat && !document.fullscreenElement) {
        setTabWarning(true);
        setTabWarnCount((c) => {
          const newCount = c + 1;
          if (newCount >= 3) {
            submitQuizRef.current(true);
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    if (quiz.strictAntiCheat) {
      document.addEventListener('fullscreenchange', handleFSChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (quiz.strictAntiCheat) {
        document.removeEventListener('fullscreenchange', handleFSChange);
      }
    };
  }, [quiz]);

  const handleRoundSubmit = async () => {
    if (submitting) return;

    const unanswered = visibleQuestions.some(q => !answers[q._id]);
    if (unanswered) {
      if (!window.confirm("You have unanswered questions in this round. Proceed anyway?")) {
        return;
      }
    }

    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const answersArray = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: answers[q._id] || null,
    }));

    try {
      const { data } = await api.post('/submissions/verify-round', {
        quizId: quiz._id,
        round: currentRound,
        answers: answersArray,
        timeTaken,
      });

      if (data.eliminated) {
        toast.error('You have been ELIMINATED!');
        // Exit fullscreen if active
        if (document.fullscreenElement) {
          try { await document.exitFullscreen(); } catch {}
        }
        navigate(`/result/${data.submissionId}`, { state: { eliminated: true, eliminatedRound: currentRound } });
      } else if (data.quizCompleted) {
        toast.success('Congratulations! You passed all rounds and completed the quiz!');
        navigate(`/result/${data.submissionId}`);
      } else {
        toast.success(`Passed Round ${currentRound}! Starting Round ${data.nextRound}...`);
        setCurrentRound(data.nextRound);
        setCurrentIdx(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Round submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  if (!quiz) return null;

  // Filter questions for the current round if in elimination mode
  const visibleQuestions = quiz.quizMode === 'elimination'
    ? questions.filter((q) => q.round === currentRound)
    : questions;

  const currentQ = visibleQuestions[currentIdx];
  const answeredCount = visibleQuestions.filter((q) => answers[q._id]).length;
  const isLastRound = quiz.quizMode === 'elimination'
    ? currentRound === Math.max(...questions.map((q) => q.round || 1), 1)
    : true;

  if (loading) return (
    <div className="loading-wrapper"><div className="spinner" /></div>
  );

  return (
    <div className="quiz-attempt-wrapper">
      {/* Strict Anti-Cheat Fullscreen Overlay */}
      {tabWarning && quiz.strictAntiCheat && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(11, 10, 18, 0.95)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          padding: 24, textAlign: 'center'
        }}>
          <AlertCircleIcon size={64} style={{ color: 'var(--error)', marginBottom: 20 }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Anti-Cheat Violation!</h2>
          <p style={{ fontSize: '1.1rem', maxWidth: 480, opacity: 0.9, marginBottom: 24, lineHeight: 1.6 }}>
            You exited fullscreen or switched tabs. This is violation <strong>{tabWarnCount} of 3</strong>. 
            Reaching 3 violations will automatically submit your quiz.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={async () => {
              try {
                if (!document.fullscreenElement) {
                  await document.documentElement.requestFullscreen();
                }
                setTabWarning(false);
              } catch (err) {
                toast.error("Please enter fullscreen manually or try again.");
              }
            }}
          >
            Resume & Re-enter Fullscreen
          </button>
        </div>
      )}

      {/* Standard Tab Warning Banner */}
      {tabWarning && !quiz.strictAntiCheat && (
        <div className="tab-warning-banner inline-icon gap-icon">
          <div className="inline-icon gap-icon">
            <AlertCircleIcon size={18} />
            <span>Warning #{tabWarnCount}: Please stay on this tab during the quiz!</span>
          </div>
          <button
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setTabWarning(false)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="quiz-topbar" style={{ marginTop: (tabWarning && !quiz.strictAntiCheat) ? 48 : 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="inline-icon gap-icon" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            <TargetIcon size={18} style={{ color: 'var(--primary)' }} />
            <span>{quiz.title}</span>
          </div>
          {quiz.quizMode === 'elimination' && (
            <span className="badge badge-warning" style={{ alignSelf: 'flex-start', fontSize: '0.72rem' }}>
              Elimination Mode — Round {currentRound}
            </span>
          )}
        </div>
        <Timer durationSeconds={quiz.duration * 60} onExpire={() => {
          if (quiz.quizMode === 'elimination') handleRoundSubmit();
          else submitQuiz();
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {answeredCount}/{visibleQuestions.length} answered
          </span>
          {quiz.quizMode === 'elimination' ? (
            <button
              className="btn btn-primary inline-icon gap-icon"
              onClick={handleRoundSubmit}
              disabled={submitting}
            >
              <span>{isLastRound ? (submitting ? 'Submitting...' : 'Submit Quiz') : (submitting ? 'Verifying...' : `Submit Round ${currentRound}`)}</span>
              <ArrowRightIcon size={16} />
            </button>
          ) : (
            <button
              className="btn btn-success inline-icon gap-icon"
              onClick={() => {
                if (window.confirm('Submit quiz? You cannot undo this.')) submitQuiz();
              }}
              disabled={submitting}
            >
              <CheckCircleIcon size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="quiz-main">
        <ProgressBar current={currentIdx + 1} total={visibleQuestions.length} />

        {/* Question navigation dots */}
        <div className="question-nav">
          {visibleQuestions.map((q, i) => (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge badge-primary">Question {currentIdx + 1}</span>
                {quiz.quizMode === 'elimination' && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Round {currentRound} Question
                  </span>
                )}
              </div>
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
            className="btn btn-outline inline-icon gap-icon"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
          >
            <ArrowLeftIcon size={16} />
            <span>Previous</span>
          </button>
          {currentIdx < visibleQuestions.length - 1 ? (
            <button className="btn btn-primary inline-icon gap-icon" onClick={() => setCurrentIdx((i) => i + 1)}>
              <span>Next</span>
              <ArrowRightIcon size={16} />
            </button>
          ) : quiz.quizMode === 'elimination' ? (
            <button className="btn btn-primary inline-icon gap-icon" onClick={handleRoundSubmit} disabled={submitting}>
              <span>{isLastRound ? (submitting ? 'Submitting...' : 'Submit Quiz') : (submitting ? 'Verifying...' : `Submit Round ${currentRound}`)}</span>
              <ArrowRightIcon size={16} />
            </button>
          ) : (
            <button className="btn btn-success inline-icon gap-icon" onClick={() => { if (window.confirm('Submit quiz?')) submitQuiz(); }} disabled={submitting}>
              <CheckCircleIcon size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
