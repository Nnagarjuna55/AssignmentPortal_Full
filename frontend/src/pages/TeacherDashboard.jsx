import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/AuthProvider';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function TeacherDashboard() {
  const { token, user, logout } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [editing, setEditing] = useState(null);
  const [showSubsModal, setShowSubsModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [filter, page]);

  const fetchAssignments = async () => {
    const q = `?status=${filter}&page=${page}&limit=8`;
    const res = await API.get('/api/assignments' + (filter ? q : `?page=${page}&limit=8`));
    setAssignments(res.data.items || []);
    setTotal(res.data.total || 0);
  };

  const createOrUpdate = async (e) => {
    e.preventDefault();
    if (editing) {
      // update (only Draft allowed on server)
      await API.put(`/api/assignments/${editing._id}`, form);
      setEditing(null);
    } else {
      await API.post('/api/assignments', form);
    }
    setForm({ title: '', description: '', dueDate: '' });
    fetchAssignments();
  };

  const edit = (a) => {
    setEditing(a);
    setForm({ title: a.title, description: a.description || '', dueDate: a.dueDate ? a.dueDate.split('T')[0] : '' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ title: '', description: '', dueDate: '' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete Draft?')) return;
    await API.delete(`/api/assignments/${id}`);
    fetchAssignments();
  };

  const changeStatus = async (id, status) => {
    await API.put(`/api/assignments/${id}/status`, { status });
    fetchAssignments();
  };

  const openSubmissions = async (id) => {
    const res = await API.get(`/api/assignments/${id}/submissions`);
    setSubmissions(res.data || []);
    setShowSubsModal(true);
  };

  const markReviewed = async (submissionId) => {
    await API.put(`/api/submissions/${submissionId}/review`);
    // update local list
    setSubmissions(s => s.map(x => x._id === submissionId ? { ...x, reviewed: true } : x));
  };

  const loadAnalytics = async (id) => {
    const res = await API.get(`/api/assignments/${id}/analytics`);
    setAnalytics(res.data);
    // auto-hide after 8 seconds
    setTimeout(() => setAnalytics(null), 8000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Teacher Dashboard">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700">{user?.name}</div>
          <button onClick={logout} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Logout</button>
        </div>
      </Navbar>

      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold text-lg mb-3">{editing ? 'Edit Assignment' : 'Create Assignment'}</h3>

            <form onSubmit={createOrUpdate} className="space-y-3">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Title" className="w-full border rounded p-2" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full border rounded p-2" />
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full border rounded p-2" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded">{editing ? 'Save' : 'Create Draft'}</button>
                {editing && <button type="button" onClick={cancelEdit} className="px-3 py-2 border rounded">Cancel</button>}
              </div>
            </form>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Filter</label>
              <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="w-full border rounded p-2">
                <option value="">All</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="col-span-2 bg-white p-6 rounded shadow">
            <h3 className="font-semibold text-lg mb-3">Assignments</h3>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Due</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a._id} className="border-t hover:bg-gray-50">
                      <td className="py-3">
                        <div className="font-medium">{a.title}</div>
                        <div className="text-xs text-gray-500">{a.description}</div>
                      </td>
                      <td className="py-3"><Badge status={a.status} /></td>
                      <td className="py-3">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-'}</td>
                      <td className="py-3 space-x-2">
                        {a.status === 'Draft' && <button className="px-2 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => changeStatus(a._id, 'Published')}>Publish</button>}
                        {a.status === 'Draft' && <button className="px-2 py-1 border rounded text-sm" onClick={() => { edit(a) }}>Edit</button>}
                        {a.status === 'Draft' && <button className="px-2 py-1 border rounded text-sm" onClick={() => remove(a._id)}>Delete</button>}
                        {a.status === 'Published' && <button className="px-2 py-1 bg-yellow-600 text-white rounded text-sm" onClick={() => changeStatus(a._id, 'Completed')}>Mark Completed</button>}
                        <button className="px-2 py-1 border rounded text-sm" onClick={() => openSubmissions(a._id)}>Submissions</button>
                        <button className="px-2 py-1 border rounded text-sm" onClick={() => loadAnalytics(a._id)}>Analytics</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm">Showing {assignments.length} of {total}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded" disabled={page === 1}>Prev</button>
                <div>Page {page}</div>
                <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Next</button>
              </div>
            </div>

            {analytics && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded text-center">
                  <div className="text-2xl font-bold">{analytics.totalSubs}</div>
                  <div className="text-sm text-gray-700">Total Submissions</div>
                </div>
                <div className="bg-green-50 p-4 rounded text-center">
                  <div className="text-2xl font-bold">{analytics.reviewed}</div>
                  <div className="text-sm text-gray-700">Reviewed</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSubsModal && (
        <Modal title="Submissions" onClose={() => setShowSubsModal(false)}>
          <div className="space-y-3">
            {submissions.length === 0 && <div className="text-sm text-gray-600">No submissions yet</div>}
            {submissions.map(s => (
              <div key={s._id} className="border p-3 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{s.studentId?.name}</div>
                    <div className="text-xs text-gray-500">{new Date(s.submittedAt).toLocaleString()}</div>
                  </div>
                  <div>
                    {!s.reviewed && <button className="px-2 py-1 bg-indigo-600 text-white rounded text-sm" onClick={() => markReviewed(s._id)}>Mark Reviewed</button>}
                    {s.reviewed && <div className="text-xs text-green-600">Reviewed</div>}
                  </div>
                </div>
                <div className="mt-2">{s.answer}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
