import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ---- Task Modal ----
function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(
    task || { title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{task ? '✏️ Edit Task' : '➕ New Task'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="Task title" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input name="description" value={form.description} onChange={handleChange} placeholder="Optional description" />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange} style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #e1e5e9'}}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} style={{width:'100%',padding:'10px',borderRadius:'8px',border:'2px solid #e1e5e9'}}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" name="dueDate" value={form.dueDate || ''} onChange={handleChange} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main Dashboard ----
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | task object
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchTasks = useCallback(async (page = 1) => {
    try {
      const params = { page, limit: 8, ...filters };
      const { data } = await api.get('/tasks', { params });
      setTasks(data.data.tasks);
      setPagination(data.data.pagination);
    } catch (err) {
      showAlert('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch {}
  }, [user]);

  useEffect(() => { fetchTasks(1); }, [fetchTasks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleCreate = async (form) => {
    await api.post('/tasks', form);
    showAlert('Task created successfully!');
    fetchTasks(1);
  };

  const handleUpdate = async (form) => {
    await api.put(`/tasks/${modal.id}`, form);
    showAlert('Task updated successfully!');
    fetchTasks(pagination.page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      showAlert('Task deleted.');
      fetchTasks(1);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const statusCounts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <span className="navbar-brand">📋 TaskManager</span>
          <div className="navbar-user">
            <span style={{fontSize:'14px', color:'#444'}}>{user?.name}</span>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            <button className="btn btn-secondary" onClick={logout} style={{padding:'8px 16px',fontSize:'13px'}}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard">
        <div className="container">

          {/* Alert */}
          {alert && (
            <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`} style={{marginBottom:'16px'}}>
              {alert.message}
            </div>
          )}

          {/* Admin Stats */}
          {user?.role === 'admin' && stats && (
            <div className="stats-grid">
              {[
                { label: 'Total Users', number: stats.totalUsers, icon: '👥' },
                { label: 'Total Tasks', number: stats.totalTasks, icon: '📋' },
                { label: 'Pending', number: stats.pendingTasks, icon: '⏳' },
                { label: 'Completed', number: stats.completedTasks, icon: '✅' },
              ].map((s) => (
                <div className="stat-card" key={s.label}>
                  <div className="number">{s.icon} {s.number}</div>
                  <div className="label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tasks Section */}
          <div className="tasks-section">
            <div className="tasks-header">
              <h2>📌 My Tasks ({pagination.total})</h2>
              <button className="btn btn-primary" onClick={() => setModal('create')}>
                + New Task
              </button>
            </div>

            {/* Filters */}
            <div className="filters">
              <input
                placeholder="🔍 Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchTasks(1)}
              />
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button className="btn btn-secondary" onClick={() => { setFilters({ status: '', priority: '', search: '' }); }}>
                Clear
              </button>
            </div>

            {/* Task List */}
            {loading ? (
              <p style={{textAlign:'center',padding:'40px',color:'#999'}}>Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <p>📭 No tasks found</p>
                <span>Create your first task!</span>
              </div>
            ) : (
              tasks.map((task) => (
                <div className="task-card" key={task.id}>
                  <div className="task-card-header">
                    <div style={{flex:1}}>
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                      <div className="task-meta">
                        <span className={`tag tag-${task.status}`}>{task.status.replace('_', ' ')}</span>
                        <span className={`tag tag-${task.priority}`}>{task.priority}</span>
                        {task.dueDate && <span style={{fontSize:'12px',color:'#999'}}>📅 {task.dueDate}</span>}
                        {user?.role === 'admin' && task.owner && (
                          <span style={{fontSize:'12px',color:'#999'}}>👤 {task.owner.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="task-actions">
                      <button className="btn btn-secondary" style={{padding:'6px 12px',fontSize:'13px'}} onClick={() => setModal(task)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" style={{padding:'6px 12px',fontSize:'13px'}} onClick={() => handleDelete(task.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button className="btn btn-secondary" disabled={pagination.page === 1} onClick={() => fetchTasks(pagination.page - 1)}>
                  ← Prev
                </button>
                <span style={{fontSize:'14px',color:'#666'}}>Page {pagination.page} of {pagination.totalPages}</span>
                <button className="btn btn-secondary" disabled={pagination.page === pagination.totalPages} onClick={() => fetchTasks(pagination.page + 1)}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'create' && (
        <TaskModal onClose={() => setModal(null)} onSave={handleCreate} />
      )}
      {modal && modal !== 'create' && (
        <TaskModal task={modal} onClose={() => setModal(null)} onSave={handleUpdate} />
      )}
    </>
  );
}
