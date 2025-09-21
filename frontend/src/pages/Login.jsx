import React, { useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await API.post('/api/auth/login', { email, password });
      login({ token: res.data.token, role: res.data.role, name: res.data.name });
      if (res.data.role === 'teacher') nav('/teacher'); else nav('/student');
    } catch (error) {
      setErr(error.response?.data?.msg || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-lg shadow w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome</h2>
        <p className="text-sm text-gray-600 mb-4">Login as Teacher or Student</p>

        <form onSubmit={submit} className="space-y-3">
          <input value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email" className="w-full border rounded p-2" />
          <input value={password} type="password" onChange={e=>setPassword(e.target.value)} required placeholder="Password" className="w-full border rounded p-2" />
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">Login</button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          Seeded users: <br/>
          <strong>Teacher:</strong> teacher@example.com / teacher123 <br/>
          <strong>Student:</strong> student@example.com / student123
        </div>
      </div>
    </div>
  );
}
