import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import QuizCard from '../../components/QuizCard';
import toast from 'react-hot-toast';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/quizzes');
      setQuizzes(data.quizzes);
    } catch { toast.error('Failed to load quizzes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz and all its questions/submissions?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      toast.success('Quiz deleted');
      fetchQuizzes();
    } catch { toast.error('Failed to delete quiz'); }
  };

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="flex-between" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-title">📋 My Quizzes</h1>
              <p className="page-subtitle">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} created</p>
            </div>
            <Link to="/admin/create-quiz" className="btn btn-primary">➕ Create Quiz</Link>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <input
              className="input"
              placeholder="🔍 Search by title or quiz code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading-wrapper"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{search ? '🔍' : '📋'}</div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>{search ? 'No quizzes match your search' : 'No quizzes yet'}</p>
              {!search && <Link to="/admin/create-quiz" className="btn btn-primary">Create your first quiz</Link>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {filtered.map((quiz) => (
                <QuizCard key={quiz._id} quiz={quiz} isAdmin onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuizList;
