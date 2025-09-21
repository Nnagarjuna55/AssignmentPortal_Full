import React from 'react';

export default function Badge({ status }) {
  const map = {
    Draft: 'bg-gray-200 text-gray-800',
    Published: 'bg-green-100 text-green-800',
    Completed: 'bg-blue-100 text-blue-800'
  };
  return (
    <span className={`px-2 py-1 text-xs rounded ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
