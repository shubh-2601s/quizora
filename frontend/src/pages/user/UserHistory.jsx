import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { HistoryIcon, InboxIcon, TrendingUpIcon } from '../../components/Icons';

const UserHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    api.get('/submissions/user')
      .then(({ data }) => setSubmissions(data.submissions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(submissions.map(sub => sub.quiz?.category || 'General')));

  const filteredSubmissions = submissions.filter(sub => {
    if (!categoryFilter) return true;
    return (sub.quiz?.category || 'General') === categoryFilter;
  });

  const renderTrendChart = () => {
    if (submissions.length === 0) return null;

    const trend = [...submissions]
      .reverse()
      .slice(-10); // Show last 10 attempts

    const width = 600;
    const height = 180;
    const paddingX = 40;
    const paddingY = 25;

    const points = trend.map((sub, idx) => {
      const pct = Math.round((sub.score / sub.total) * 100);
      const x = paddingX + (idx * (width - 2 * paddingX)) / (trend.length - 1 || 1);
      const y = height - paddingY - (pct * (height - 2 * paddingY)) / 100;
      return { x, y, pct };
    });

    const pathData = points.reduce((acc, p, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }, '');

    const areaData = points.length > 0
      ? `${pathData} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : '';

    return (
      <div className="card" style={{ marginBottom: 28, padding: '24px 28px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUpIcon size={18} style={{ color: 'var(--primary)' }} />
          <span>Performance Trend (Last 10 Attempts)</span>
        </h3>
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: 500, height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = height - paddingY - (val * (height - 2 * paddingY)) / 100;
              return (
                <g key={val}>
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--border-light)" strokeWidth={1} strokeDasharray="4 4" />
                  <text x={paddingX - 10} y={y + 4} textAnchor="end" style={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 600 }}>{val}%</text>
                </g>
              );
            })}

            {/* Area path */}
            {areaData && <path d={areaData} fill="url(#chartGrad)" />}

            {/* Line path */}
            {pathData && <path d={pathData} fill="none" stroke="url(#lineGrad)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}

            {/* Dots */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r={5} fill="var(--bg-card)" stroke="var(--primary)" strokeWidth={3} style={{ cursor: 'pointer' }} />
                <circle cx={p.x} cy={p.y} r={9} fill="var(--primary)" opacity={0} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.target.setAttribute('opacity', 0.15)} onMouseLeave={(e) => e.target.setAttribute('opacity', 0)} />
                <text x={p.x} y={p.y - 12} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--text-primary)', fontWeight: 700 }}>{p.pct}%</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title inline-icon gap-icon">
              <HistoryIcon size={24} style={{ color: 'var(--primary)' }} />
              <span>My Quiz History</span>
            </h1>
            <p className="page-subtitle">All your quiz attempts and scores</p>
          </div>

          {!loading && submissions.length > 0 && renderTrendChart()}

          {submissions.length > 0 && (
            <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', padding: '12px 20px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter by Category:</span>
              <select
                className="select"
                style={{ maxWidth: 200, padding: '4px 8px', fontSize: '0.85rem' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {loading ? (
            <div className="loading-wrapper"><div className="spinner" /></div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <InboxIcon size={48} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No attempts yet</p>
              <p style={{ fontSize: '0.875rem' }}>Enter a quiz code from your dashboard to get started!</p>
              <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Dashboard</Link>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No attempts match this category</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setCategoryFilter('')}>Reset Filter</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Quiz Title</th>
                    <th>Category</th>
                    <th>Code</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Time Taken</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub, i) => {
                    const pct = Math.round((sub.score / sub.total) * 100);
                    return (
                      <tr key={sub._id}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{sub.quiz?.title || 'N/A'}</td>
                        <td>
                          <span className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
                            {sub.quiz?.category || 'General'}
                          </span>
                        </td>
                        <td><span className="badge badge-primary" style={{ fontFamily: 'monospace' }}>{sub.quiz?.code}</span></td>
                        <td><strong>{sub.score}</strong>/{sub.total}</td>
                        <td>
                          <span className={`badge ${pct >= 50 ? 'badge-success' : 'badge-error'}`}>{pct}%</span>
                        </td>
                        <td>{Math.floor(sub.timeTaken / 60)}m {sub.timeTaken % 60}s</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <Link to={`/result/${sub._id}`} className="btn btn-secondary btn-sm">View</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserHistory;
