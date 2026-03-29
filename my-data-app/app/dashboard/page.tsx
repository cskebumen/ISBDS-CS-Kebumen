'use client';

import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  // Data statis untuk demo (nanti diganti dengan fetch dari Supabase)
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
      <Sidebar activeMenu="dashboard" />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-surface">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <span className="md:hidden material-symbols-outlined cursor-pointer">menu</span>
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

        {/* Content Body */}
        <div className="pt-24 px-4 md:px-8 pb-12 flex-1">
          {/* Hero Heading */}
          <div className="mb-10">
            <p className="text-tertiary font-medium mb-1">Selamat datang kembali,</p>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">Dashboard Overview</h1>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className={`bg-surface-container-lowest p-6 rounded-xl shadow-2xl flex flex-col gap-4 border-l-4 border-${stat.color === 'primary' ? 'primary' : stat.color === 'green' ? 'green-500' : stat.color === 'amber' ? 'amber-400' : 'error'}`}>
                <div className="flex justify-between items-start">
                  <div className={`bg-${stat.color === 'primary' ? 'primary/10' : stat.color === 'green' ? 'green-100' : stat.color === 'amber' ? 'amber-100' : 'error-container/20'} p-3 rounded-lg text-${stat.color === 'primary' ? 'primary' : stat.color === 'green' ? 'green-700' : stat.color === 'amber' ? 'amber-700' : 'error'}`}>
                    <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${stat.change.includes('+') ? 'bg-green-50 text-green-600' : stat.change.includes('-') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{stat.change}</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-extrabold text-on-surface">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Main Layout: 2 Column Asymmetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Branch Distribution & Correspondence */}
            <div className="lg:col-span-2 space-y-8">
              {/* Branch Distribution */}
              <section className="bg-surface-container-low p-6 md:p-8 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-primary">Distribusi Per Ranting</h2>
                  <button className="text-sm font-semibold text-tertiary flex items-center gap-1 hover:underline">
                    Lihat Detail <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rantingData.map((item, idx) => (
                    <div key={idx} className="bg-surface-container-lowest p-5 rounded-lg flex items-center justify-between group hover:bg-primary transition-all duration-300 cursor-pointer">
                      <div>
                        <p className="text-sm font-bold group-hover:text-white">{item.name}</p>
                        <p className="text-xs text-on-surface-variant group-hover:text-blue-100">{item.anggota} Anggota</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary group-hover:bg-white group-hover:border-white">
                        {item.persen}%
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Correspondence Stats */}
              <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/20">
                <h2 className="text-xl font-bold text-primary mb-6">Manajemen Surat</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-semibold text-on-surface-variant">Total Surat</span>
                      <span className="text-lg font-bold text-primary">342</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-full"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-semibold text-on-surface-variant">Surat Masuk</span>
                      <span className="text-lg font-bold text-green-600">128</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: '37%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-semibold text-on-surface-variant">Surat Keluar</span>
                      <span className="text-lg font-bold text-blue-400">214</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full" style={{ width: '63%' }}></div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Activity Log */}
            <div className="lg:col-span-1">
              <section className="bg-surface-container-highest/50 backdrop-blur-sm p-6 md:p-8 rounded-xl h-full border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-8">
                  <span className="material-symbols-outlined text-primary">history</span>
                  <h2 className="text-xl font-bold text-primary">Log Aktivitas</h2>
                </div>
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/30">
                  {logs.map((log, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-${log.color} flex items-center justify-center text-white ring-4 ring-surface`}>
                        <span className="material-symbols-outlined text-[12px]">{log.icon}</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface leading-snug">{log.activity}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{log.time}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-3 bg-surface-container-highest rounded-xl text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all duration-300">
                  LIHAT SEMUA LOG
                </button>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-4 border-t-0 bg-slate-50 flex flex-col md:flex-row justify-between items-center px-4 md:px-12 mt-auto">
          <div className="text-blue-800 font-inter text-xs tracking-wide">© 2024 ISBDS Cipta Sejati Cabang Kebumen. All rights reserved.</div>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="text-slate-500 font-inter text-xs tracking-wide hover:text-blue-600">Bantuan</a>
            <a href="#" className="text-slate-500 font-inter text-xs tracking-wide hover:text-blue-600">Kebijakan Privasi</a>
            <a href="#" className="text-slate-500 font-inter text-xs tracking-wide hover:text-blue-600">Kontak Support</a>
          </div>
        </footer>

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </main>
    </div>
  );
}
