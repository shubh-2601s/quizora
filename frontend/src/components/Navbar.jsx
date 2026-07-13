import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TargetIcon, CrownIcon, UserIcon, LogOutIcon, SunIcon, MoonIcon } from './Icons';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('quizapp_theme') || 'light');

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

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="nav-logo">
          <div className="nav-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <TargetIcon size={20} />
          </div>
          <span className="nav-logo-text">QuizApp</span>
        </Link>

        <div className="nav-links">
          {isAdmin ? (
            <>
              <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
              <Link to="/admin/quizzes" className={isActive('/admin/quizzes')}>My Quizzes</Link>
              <Link to="/admin/create-quiz" className={isActive('/admin/create-quiz')}>Create Quiz</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <Link to="/history" className={isActive('/history')}>My Attempts</Link>
            </>
          )}
        </div>

        <div className="nav-user">
          <button
            onClick={toggleTheme}
            className="btn btn-outline btn-sm inline-icon"
            style={{ marginRight: 8, padding: '6px 10px', background: 'none' }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
          </button>
          <div className="nav-avatar" title={user?.name}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                <span>User</span>
              </>
            )}
          </span>
          <button className="btn btn-outline btn-sm inline-icon gap-icon" onClick={handleLogout}>
            <LogOutIcon size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
