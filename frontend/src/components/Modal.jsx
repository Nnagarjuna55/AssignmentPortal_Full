import React from 'react';

export default function Modal({ title, onClose, children, width = 'w-2/3' }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className={`bg-white rounded-lg shadow p-6 max-h-[80vh] overflow-y-auto ${width}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-sm text-gray-600" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
