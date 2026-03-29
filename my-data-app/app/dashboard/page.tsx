'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Anggota', value: '0', change: '...', icon: 'group' },
    { label: 'Anggota Aktif', value: '0', change: '...', icon: 'how_to_reg' },
    { label: 'Anggota Istirahat', value: '0', change: '...', icon: 'bedtime' },
    { label: 'Anggota Keluar', value: '0', change: '...', icon: 'person_remove' },
  ]);
  const [rantingData, setRantingData] = useState<any[]>([]);

  useEffect(() => {
    async function getDashboardData() {
      try {
        // 1. Ambil Data Anggota
        const { data: anggota, error } = await supabase
          .from('anggota')
          .select('status_anggota, ranting');

        if (error) throw error;

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

          // 2. Hitung Distribusi Ranting secara dinamis
          const counts = anggota.reduce((acc: any, curr) => {
            const r = curr.ranting || 'Umum';
            acc[r] = (acc[r] || 0) + 1;
            return acc;
          }, {});

          const formattedRanting = Object.keys(counts).map(name => ({
            name,
            anggota: counts[name],
            persen: Math.round((counts[name] / total) * 100)
          })).sort((a, b) => b.anggota - a.anggota); // Urutkan dari terbanyak

          setRantingData(formattedRanting);
        }
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    }

    getDashboardData();
  }, []);

  // Tampilan loading sederhana
  if (loading) return <div className="p-10 text-center font-bold">Menghubungkan ke Supabase...</div>;

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-surface pb-24">
        {/* Header tetap sama */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-blue-900">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-xl font-extrabold text-blue-900 tracking-tighter">Cabang Kebumen</h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-xs font-bold">Admin Cabang</p>
             </div>
             <ProfilePopup />
          </div>
        </header>

        <div className="pt-24 px-4 md:px-8 pb-12 flex-1">
          <h1 className="text-3xl font-extrabold text-primary mb-10">Dashboard Overview</h1>

          {/* Stat Cards Dinamis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow border-l-4 border-primary">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-3xl text-primary">{stat.icon}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-primary">{stat.change}</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-extrabold text-gray-800">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-primary mb-4">Distribusi Ranting Real-time</h2>
              <div className="grid grid-cols-1 gap-4">
                {rantingData.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.anggota} Anggota</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {item.persen}%
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
