'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup'; 

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // State untuk data dari database
  const [stats, setStats] = useState([
    { label: 'Total Anggota', value: '0', change: '...', icon: 'group' },
    { label: 'Anggota Aktif', value: '0', change: '...', icon: 'how_to_reg' },
    { label: 'Anggota Istirahat', value: '0', change: '...', icon: 'bedtime' },
    { label: 'Anggota Keluar', value: '0', change: '...', icon: 'person_remove' },
  ]);

  const [rantingData, setRantingData] = useState<any[]>([]);
  const [suratStats, setSuratStats] = useState({ total: 0, masuk: 0, keluar: 0 });

  // Data Log sementara tetap statis atau bisa dikoneksikan nanti
  const logs = [
    { activity: 'Budi Santoso updated member data', time: '10 Menit yang lalu', icon: 'person_add', color: 'primary-container' },
    { activity: 'New letter uploaded: SK-042/III/2024', time: '2 Jam yang lalu', icon: 'upload_file', color: 'tertiary' },
    { activity: 'Ahmad Susilo changed status to Istirahat', time: 'Kemarin, 14:20', icon: 'edit_note', color: 'on-surface-variant' },
    { activity: 'Ranting Pejagoan added 5 new members', time: '2 Hari yang lalu', icon: 'domain', color: 'secondary' },
  ];

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch Data Anggota & Ranting
        const { data: anggota, error: errAnggota } = await supabase
          .from('anggota')
          .select('status_anggota, ranting');

        if (errAnggota) throw errAnggota;

        if (anggota) {
          const total = anggota.length;
          const aktif = anggota.filter(a => a.status_anggota === 'Aktif').length;
          const istirahat = anggota.filter(a => a.status_anggota === 'Istirahat').length;
          const keluar = anggota.filter(a => a.status_anggota === 'Keluar').length;

          setStats([
            { label: 'Total Anggota', value: total.toLocaleString(), change: 'Total', icon: 'group' },
            { label: 'Anggota Aktif', value: aktif.toLocaleString(), change: 'Aktif', icon: 'how_to_reg' },
            { label: 'Anggota Istirahat', value: istirahat.toLocaleString(), change: 'Rehat', icon: 'bedtime' },
            { label: 'Anggota Keluar', value: keluar.toLocaleString(), change: 'Keluar', icon: 'person_remove' },
          ]);

          // Hitung Distribusi Ranting
          const counts = anggota.reduce((acc: any, curr) => {
            const r = curr.ranting || 'Umum';
            acc[r] = (acc[r] || 0) + 1;
            return acc;
          }, {});

          const formattedRanting = Object.keys(counts).map(name => ({
            name,
            anggota: counts[name],
            persen: total > 0 ? Math.round((counts[name] / total) * 100) : 0
          })).sort((a, b) => b.anggota - a.anggota);

          setRantingData(formattedRanting);
        }

        // 2. Fetch Data Surat
        const { data: surat, error: errSurat } = await supabase
          .from('surat')
          .select('jenis_surat');

        if (errSurat) throw errSurat;

        if (surat) {
          // Asumsi jenis_surat di DB adalah 'Masuk' dan 'Keluar'
          const masuk = surat.filter(s => s.jenis_surat === 'Masuk').length;
          const keluar = surat.filter(s => s.jenis_surat === 'Keluar').length;
          setSuratStats({ total: surat.length, masuk, keluar });
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary font-bold">Memuat Data Organisasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-surface pb-24">
        
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-blue-900">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl font-extrabold text-blue-900 tracking-tighter">Cabang Kebumen</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-slate-400">
              <span className="material-symbols-outlined cursor-pointer hover:text-blue-800">help_outline</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-blue-800">info</span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">Budi Santoso</p>
                <p className="text-[10px] text-slate-500 font-medium">Admin Cabang</p>
              </div>
              <ProfilePopup />
            </div>
          </div>
        </header>

        <div className="pt-24 px-4 md:px-8 pb-12 flex-1">
          <div className="mb-10">
            <p className="text-tertiary font-medium mb-1">Selamat datang kembali,</p>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">Dashboard Overview</h1>
          </div>

          {/* Stat Cards Dinamis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-4 border-l-4 border-primary hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-3xl text-primary">{stat.icon}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-primary uppercase">{stat.change}</span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-extrabold text-slate-800">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Distribusi & Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* Distribusi Ranting */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">lan</span> Distribusi Per Ranting
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rantingData.length > 0 ? rantingData.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-transparent hover:border-primary/20 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.anggota} Anggota</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-white shadow-sm bg-primary text-white flex items-center justify-center text-xs font-bold">
                        {item.persen}%
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-400 italic text-sm">Belum ada data ranting.</p>
                  )}
                </div>
              </section>

              {/* Manajemen Surat Dinamis */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">mail</span> Manajemen Surat
                </h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total</p>
                    <p className="text-2xl font-black text-slate-800">{suratStats.total}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Masuk</p>
                    <p className="text-2xl font-black text-green-700">{suratStats.masuk}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Keluar</p>
                    <p className="text-2xl font-black text-blue-700">{suratStats.keluar}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Log Aktivitas */}
            <div className="lg:col-span-1">
              <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined">history</span> Log Aktivitas
                </h2>
                <div className="space-y-6">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      {idx !== logs.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-[-24px] w-[2px] bg-slate-100"></div>
                      )}
                      <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-sm text-primary">{log.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{log.activity}</p>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-3 bg-slate-50 hover:bg-primary hover:text-white transition-all rounded-xl text-xs font-bold text-primary tracking-widest">
                  LIHAT SEMUA LOG
                </button>
              </section>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
