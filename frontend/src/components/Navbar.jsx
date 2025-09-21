import React from 'react';
import { useAuth } from '../auth/AuthProvider';

export default function Navbar({ title, children }) {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow sticky top-0 z-30">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="text-indigo-600 font-bold text-lg">Assignment Portal</div>
          {title && <div className="text-slate-700 font-medium">{title}</div>}
        </div>

        <div className="flex items-center gap-4">
          {children}
          {user ? <div className="text-sm text-gray-600 hidden sm:block">Signed in as <span className="font-medium ml-1">{user.name}</span></div> : null}
        </div>
      </div>
    </nav>
  );
}
