import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { EditIcon, SaveIcon } from '../../components/Icons';

const EditQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
    duration: 30, randomizeQuestions: false, allowReattempt: false,
  });

  useEffect(() => {
    api.get(`/quizzes/${quizId}/details`).then(({ data }) => {
      const q = data.quiz;
      const toLocal = (d) => new Date(d).toISOString().slice(0, 16);
      setForm({
        title: q.title, description: q.description || '',
        startTime: toLocal(q.startTime), endTime: toLocal(q.endTime),
        duration: q.duration, randomizeQuestions: q.randomizeQuestions,
        allowReattempt: q.allowReattempt,
      });
    }).catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      toast.error('End time must be after start time');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/quizzes/${quizId}`, form);
      toast.success('Quiz updated successfully!');
      navigate(`/admin/quiz/${quizId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return <><Navbar /><div className="loading-wrapper"><div className="spinner" /></div></>;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="page-header">
            <h1 className="page-title inline-icon gap-icon">
              <EditIcon size={24} style={{ color: 'var(--primary)' }} />
              <span>Edit Quiz</span>
            </h1>
            <p className="page-subtitle">Update quiz details. The quiz code cannot be changed.</p>
          </div>

          <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Quiz Title *</label>
              <input className="input" name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="textarea" name="description" value={form.description} onChange={handleChange} rows={3} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="label">Start Time *</label>
                <input className="input" type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="label">End Time *</label>
                <input className="input" type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Duration (minutes) *</label>
              <input className="input" type="number" name="duration" min={1} max={300} value={form.duration} onChange={handleChange} required />
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'randomizeQuestions', label: 'Randomize question order' },
                { name: 'allowReattempt', label: 'Allow re-attempts' },
              ].map((opt) => (
                <label key={opt.name} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" name={opt.name} checked={form[opt.name]} onChange={handleChange}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{opt.label}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(`/admin/quiz/${quizId}`)}>Cancel</button>
              <button type="submit" className="btn btn-primary inline-icon gap-icon" style={{ flex: 1 }} disabled={saving}>
                <SaveIcon size={16} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditQuiz;
