'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, role, loading } = useAuth();

  // Nama dan email dari user auth
  const name = user?.user_metadata?.nama_lengkap || user?.email?.split('@')[0] || 'Pengguna';
  const email = user?.email || '';

  // Format role agar lebih rapi (capitalize pertama)
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Anggota';

  // Tutup popup jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-300 animate-pulse"></div>
    );
  }

  return (
    <div className="relative" ref={popupRef}>
      {/* Avatar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform"
      >
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Popup menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="font-bold text-gray-800">{name}</p>
            <p className="text-xs text-gray-500 break-words">{email}</p>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="material-symbols-outlined text-base">badge</span>
              <span>{displayRole}</span>
            </div>
            <hr className="my-2" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 w-full p-2 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
