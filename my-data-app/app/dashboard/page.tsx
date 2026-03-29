'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data statis (sama seperti sebelumnya)
  const stats = [
    { label: 'Total Anggota', value: '1,248', change: '+12%', color: 'primary', icon: 'group' },
    { label: 'Anggota Aktif', value: '1,012', change: 'Stabil', color: 'green', icon: 'how_to_reg' },
    { label: 'Anggota Istirahat', value: '184', change: '-2%', color: 'amber', icon: 'bedtime' },
    { label: 'Anggota Keluar', value: '52', change: '+1%', color: 'error', icon: 'person_remove' },
  ];

  const rantingData = [
    { name: 'Kebumen Kota', anggota: 450, persen: 36 },
    { name: 'Pejagoan', anggota: 312, persen: 25 },
    { name: 'Sruweng', anggota: 286, persen: 23 },
    { name: 'Kutowinangun', anggota: 200, persen: 16 },
  ];

  const logs = [
    { activity: 'Budi Santoso updated member data', time: '10 Menit yang lalu', icon: 'person_add', color: 'primary-container' },
    { activity: 'New letter uploaded: SK-042/III/2024', time: '2 Jam yang lalu', icon: 'upload_file', color: 'tertiary' },
    { activity: 'Ahmad Susilo changed status to Istirahat', time: 'Kemarin, 14:20', icon: 'edit_note', color: 'on-surface-variant' },
    { activity: 'Ranting Pejagoan added 5 new members', time: '2 Hari yang lalu', icon: 'domain', color: 'secondary' },
  ];

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-surface">
        {/* TopAppBar dengan hamburger menu */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-blue-900">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl font-extrabold text-blue-900 tracking-tighter">Cabang Kebumen</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <span className="material-symbols-outlined cursor-pointer hover:text-blue-800">help_outline</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-blue-800">info</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-white text-xs">BS</div>
          </div>
        </header>

        <div className="pt-24 px-4 md:px-8 pb-12 flex-1">
          <div className="mb-10">
            <p className="text-tertiary font-medium mb-1">Selamat datang kembali,</p>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">Dashboard Overview</h1>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow flex flex-col gap-4 border-l-4 border-primary">
                <div className="flex justify-between items-start">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-3xl text-primary">{stat.icon}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-green-50 text-green-600">{stat.change}</span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-extrabold text-gray-800">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Distribusi & Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-primary mb-4">Distribusi Per Ranting</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rantingData.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.anggota} Anggota</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">{item.persen}%</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold text-primary mb-4">Manajemen Surat</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-gray-500">Total Surat</p><p className="text-2xl font-bold">342</p></div>
                  <div><p className="text-gray-500">Surat Masuk</p><p className="text-2xl font-bold text-green-600">128</p></div>
                  <div><p className="text-gray-500">Surat Keluar</p><p className="text-2xl font-bold text-blue-400">214</p></div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <section className="bg-gray-50 p-6 rounded-xl h-full">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2"><span className="material-symbols-outlined">history</span> Log Aktivitas</h2>
                <div className="space-y-4">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><span className="material-symbols-outlined text-sm text-blue-600">{log.icon}</span></div>
                      <div><p className="text-sm font-semibold">{log.activity}</p><p className="text-xs text-gray-400">{log.time}</p></div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 bg-white border rounded-lg text-sm font-bold text-primary">LIHAT SEMUA LOG</button>
              </section>
            </div>
          </div>
        </div>

        <footer className="w-full py-4 bg-gray-50 text-center text-xs text-gray-500">© 2024 ISBDS Cipta Sejati Cabang Kebumen</footer>
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center"><span className="material-symbols-outlined text-3xl">add</span></button>
      </main>
    </div>
  );
}
