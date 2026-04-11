import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

// ─── Shared helpers ──────────────────────────────────────────────────────────
const initialForm = { email: '', password: '', name: '', role: 'user' };

const Toast = ({ msg, type, onClose }) => {
  if (!msg) return null;
  const colors = { success: '#10B981', error: '#EF4444', info: '#6C63FF' };
  return (
    <div style={{
      padding: '12px 20px', borderRadius: 10, marginBottom: 16, fontWeight: 600,
      background: `${colors[type]}18`, border: `1.5px solid ${colors[type]}`,
      color: colors[type], display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: colors[type] }}>×</button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ManageUsers = () => {
  // Manual create state
  const [form, setForm] = useState(initialForm);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);

  // Bulk upload state
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef();

  // Users list state
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async (p = 1, q = search) => {
    setListLoading(true);
    try {
      const res = await api.get(`/users?page=${p}&limit=10&search=${encodeURIComponent(q)}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setPages(res.data.pages);
      setPage(p);
    } catch {
      // silently fail — table shows empty
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1, ''); }, []);

  // ── Manual create submit
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg(null);
    try {
      const res = await api.post('/users/create', form);
      setCreateMsg({ type: 'success', text: `✅ User "${res.data.user.email}" created successfully!` });
      setForm(initialForm);
      fetchUsers(1, search);
    } catch (err) {
      setCreateMsg({ type: 'error', text: `❌ ${err.response?.data?.message || 'Failed to create user.'}` });
    } finally {
      setCreateLoading(false);
    }
  };

  // ── File change
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    setUploadResult(null);
    setUploadMsg(null);
  };

  // ── Bulk upload submit
  const handleUpload = async () => {
    if (!file) return;
    setUploadLoading(true);
    setUploadMsg(null);
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/users/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
      setUploadMsg({ type: 'success', text: `✅ Upload complete: ${res.data.added} added, ${res.data.skipped} skipped, ${res.data.errors.length} errors.` });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchUsers(1, search);
    } catch (err) {
      setUploadMsg({ type: 'error', text: `❌ ${err.response?.data?.message || 'Upload failed.'}` });
    } finally {
      setUploadLoading(false);
    }
  };

  // ── Delete user
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeleteId(id);
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(page, search);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  // ── Render
  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            borderRadius: 'var(--radius-xl)', padding: '28px 36px', marginBottom: 32, color: '#fff',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 160, height: 160, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 6 }}>👤 Manage Users</h1>
            <p style={{ opacity: 0.85 }}>Create user accounts manually or import from a CSV / Excel file.</p>
            <div style={{ marginTop: 16 }}>
              <Link to="/admin" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Two-column create area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

            {/* ── Manual Create ── */}
            <div className="card">
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#EDE9FF', color: 'var(--primary)', borderRadius: 8, padding: '4px 10px', fontSize: '0.85rem' }}>✏️ Manual</span>
                Create Single User
              </h2>

              {createMsg && (
                <Toast msg={createMsg.text} type={createMsg.type} onClose={() => setCreateMsg(null)} />
              )}

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email" className="form-input" placeholder="user@example.com" required
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password" className="form-input" placeholder="Min. 6 characters" required minLength={6}
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Name <span style={{ opacity: 0.5 }}>(optional)</span></label>
                  <input
                    type="text" className="form-input" placeholder="Auto-derived from email"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button className="btn btn-primary" type="submit" disabled={createLoading} style={{ marginTop: 4 }}>
                  {createLoading ? 'Creating...' : '➕ Create User'}
                </button>
              </form>
            </div>

            {/* ── Bulk Upload ── */}
            <div className="card">
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 8, padding: '4px 10px', fontSize: '0.85rem' }}>📤 Bulk</span>
                Import from File
              </h2>

              {uploadMsg && (
                <Toast msg={uploadMsg.text} type={uploadMsg.type} onClose={() => setUploadMsg(null)} />
              )}

              {/* Upload zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setUploadResult(null); setUploadMsg(null); } }}
                style={{
                  border: `2px dashed ${file ? 'var(--primary)' : '#C4B5FD'}`,
                  borderRadius: 12, padding: '28px 16px', textAlign: 'center', cursor: 'pointer',
                  background: file ? '#EDE9FF40' : '#FAFAFA', transition: 'all 0.2s', marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{file ? '📄' : '☁️'}</div>
                {file ? (
                  <p style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>{file.name}</p>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop a file here or click to browse</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Supports .csv and .xlsx — max 5 MB</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: 6 }}>Columns: <strong>email</strong>, <strong>password</strong>, name (optional), role (optional)</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>

              {file && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleUpload} disabled={uploadLoading} style={{ flex: 1 }}>
                    {uploadLoading ? 'Uploading...' : '🚀 Upload & Import'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ whiteSpace: 'nowrap' }}>
                    ✕ Clear
                  </button>
                </div>
              )}

              {/* Upload Result Summary */}
              {uploadResult && (
                <div style={{ marginTop: 16, border: '1px solid #E5E1FF', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ background: '#EDE9FF', padding: '10px 14px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                    📊 Upload Summary — {uploadResult.totalRows} rows processed
                  </div>
                  <div style={{ padding: '12px 14px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span className="badge badge-success">✅ {uploadResult.added} Added</span>
                    <span className="badge badge-warning">⏭️ {uploadResult.skipped} Skipped</span>
                    <span className="badge badge-error">❌ {uploadResult.errors.length} Errors</span>
                  </div>
                  {uploadResult.errors.length > 0 && (
                    <div style={{ padding: '0 14px 12px', maxHeight: 120, overflowY: 'auto' }}>
                      {uploadResult.errors.map((e, i) => (
                        <div key={i} style={{ fontSize: '0.78rem', color: '#EF4444', marginBottom: 2 }}>
                          Row {e.row}{e.email ? ` (${e.email})` : ''}: {e.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Users Table ── */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                All Users <span style={{ opacity: 0.5, fontSize: '0.85rem', fontWeight: 500 }}>({total})</span>
              </h2>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input" type="search" placeholder="Search email or name…"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: 200 }}
                />
                <button className="btn btn-secondary btn-sm" type="submit">Search</button>
              </form>
            </div>

            {listLoading ? (
              <div className="loading-wrapper"><div className="spinner" /></div>
            ) : users.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-icon">👥</div>
                <p>{search ? 'No users match your search.' : 'No users yet. Create one above!'}</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={u._id}>
                        <td style={{ opacity: 0.5, fontSize: '0.85rem' }}>{(page - 1) * 10 + idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-warning'}`}>
                            {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', opacity: 0.7 }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#FEE2E2', color: '#EF4444', fontWeight: 600 }}
                            onClick={() => handleDelete(u._id)}
                            disabled={deleteId === u._id}
                          >
                            {deleteId === u._id ? '...' : '🗑️ Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => fetchUsers(page - 1, search)} disabled={page <= 1}>← Prev</button>
                <span style={{ padding: '6px 14px', fontWeight: 600, fontSize: '0.88rem', opacity: 0.7 }}>
                  Page {page} of {pages}
                </span>
                <button className="btn btn-secondary btn-sm" onClick={() => fetchUsers(page + 1, search)} disabled={page >= pages}>Next →</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ManageUsers;
