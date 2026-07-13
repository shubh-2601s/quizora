import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { PlusIcon, ArrowRightIcon } from '../../components/Icons';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
    duration: 30, randomizeQuestions: false, allowReattempt: false,
  });

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
    setLoading(true);
    try {
      const { data } = await api.post('/quizzes', form);
      toast.success(`Quiz created! Code: ${data.quiz.code}`);
      navigate(`/admin/quiz/${data.quiz._id}/questions`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="page-header">
            <h1 className="page-title inline-icon gap-icon">
              <PlusIcon size={24} style={{ color: 'var(--primary)' }} />
              <span>Create New Quiz</span>
            </h1>
            <p className="page-subtitle">Fill in the details to create a quiz. A unique code will be generated automatically.</p>
          </div>

          <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Quiz Title *</label>
              <input className="input" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. JavaScript Fundamentals Quiz" required />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea className="textarea" name="description" value={form.description} onChange={handleChange}
                placeholder="Brief description of what this quiz covers..." rows={3} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="label">Start Date & Time *</label>
                <input className="input" type="datetime-local" name="startTime" value={form.startTime}
                  onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="label">End Date & Time *</label>
                <input className="input" type="datetime-local" name="endTime" value={form.endTime}
                  onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Quiz Duration (minutes) *</label>
              <input className="input" type="number" name="duration" min={1} max={300}
                value={form.duration} onChange={handleChange} required />
            </div>

            {/* Toggle Options */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 4 }}>Quiz Options</p>
              {[
                { name: 'randomizeQuestions', label: 'Randomize question order', desc: 'Questions appear in random order for each user' },
                { name: 'allowReattempt', label: 'Allow re-attempts', desc: 'Users can attempt this quiz more than once' },
              ].map((opt) => (
                <label key={opt.name} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" name={opt.name} checked={form[opt.name]} onChange={handleChange}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{opt.label}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/quizzes')}>Cancel</button>
              <button type="submit" className="btn btn-primary inline-icon gap-icon" style={{ flex: 1 }} disabled={loading}>
                <span>{loading ? 'Creating...' : 'Create Quiz & Add Questions'}</span>
                {!loading && <ArrowRightIcon size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateQuiz;
