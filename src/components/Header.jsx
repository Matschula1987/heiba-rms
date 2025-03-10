import React from 'react';
import Link from 'next/link';

export default function Header({ user, onLogout }) {
  return (
    <header className="bg-[#002451] text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">HeiBa Recruitment System</Link>
        <div className="flex items-center space-x-4">
          <span>{user?.name || 'Benutzer'}</span>
          <button 
            onClick={onLogout}
            className="px-3 py-1 bg-[#D4AF37] rounded hover:bg-opacity-90 text-white"
          >
            Abmelden
          </button>
        </div>
      </div>
    </header>
  );
}
