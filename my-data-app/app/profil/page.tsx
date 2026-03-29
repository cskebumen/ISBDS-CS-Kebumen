'use client';

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
// Menambahkan Hash dan Menu ke dalam import
import { 
  Printer, Search, ShieldCheck, Edit3, 
  History, User, MapPin, Phone, Calendar,
  Hash, Menu, X 
} from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import { CetakProfil } from '@/components/CetakProfil';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilAnggotaPage() {
  const componentRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNia, setSearchNia] = useState('');
  
  // State untuk Hamburger Menu Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Profil_${data?.nama_lengkap || 'Anggota'}`,
  });

  const fetchProfilData = async (targetNia: string) => {
    if (!targetNia) return;
    setLoading(true);
    try {
      const { data: anggota, error } = await supabase
        .from('anggota')
        .select('*')
        .eq('nia', targetNia)
        .single();

      if (error) throw error;
      const { data: sabuk } = await supabase
        .from('riwayat_sabuk')
        .select('*')
        .eq('anggota_id', anggota.id)
        .order('tahun', { ascending: true });

      setData(anggota);
      setRiwayat(sabuk || []);
    } catch (err) {
      alert("NIA tidak ditemukan.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* TOPBAR */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 screen-only">
          <div className="flex items-center gap-4">
            {/* Tombol Hamburger - Hanya muncul di Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 lg:hidden hover:bg-slate-100 rounded-xl transition-all"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <User size={18} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Profil Anggota</h2>
            </div>
          </div>
          <ProfilePopup />
        </header>

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex-1 screen-only">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter">Detail Data</h1>
              <p className="text-slate-400 font-bold flex items-center gap-2 text-sm uppercase">
                <ShieldCheck size={16} className="text-blue-500" /> Database ISBDS Cipta Sejati
              </p>
            </div>
            
            {data && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePrint()} 
                  className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95 text-sm"
                >
                  <Printer size={18} /> CETAK
                </button>
                <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-blue-600 shadow-sm">
                  <Edit3 size={18} />
                </button>
              </div>
            )}
          </div>

          {/* SEARCH BAR */}
          <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex items-center mb-10 group focus-within:border-blue-200 transition-all">
            <div className="flex-1 flex items-center px-6">
              <Search className="text-slate-300 mr-4" size={22} />
              <input 
                type="text" 
                value={searchNia}
                onChange={(e) => setSearchNia(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProfilData(searchNia)}
                placeholder="Cari NIA (Contoh: 03.06.02.000042)" 
                className="w-full py-4 bg-transparent border-none focus:ring-0 font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>
            <button 
              onClick={() => fetchProfilData(searchNia)}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-700 transition-all text-sm"
            >
              {loading ? '...' : 'CARI'}
            </button>
          </div>

          {/* CONTENT CARD */}
          {data ? (
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-56 shrink-0">
                  <div className="aspect-[3/4] rounded-3xl bg-slate-50 overflow-hidden border-4 border-white shadow-xl">
                    <img src={data.foto_url || '/placeholder.png'} className="w-full h-full object-cover" alt="Profile" />
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Status Anggota</p>
                    <p className="text-xs font-black text-blue-900 uppercase mt-1">{data.status_anggota || 'AKTIF'}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase leading-tight tracking-tight">{data.nama_lengkap}</h2>
                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg font-mono font-bold text-sm uppercase">
                      <Hash size={14} className="text-blue-500" /> {data.nia}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                    <div>
                      <label className="text-[10px] font-black text-slate-300 uppercase block mb-1">Tempat, Tgl Lahir</label>
                      <p className="text-sm font-bold text-slate-700">{data.tempat_lahir}, {data.tanggal_lahir}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-300 uppercase block mb-1">Ranting</label>
                      <p className="text-sm font-bold text-slate-700">{data.ranting}</p>
                    </div>
                    <div className="col-span-full">
                      <label className="text-[10px] font-black text-slate-300 uppercase block mb-1">Alamat Lengkap</label>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">{data.alamat_lengkap}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIWAYAT SABUK SIDEBAR */}
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
                  <h3 className="font-black uppercase text-xs mb-6 text-blue-400 flex justify-between items-center tracking-widest">
                    Riwayat Sabuk <History size={16} />
                  </h3>
                  <div className="space-y-3">
                    {riwayat.map((s, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black truncate">{s.tingkat}</p>
                          <p className="text-[9px] font-medium text-white/40 italic truncate">{s.no_sertifikat}</p>
                        </div>
                        <span className="text-[10px] font-black text-blue-400">{s.tahun}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <ShieldCheck size={64} className="mx-auto text-slate-100 mb-4" />
              <p className="font-black text-slate-300 uppercase tracking-widest">Data belum dimuat</p>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* RENDER CETAK */}
      <div className="hidden-print">
        <div ref={componentRef}>
          {data && <CetakProfil data={data} riwayat={riwayat} />}
        </div>
      </div>

      <style jsx global>{`
        .hidden-print { position: fixed; left: -9999px; }
        @media print {
          .screen-only { display: none !important; }
          .hidden-print { position: static; left: 0; display: block; }
        }
      `}</style>
    </div>
  );
}
