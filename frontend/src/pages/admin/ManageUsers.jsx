import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { UserIcon, ArrowLeftIcon, EditIcon, PlusIcon, UploadCloudIcon, FileTextIcon, TrendingUpIcon, CheckCircleIcon, ArrowRightIcon, XCircleIcon, UsersIcon, CrownIcon, TrashIcon } from '../../components/Icons';

// ─── Shared helpers ──────────────────────────────────────────────────────────
const initialForm = { email: '', password: '', name: '', role: 'user' };

const Toast = ({ msg, type, onClose }) => {
  if (!msg) return null;
  const colors = { success: 'var(--neon-green)', error: 'var(--neon-red)', info: 'var(--neon-cyan)' };
  const borderColors = { success: 'rgba(0, 245, 160, 0.5)', error: 'rgba(255, 42, 85, 0.5)', info: 'rgba(0, 242, 254, 0.5)' };
  return (
    <div style={{
      padding: '12px 20px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontWeight: 700,
      background: 'rgba(10, 13, 28, 0.95)', border: `1.5px solid ${borderColors[type]}`,
      color: colors[type], display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
    }}>
      <span style={{ fontSize: '0.88rem' }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: colors[type], lineHeight: 1 }}>×</button>
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
      setCreateMsg({ type: 'success', text: `User "${res.data.user.email}" created successfully!` });
      setForm(initialForm);
      fetchUsers(1, search);
    } catch (err) {
      setCreateMsg({ type: 'error', text: `${err.response?.data?.message || 'Failed to create user.'}` });
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
      setUploadMsg({ type: 'success', text: `Upload complete: ${res.data.added} added, ${res.data.skipped} skipped, ${res.data.errors.length} errors.` });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchUsers(1, search);
    } catch (err) {
      setUploadMsg({ type: 'error', text: `${err.response?.data?.message || 'Upload failed.'}` });
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
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(14, 165, 233, 0.08) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 40px',
            marginBottom: 32,
            color: 'var(--text-primary)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: 12 }}>
              <UserIcon size={13} />
              <span>User Directory • Accounts</span>
            </div>
            <h1 className="page-title inline-icon gap-icon" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
              <span>Manage Users</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem' }}>Create individual student or admin accounts, or bulk import users via CSV.</p>
            <div style={{ marginTop: 20 }}>
              <Link to="/admin" className="btn btn-outline inline-icon gap-icon">
                <ArrowLeftIcon size={16} />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Two-column create area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

            {/* ── Manual Create ── */}
            <div className="card">
              <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <span className="badge badge-primary inline-icon gap-icon">
                  <EditIcon size={12} />
                  <span>Manual</span>
                </span>
                <span>Create Single User</span>
              </h2>

              {createMsg && (
                <Toast msg={createMsg.text} type={createMsg.type} onClose={() => setCreateMsg(null)} />
              )}

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="label">Email *</label>
                  <input
                    type="email" className="input" placeholder="user@example.com" required
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Password *</label>
                  <input
                    type="password" className="input" placeholder="Min. 6 characters" required minLength={6}
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Name <span style={{ opacity: 0.5 }}>(optional)</span></label>
                  <input
                    type="text" className="input" placeholder="Auto-derived from email"
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Role</label>
                  <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button className="btn btn-primary inline-icon gap-icon" type="submit" disabled={createLoading} style={{ marginTop: 6 }}>
                  <PlusIcon size={16} />
                  <span>{createLoading ? 'Creating...' : 'Create User'}</span>
                </button>
              </form>
            </div>

            {/* ── Bulk Upload ── */}
            <div className="card">
              <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <span className="badge badge-success inline-icon gap-icon">
                  <UploadCloudIcon size={12} />
                  <span>Bulk</span>
                </span>
                <span>Import from File</span>
              </h2>

              {uploadMsg && (
                <Toast msg={uploadMsg.text} type={uploadMsg.type} onClose={() => setUploadMsg(null)} />
              )}

              {/* Upload zone */}
              <div
                className="file-drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setUploadResult(null); setUploadMsg(null); } }}
                style={{
                  padding: '32px 20px',
                  marginBottom: 16,
                  borderColor: file ? 'var(--neon-green)' : 'var(--border)',
                  background: file ? 'rgba(0, 245, 160, 0.08)' : 'var(--bg-input)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  {file ? <FileTextIcon size={40} style={{ color: 'var(--neon-green)' }} /> : <UploadCloudIcon size={40} style={{ color: 'var(--neon-cyan)' }} />}
                </div>
                {file ? (
                  <p style={{ fontWeight: 700, color: 'var(--neon-green)', fontSize: '0.95rem' }}>{file.name}</p>
                ) : (
                  <>
                    <p style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: 6, fontSize: '0.95rem' }}>Drop CSV/Excel file or click to browse</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>Supports .csv and .xlsx — max 5 MB</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>Columns: <strong style={{ color: '#fff' }}>email</strong>, <strong style={{ color: '#fff' }}>password</strong>, name, role</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>

              {file && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary inline-icon gap-icon" onClick={handleUpload} disabled={uploadLoading} style={{ flex: 1 }}>
                    <UploadCloudIcon size={16} />
                    <span>{uploadLoading ? 'Uploading...' : 'Upload & Import'}</span>
                  </button>
                  <button className="btn btn-secondary inline-icon gap-icon" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ whiteSpace: 'nowrap' }}>
                    <XCircleIcon size={16} />
                    <span>Clear</span>
                  </button>
                </div>
              )}

              {/* Upload Result Summary */}
              {uploadResult && (
                <div style={{ marginTop: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div className="inline-icon gap-icon" style={{ background: 'var(--primary-light)', padding: '10px 14px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', width: '100%', boxSizing: 'border-box' }}>
                    <TrendingUpIcon size={16} />
                    <span>Upload Summary — {uploadResult.totalRows} rows processed</span>
                  </div>
                  <div style={{ padding: '12px 14px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span className="badge badge-success inline-icon gap-icon">
                      <CheckCircleIcon size={12} />
                      <span>{uploadResult.added} Added</span>
                    </span>
                    <span className="badge badge-warning inline-icon gap-icon">
                      <ArrowRightIcon size={12} />
                      <span>{uploadResult.skipped} Skipped</span>
                    </span>
                    <span className="badge badge-error inline-icon gap-icon">
                      <XCircleIcon size={12} />
                      <span>{uploadResult.errors.length} Errors</span>
                    </span>
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
                  className="input" type="search" placeholder="Search email or name…"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '8px 14px', fontSize: '0.88rem', minWidth: 220 }}
                />
                <button className="btn btn-primary btn-sm" type="submit">Search</button>
              </form>
            </div>

            {listLoading ? (
              <div className="loading-wrapper"><div className="spinner" /></div>
            ) : users.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UsersIcon size={48} style={{ color: 'var(--text-muted)' }} />
                </div>
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
                          <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-warning'} inline-icon gap-icon`}>
                            {u.role === 'admin' ? <CrownIcon size={12} /> : <UserIcon size={12} />}
                            <span>{u.role === 'admin' ? 'Admin' : 'User'}</span>
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', opacity: 0.7 }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger inline-icon gap-icon"
                            onClick={() => handleDelete(u._id)}
                            disabled={deleteId === u._id}
                          >
                            <TrashIcon size={14} />
                            <span>{deleteId === u._id ? '...' : 'Delete'}</span>
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
                <button className="btn btn-secondary btn-sm inline-icon gap-icon" onClick={() => fetchUsers(page - 1, search)} disabled={page <= 1}>
                  <ArrowLeftIcon size={14} />
                  <span>Prev</span>
                </button>
                <span style={{ padding: '6px 14px', fontWeight: 600, fontSize: '0.88rem', opacity: 0.7 }}>
                  Page {page} of {pages}
                </span>
                <button className="btn btn-secondary btn-sm inline-icon gap-icon" onClick={() => fetchUsers(page + 1, search)} disabled={page >= pages}>
                  <span>Next</span>
                  <ArrowRightIcon size={14} />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ManageUsers;
