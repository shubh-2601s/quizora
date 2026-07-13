import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { HelpCircleIcon, ClockIcon, TargetIcon, FileTextIcon, ArrowLeftIcon, ArrowRightIcon } from '../../components/Icons';

const QuizInstructions = () => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { quizData } = location.state || {};
  const [consented, setConsented] = useState(false);

  if (!quizData) {
    navigate('/dashboard');
    return null;
  }

  const { quiz, questionCount } = quizData;

  const instructions = [
    `This quiz contains ${questionCount} multiple-choice questions.`,
    `You have ${quiz.duration} minute${quiz.duration > 1 ? 's' : ''} to complete the quiz.`,
    'The timer starts as soon as you click "Start Quiz".',
    'Each question has only one correct answer.',
    'You can navigate between questions using the question map.',
    'The quiz will auto-submit when the timer reaches zero.',
    'You can also submit manually before time runs out.',
    quiz.randomizeQuestions ? 'Questions are presented in random order.' : 'Questions are in a fixed order.',
    quiz.allowReattempt ? 'You may attempt this quiz multiple times.' : 'You can only attempt this quiz once.',
  ];

  if (quiz.strictAntiCheat) {
    instructions.push('STRICT ANTI-CHEAT: This quiz requires fullscreen mode. Switching tabs or exiting fullscreen will count as a violation.');
    instructions.push('STRICT ANTI-CHEAT: 3 violations will result in automatic submission of the quiz.');
  }

  const stats = [
    { icon: <HelpCircleIcon size={24} style={{ color: 'var(--primary)' }} />, label: 'Questions', value: questionCount },
    { icon: <ClockIcon size={24} style={{ color: 'var(--accent)' }} />, label: 'Duration', value: `${quiz.duration} min` },
    { icon: <TargetIcon size={24} style={{ color: 'var(--warning)' }} />, label: 'Marks', value: `${questionCount} pts` },
  ];

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 680 }}>
          {/* Header */}
          <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: 6 }}>{quiz.title}</h1>
                {quiz.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{quiz.description}</p>}
              </div>
              <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{quiz.code}</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {stats.map((s, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'center', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{s.value}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
              <FileTextIcon size={20} style={{ color: 'var(--primary)' }} />
              <span>Instructions</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {instructions.map((inst, i) => (
                <div key={i} className="instruction-item">
                  <div className="instruction-num">{i + 1}</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: inst.startsWith('STRICT') ? 700 : 400, color: inst.startsWith('STRICT') ? 'var(--error)' : 'var(--text-primary)' }}>{inst}</p>
                </div>
              ))}
            </div>
          </div>

          {quiz.strictAntiCheat && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '16px 0', cursor: 'pointer', padding: 16, background: 'var(--error-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--error)' }}>
              <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                I understand that this quiz has strict anti-cheat enabled. I agree to stay in fullscreen mode and avoid tab switching. Exiting fullscreen or switching tabs will result in automatic submission.
              </span>
            </label>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline inline-icon gap-icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeftIcon size={16} />
              <span>Back</span>
            </button>
            <button
              className="btn btn-primary btn-lg inline-icon gap-icon"
              style={{ flex: 1 }}
              disabled={quiz.strictAntiCheat && !consented}
              onClick={() => navigate(`/quiz/${code}/attempt`, { state: { quiz, questionCount } })}
            >
              <span>Start Quiz</span>
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizInstructions;
