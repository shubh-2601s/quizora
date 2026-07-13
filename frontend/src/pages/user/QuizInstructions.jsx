import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { HelpCircleIcon, ClockIcon, TargetIcon, FileTextIcon, ArrowLeftIcon, ArrowRightIcon } from '../../components/Icons';

const QuizInstructions = () => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { quizData } = location.state || {};

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
    'Switching tabs or windows will trigger a warning.',
    quiz.randomizeQuestions ? 'Questions are presented in random order.' : 'Questions are in a fixed order.',
    quiz.allowReattempt ? 'You may attempt this quiz multiple times.' : 'You can only attempt this quiz once.',
  ];

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
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{inst}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline inline-icon gap-icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeftIcon size={16} />
              <span>Back</span>
            </button>
            <button
              className="btn btn-primary btn-lg inline-icon gap-icon"
              style={{ flex: 1 }}
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
