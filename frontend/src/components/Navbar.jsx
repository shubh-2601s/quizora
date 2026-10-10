import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TargetIcon, CrownIcon, UserIcon, LogOutIcon, SunIcon, MoonIcon } from './Icons';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('quizapp_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quizapp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => (location.pathname === path ? 'nav-link active' : 'nav-link');

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="nav-logo">
          <div className="nav-logo-icon">
            <TargetIcon size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              className="nav-logo-text"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 60%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Quizora
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.04em',
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              Interactive Quizzes
            </span>
          </div>
        </Link>

        <div className="nav-links">
          {isAdmin ? (
            <>
              <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
              <Link to="/admin/quizzes" className={isActive('/admin/quizzes')}>Quizzes</Link>
              <Link to="/admin/create-quiz" className={isActive('/admin/create-quiz')}>Create Quiz</Link>
              <Link to="/admin/manage-users" className={isActive('/admin/manage-users')}>Users</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <Link to="/history" className={isActive('/history')}>My History</Link>
            </>
          )}
        </div>

        <div className="nav-user">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            <span className={`theme-toggle-icon ${theme === 'light' ? 'sun' : 'moon'}`}>
              {theme === 'light' ? <SunIcon size={15} /> : <MoonIcon size={15} />}
            </span>
            <span>{theme === 'light' ? 'LIGHT' : 'DARK'}</span>
          </button>
          <div className="nav-avatar" title={user?.name}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              maxWidth: 130,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.name}
          </span>
          <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-accent'} inline-icon gap-icon`}>
            {isAdmin ? (
              <>
                <CrownIcon size={12} />
                <span>Admin</span>
              </>
            ) : (
              <>
                <UserIcon size={12} />
                <span>Student</span>
              </>
            )}
          </span>
          <button className="btn btn-outline btn-sm inline-icon gap-icon" onClick={handleLogout}>
            <LogOutIcon size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
