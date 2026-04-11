import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const UserHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/submissions/user')
      .then(({ data }) => setSubmissions(data.submissions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">📜 My Quiz History</h1>
            <p className="page-subtitle">All your quiz attempts and scores</p>
          </div>

          {loading ? (
            <div className="loading-wrapper"><div className="spinner" /></div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No attempts yet</p>
              <p style={{ fontSize: '0.875rem' }}>Enter a quiz code from your dashboard to get started!</p>
              <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>Go to Dashboard</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Quiz Title</th>
                    <th>Code</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Time Taken</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, i) => {
                    const pct = Math.round((sub.score / sub.total) * 100);
                    return (
                      <tr key={sub._id}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{sub.quiz?.title || 'N/A'}</td>
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
