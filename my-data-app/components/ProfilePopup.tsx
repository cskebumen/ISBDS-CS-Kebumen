'use client';

import { useState, useEffect, useRef } from 'react';

type ProfileData = {
  name: string;
  email: string;
  role: string;
};

export default function ProfilePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Budi Santoso',
    email: 'budi@isbds.com',
    role: 'Administrator Cabang'
  });

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

  return (
    <div className="relative" ref={popupRef}>
      {/* Avatar yang bisa diklik */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform"
      >
        {profile.name.charAt(0)}
      </div>

      {/* Popup menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="font-bold text-gray-800">{profile.name}</p>
            <p className="text-xs text-gray-500">{profile.email}</p>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="material-symbols-outlined text-base">badge</span>
              <span>{profile.role}</span>
            </div>
            <hr className="my-2" />
            <button
              onClick={() => {
                // Logika logout nanti
                window.location.href = '/login';
              }}
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
