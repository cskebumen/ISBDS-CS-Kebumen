'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ProfilPage() {
  const router = useRouter();
  const [nia, setNia] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (nia.trim()) {
      router.push(`/profil/${nia}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeMenu="profil" />
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Profil Anggota</h1>
            <p className="text-on-surface-variant">Manajemen data personal dan riwayat sertifikasi anggota ISBDS Cipta Sejati.</p>
          </div>

          <div className="bg-surface-container-low p-8 rounded-[2rem] mb-12">
            <div className="max-w-3xl">
              <label className="block text-sm font-bold text-on-surface-variant mb-3 px-1">Cari NIA Anggota</label>
              <form onSubmit={handleSearch} className="relative flex items-center">
                <span className="absolute left-5 text-slate-400 material-symbols-outlined">search</span>
                <input
                  type="text"
                  value={nia}
                  onChange={(e) => setNia(e.target.value)}
                  className="w-full pl-14 pr-32 py-4 bg-surface-container-lowest border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-surface-tint/40 text-lg placeholder:text-slate-300 transition-all"
                  placeholder="Masukkan 12 digit Nomor Induk Anggota..."
                />
                <button type="submit" className="absolute right-2 px-8 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold transition-all hover:opacity-90 active:scale-95">
                  Cari
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
