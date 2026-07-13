import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { EditIcon, CheckCircleIcon, FileSpreadsheetIcon, PlusIcon, UploadCloudIcon, FileTextIcon, HelpCircleIcon, TrashIcon } from '../../components/Icons';

const EMPTY_Q = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' };

const AddQuestions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(EMPTY_Q);
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const fetchData = async () => {
    try {
      const [qRes, questionsRes] = await Promise.all([
        api.get(`/quizzes/${quizId}/details`),
        api.get(`/questions/${quizId}`),
      ]);
      setQuiz(qRes.data.quiz);
      setQuestions(questionsRes.data.questions);
    } catch { toast.error('Failed to load quiz'); }
  };

  useEffect(() => { fetchData(); }, [quizId]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/questions', { quizId, ...form });
      toast.success('Question added!');
      setForm(EMPTY_Q);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add question');
    } finally { setLoading(false); }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) { toast.error('Please select a CSV file'); return; }
    setCsvUploading(true);
    const fd = new FormData();
    fd.append('file', csvFile);
    try {
      const { data } = await api.post(`/questions/bulk/${quizId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message);
      if (data.errors?.length) data.errors.forEach((e) => toast.error(e));
      setCsvFile(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setCsvUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-title inline-icon gap-icon">
                <EditIcon size={24} style={{ color: 'var(--primary)' }} />
                <span>Add Questions</span>
              </h1>
              <p className="page-subtitle">{quiz?.title} — {questions.length} question(s) added</p>
            </div>
            <button className="btn btn-primary inline-icon gap-icon" onClick={() => navigate(`/admin/quiz/${quizId}`)}>
              <CheckCircleIcon size={16} />
              <span>Done — View Quiz</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Left: Add forms */}
            <div>
              <div className="tabs" style={{ marginBottom: 16 }}>
                <button className={`tab-btn ${activeTab === 'manual' ? 'active' : ''} inline-icon gap-icon`} onClick={() => setActiveTab('manual')}>
                  <EditIcon size={14} />
                  <span>Manual</span>
                </button>
                <button className={`tab-btn ${activeTab === 'csv' ? 'active' : ''} inline-icon gap-icon`} onClick={() => setActiveTab('csv')}>
                  <FileSpreadsheetIcon size={14} />
                  <span>CSV Upload</span>
                </button>
              </div>

              {activeTab === 'manual' && (
                <form className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleManualSubmit}>
                  <div className="form-group">
                    <label className="label">Question *</label>
                    <textarea className="textarea" value={form.question} rows={2}
                      onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Enter the question..." required />
                  </div>
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="form-group">
                      <label className="label">Option {opt}</label>
                      <input className="input" value={form[`option${opt}`]}
                        onChange={(e) => setForm({ ...form, [`option${opt}`]: e.target.value })}
                        placeholder={`Option ${opt}`} required />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="label">Correct Answer *</label>
                    <select className="select" value={form.correctAnswer}
                      onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}>
                      {['A', 'B', 'C', 'D'].map((o) => <option key={o} value={o}>Option {o}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary btn-full inline-icon gap-icon" disabled={loading}>
                    <PlusIcon size={16} />
                    <span>{loading ? 'Adding...' : 'Add Question'}</span>
                  </button>
                </form>
              )}

              {activeTab === 'csv' && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div
                    className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setCsvFile(f); }}
                  >
                    <div className="file-drop-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <UploadCloudIcon size={36} style={{ color: 'var(--primary)' }} />
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop CSV file here or click to browse</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Maximum file size: 5MB</p>
                    {csvFile && (
                      <p className="inline-icon gap-icon" style={{ marginTop: 8, color: 'var(--primary)', fontWeight: 600 }}>
                        <FileTextIcon size={16} />
                        <span>{csvFile.name}</span>
                      </p>
                    )}
                    <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => setCsvFile(e.target.files[0])} />
                  </div>

                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                    <p className="inline-icon gap-icon" style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>
                      <FileTextIcon size={14} />
                      <span>CSV Format:</span>
                    </p>
                    <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                      question,optionA,optionB,optionC,optionD,correctAnswer
                    </code>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      correctAnswer must be A, B, C, or D
                    </p>
                  </div>

                  <button className="btn btn-primary btn-full inline-icon gap-icon" onClick={handleCsvUpload} disabled={csvUploading || !csvFile}>
                    <UploadCloudIcon size={16} />
                    <span>{csvUploading ? 'Uploading...' : 'Upload CSV'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Questions list */}
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem' }}>
                Current Questions ({questions.length})
              </h2>
              {questions.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HelpCircleIcon size={48} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p>No questions yet. Add some!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {questions.map((q, i) => (
                    <div key={q._id} className="card" style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <span className="badge badge-primary" style={{ marginBottom: 6 }}>Q{i + 1}</span>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{q.question}</p>
                          <p className="inline-icon gap-icon" style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: 4 }}>
                            <CheckCircleIcon size={14} />
                            <span>Correct: {q.correctAnswer} — {q[`option${q.correctAnswer}`]}</span>
                          </p>
                        </div>
                        <button className="btn btn-danger btn-icon btn-sm inline-icon" onClick={() => handleDelete(q._id)} title="Delete question">
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddQuestions;
