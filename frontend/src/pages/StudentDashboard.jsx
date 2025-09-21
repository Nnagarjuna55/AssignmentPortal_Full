import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/AuthProvider';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

export default function StudentDashboard() {
  const { token, user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mySubmission, setMySubmission] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const res = await API.get('/api/assignments?status=Published&page=1&limit=50');
    setAssignments(res.data.items || []);
  };

  const submit = async (assignmentId) => {
    // custom small form instead of prompt
    const answer = window.prompt('Enter your answer (text)');
    if (!answer) return;
    try {
      await API.post('/api/submissions', { assignmentId, answer });
      alert('Submitted successfully');
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error submitting');
    }
  };

  const viewMine = async (assignmentId) => {
    try {
      const res = await API.get(`/api/submissions/mine/${assignmentId}`);
      if (res.data) {
        setMySubmission(res.data);
        setShowModal(true);
      } else {
        alert('No submission yet');
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Error fetching submission');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar title="Student Dashboard">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700">{user?.name}</div>
          <button onClick={logout} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Logout</button>
        </div>
      </Navbar>

      <div className="container mx-auto py-6 px-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Published Assignments</h3>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Due</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a._id} className="border-t hover:bg-gray-50">
                    <td className="py-3">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-gray-500">{a.description}</div>
                    </td>
                    <td className="py-3">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3"><Badge status={a.status} /></td>
                    <td className="py-3 space-x-2">
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={() => submit(a._id)} disabled={a.dueDate && new Date() > new Date(a.dueDate)}>
                        Submit
                      </button>
                      <button className="px-3 py-1 border rounded text-sm" onClick={() => viewMine(a._id)}>View Mine</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {showModal && mySubmission && (
        <Modal title="Your Submission" onClose={() => setShowModal(false)}>
          <div>
            <div className="font-medium mb-2">{mySubmission.answer}</div>
            <div className="text-sm text-gray-600">Submitted at: {new Date(mySubmission.submittedAt).toLocaleString()}</div>
          </div>
        </Modal>
      )}
    </div>
  );
}
