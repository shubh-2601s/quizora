import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import {
  TargetIcon, ClockIcon, TrophyIcon, TrendingUpIcon, ArrowRightIcon,
  SparklesIcon, CheckCircleIcon, FlameIcon, ShieldIcon, ZapIcon, HelpCircleIcon
} from '../../components/Icons';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [requirePasscode, setRequirePasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);

  // Gamification & Exploration State
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    totalScore: 0,
    accuracy: 0,
    xp: 0,
    level: 1,
    levelTitle: 'Cyber Recruit',
    xpProgress: 0,
    streak: 1,
    badges: [],
  });
  const [loadingData, setLoadingData] = useState(true);

  // Fetch Public Quizzes & User Gamification Stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [quizzesRes, subsRes] = await Promise.allSettled([
          api.get('/quizzes/public'),
          api.get('/submissions/user'),
        ]);

        if (quizzesRes.status === 'fulfilled') {
          setPublicQuizzes(quizzesRes.value.data.quizzes || []);
        }

        if (subsRes.status === 'fulfilled') {
          const subs = subsRes.value.data.submissions || [];
          const totalQuizzes = subs.length;
          const totalScore = subs.reduce((acc, s) => acc + (s.score || 0), 0);
          const totalPossible = subs.reduce((acc, s) => acc + (s.total || 0), 0);
          const accuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

          // XP: 100 XP per attempt + 25 XP per correct point
          const xp = totalQuizzes * 100 + totalScore * 25;
          const level = Math.floor(xp / 500) + 1;
          const xpProgress = Math.round(((xp % 500) / 500) * 100);

          const titles = ['Novice', 'Apprentice', 'Scholar', 'Specialist', 'Expert', 'Master'];
          const levelTitle = titles[Math.min(level - 1, titles.length - 1)];

          // Streak calculation (days with submissions)
          const distinctDays = new Set(subs.map(s => new Date(s.createdAt).toDateString()));
          const streak = distinctDays.size > 0 ? distinctDays.size : 1;

          // Badges calculation
          const has100 = subs.some(s => s.score === s.total && s.total > 0);
          const hasFast = subs.some(s => s.timeTaken && s.timeTaken < 180 && s.score >= 1);
          const hasElim = subs.some(s => s.quiz?.quizMode === 'elimination' && !s.isEliminated);

          const badges = [
            {
              id: 'first_quiz',
              title: 'First Step',
              desc: 'Completed your first quiz',
              icon: '🚀',
              unlocked: totalQuizzes >= 1,
            },
            {
              id: 'perfect_score',
              title: 'Perfect Score',
              desc: 'Achieved 100% accuracy',
              icon: '🎯',
              unlocked: has100,
            },
            {
              id: 'quick_thinker',
              title: 'Quick Thinker',
              desc: 'Completed a quiz in under 3 mins',
              icon: '⚡',
              unlocked: hasFast,
            },
            {
              id: 'survivor',
              title: 'Survivor',
              desc: 'Completed an elimination round',
              icon: '🛡️',
              unlocked: hasElim,
            },
            {
              id: 'veteran',
              title: 'Quiz Veteran',
              desc: 'Completed 5+ quizzes',
              icon: '🌟',
              unlocked: totalQuizzes >= 5,
            },
          ];

          setUserStats({
            totalQuizzes,
            totalScore,
            accuracy,
            xp,
            level,
            levelTitle,
            xpProgress,
            streak,
            badges,
          });
        }
      } catch (e) {
        console.error('Error loading dashboard data', e);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const url = requirePasscode
        ? `/quizzes/code/${code.trim()}?passcode=${encodeURIComponent(passcode.trim())}`
        : `/quizzes/code/${code.trim()}`;
      const { data } = await api.get(url);
      navigate(`/quiz/${code.trim()}/instructions`, { state: { quizData: data, passcode: passcode.trim() } });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requirePasscode) {
        setRequirePasscode(true);
        toast.error('Passcode required for this quiz!');
      } else {
        const msg = err.response?.data?.message;
        const alreadyAttempted = err.response?.data?.alreadyAttempted;
        if (alreadyAttempted) {
          toast.error('You have already attempted this quiz!');
          const sub = err.response?.data?.submission;
          if (sub) navigate(`/result/${sub._id}`);
        } else {
          toast.error(msg || 'Invalid quiz code');
        }
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

          {/* Hero Welcome & Progress Banner */}
          <div
            className="hero-banner"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(14, 165, 233, 0.08) 100%)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '34px 40px',
              marginBottom: 32,
              color: 'var(--text-primary)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
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
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                  Level {userStats.level} • {userStats.levelTitle}
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.1rem',
                    fontWeight: 800,
                    marginBottom: 6,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 540 }}>
                  Enter a quiz code below to start your test, or check out our open public challenges.
                </p>
              </div>

              {/* Progress & Streak Stats */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: 'var(--glow-card)',
                  }}
                >
                  <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🔥</span>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--warning)', lineHeight: 1 }}>
                      {userStats.streak} {userStats.streak === 1 ? 'Day' : 'Days'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
                      Day Streak
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: 'var(--glow-card)',
                  }}
                >
                  <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⭐</span>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                      {userStats.xp} XP
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
                      Level {userStats.level}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div style={{ marginTop: 24, maxWidth: 600 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                <span style={{ color: 'var(--primary)' }}>
                  Level {userStats.level} ({userStats.levelTitle})
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {userStats.xp % 500} / 500 XP to Level {userStats.level + 1}
                </span>
              </div>
              <div style={{ height: 8, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(8, userStats.xpProgress)}%`,
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main Grid: Code Entry + Achievements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, marginBottom: 36, alignItems: 'start' }}>
            
            {/* Left: Join a Quiz Card */}
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                    marginBottom: 12,
                  }}
                >
                  <TargetIcon size={24} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  Join a Quiz
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                  Enter the access code given by your instructor to start immediately
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  className="code-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="QUIZ CODE"
                  maxLength={10}
                  disabled={requirePasscode || loading}
                  autoFocus={!requirePasscode}
                />
                {requirePasscode && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--error)' }}>
                      🔒 Quiz Passcode Required:
                    </label>
                    <input
                      className="code-input"
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="ENTER PASSCODE"
                      autoFocus
                      required
                    />
                  </div>
                )}
                <button
                  className="btn btn-primary btn-full btn-lg inline-icon gap-icon"
                  type="submit"
                  disabled={loading || !code.trim()}
                  style={{ marginTop: 4 }}
                >
                  <span>{loading ? 'Connecting...' : requirePasscode ? 'Verify & Start' : 'Start Quiz'}</span>
                  {!loading && <ArrowRightIcon size={18} />}
                </button>
                {requirePasscode && (
                  <button
                    type="button"
                    className="btn btn-outline btn-full"
                    onClick={() => {
                      setRequirePasscode(false);
                      setPasscode('');
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            {/* Right: Player Achievements & Badges Deck */}
            <div className="card">
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrophyIcon size={18} style={{ color: 'var(--warning)' }} />
                  <span>Your Achievements</span>
                </h2>
                <span className="badge badge-accent">
                  {userStats.badges.filter(b => b.unlocked).length} of {userStats.badges.length || 5} Unlocked
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {userStats.badges.map((badge) => (
                  <div
                    key={badge.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: badge.unlocked ? 'var(--primary-light)' : 'rgba(0, 0, 0, 0.02)',
                      border: `1px solid ${badge.unlocked ? 'rgba(99, 102, 241, 0.25)' : 'var(--border-light)'}`,
                      opacity: badge.unlocked ? 1 : 0.7,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.4rem',
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        background: badge.unlocked ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {badge.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: badge.unlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {badge.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {badge.desc}
                      </div>
                    </div>
                    {badge.unlocked ? (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Unlocked</span>
                    ) : (
                      <span className="badge" style={{ background: 'var(--border-light)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Locked</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section: Featured Public Quizzes */}
          <div style={{ marginBottom: 36 }}>
            <div className="flex-between" style={{ marginBottom: 18 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SparklesIcon size={20} style={{ color: 'var(--success)' }} />
                  <span>Public Quizzes</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 2 }}>
                  Open quizzes you can take right now for practice and fun
                </p>
              </div>
              <Link to="/history" className="btn btn-outline btn-sm inline-icon gap-icon">
                <TrendingUpIcon size={14} />
                <span>My History</span>
              </Link>
            </div>

            {publicQuizzes.length === 0 ? (
              <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  No active public quizzes right now. Ask your instructor for a direct access code or check back shortly!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {publicQuizzes.map((quiz) => (
                  <div key={quiz._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="flex-between">
                      <span className="badge badge-primary">{quiz.category || 'General'}</span>
                      <span className="badge badge-success">Active</span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, maxHeight: 40, overflow: 'hidden' }}>
                        {quiz.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
                      <span className="inline-icon gap-icon">
                        <ClockIcon size={14} />
                        {quiz.duration} mins
                      </span>
                      <span className="inline-icon gap-icon">
                        <HelpCircleIcon size={14} />
                        {quiz.questionCount || 0} Questions
                      </span>
                    </div>

                    <button
                      className="btn btn-primary btn-sm inline-icon gap-icon"
                      onClick={() => navigate(`/quiz/${quiz.code}/instructions`)}
                      style={{ marginTop: 6 }}
                    >
                      <span>Take Quiz</span>
                      <ArrowRightIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default UserDashboard;
