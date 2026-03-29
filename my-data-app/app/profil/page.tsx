'use client';

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  Printer, Search, ShieldCheck, Edit3, 
  History, User, MapPin, Phone, Calendar 
} from 'lucide-react';

// Import Komponen Tambahan
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import { CetakProfil } from '@/components/CetakProfil';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilAnggota() {
  const componentRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNia, setSearchNia] = useState('');

  // Logika Print (Sudah Fix)
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
      alert("Data tidak ditemukan.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans overflow-x-hidden">
      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* TOPBAR / HEADER */}
        <header className="flex items-center justify-between px-8 py-6 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 screen-only">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <User size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Profil Personal</h2>
          </div>
          <ProfilePopup />
        </header>

        <main className="p-8 lg:p-12 max-w-7xl mx-auto w-full flex-1 screen-only">
          {/* JUDUL HALAMAN */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-black text-slate-900 leading-none uppercase italic tracking-tighter">
                Detail Anggota
              </h1>
              <p className="text-slate-400 font-medium mt-2 flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-500" />
                Manajemen Basis Data ISBDS Cipta Sejati
              </p>
            </div>
            
            {data && (
              <div className="flex gap-3">
                <button 
                  onClick={() => handlePrint()} 
                  className="flex items-center gap-2 px-8 py-3.5 bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95"
                >
                  <Printer size={18} /> CETAK PROFIL
                </button>
                <button className="p-3.5 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-blue-600 transition-all shadow-sm">
                  <Edit3 size={20} />
                </button>
              </div>
            )}
          </div>

          {/* SEARCH BAR (Desain Modern) */}
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 flex items-center mb-12 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <div className="flex-1 flex items-center px-6">
              <Search className="text-slate-300 mr-4" size={24} />
              <input 
                type="text" 
                value={searchNia}
                onChange={(e) => setSearchNia(e.target.value)}
                placeholder="Masukkan Nomor Induk Anggota (NIA)..." 
                className="w-full py-5 bg-transparent border-none focus:ring-0 font-bold text-lg text-slate-700 placeholder:text-slate-300"
              />
            </div>
            <button 
              onClick={() => fetchProfilData(searchNia)}
              disabled={loading}
              className="px-10 py-5 bg-slate-900 text-white rounded-[1.25rem] font-black hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'MEMUAT...' : 'CARI DATA'}
            </button>
          </div>

          {/* KONTEN PROFIL */}
          {data ? (
            <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* KARTU IDENTITAS */}
              <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-110"></div>
                
                <div className="flex flex-col md:flex-row gap-12 relative z-10">
                  <div className="w-full md:w-64 shrink-0">
                    <div className="aspect-[3/4] rounded-[2.5rem] bg-slate-50 overflow-hidden border-8 border-white shadow-2xl relative">
                      <img 
                        src={data.foto_url || 'https://via.placeholder.com/300x400'} 
                        className="w-full h-full object-cover" 
                        alt="Foto Anggota" 
                      />
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-center shadow-sm">
                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest leading-none">Status</p>
                        <p className="text-xs font-bold text-slate-800 uppercase mt-1">{data.status_anggota || 'Aktif'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-10">
                      <h2 className="text-4xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                        {data.nama_lengkap}
                      </h2>
                      <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-full font-mono font-bold text-sm tracking-widest">
                        <Hash size={14} className="text-blue-400" /> {data.nia}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 py-8 border-y border-slate-50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-2">
                          <Calendar size={12} /> Tempat, Tanggal Lahir
                        </p>
                        <p className="font-bold text-slate-700">{data.tempat_lahir}, {data.tanggal_lahir}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-2">
                          <MapPin size={12} /> Ranting / Unit
                        </p>
                        <p className="font-bold text-slate-700">{data.ranting}</p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-2">
                          <MapPin size={12} /> Alamat Lengkap
                        </p>
                        <p className="font-bold text-slate-700 leading-relaxed text-sm">{data.alamat_lengkap}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-2">
                          <Phone size={12} /> No. WhatsApp
                        </p>
                        <p className="font-bold text-slate-700 underline decoration-blue-200 decoration-2 underline-offset-4">{data.no_hp || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIWAYAT SABUK (Sesuai profil.html) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex-1 shadow-2xl shadow-slate-200">
                  <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                    <h3 className="font-black uppercase italic tracking-widest text-sm text-blue-400">Riwayat Sabuk</h3>
                    <History size={20} className="opacity-40" />
                  </div>
                  <div className="space-y-4">
                    {riwayat.length > 0 ? riwayat.map((s, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                        <div className={`w-1.5 h-10 rounded-full ${
                          s.tingkat?.toLowerCase().includes('kuning') ? 'bg-yellow-400' :
                          s.tingkat?.toLowerCase().includes('hijau') ? 'bg-green-500' :
                          s.tingkat?.toLowerCase().includes('biru') ? 'bg-blue-600' : 'bg-slate-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-white/40 uppercase mb-1">Sabuk {s.tingkat}</p>
                          <p className="text-xs font-bold leading-none tracking-tight italic">SK: {s.no_sertifikat}</p>
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 bg-white/10 rounded-lg">{s.tahun}</span>
                      </div>
                    )) : (
                      <p className="text-center py-10 text-white/20 font-bold uppercase text-xs border-2 border-dashed border-white/10 rounded-3xl tracking-widest">Belum ada riwayat</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={48} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-300 uppercase italic tracking-widest">Silakan Cari Data NIA</h3>
              <p className="text-slate-200 text-sm font-bold mt-2 italic">Pastikan NIA yang dimasukkan sudah benar</p>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* --- RENDER CETAK (MURNI TANPA INTERVENSI UI) --- */}
      <div className="hidden-print-portal">
        <div ref={componentRef}>
          {data && <CetakProfil data={data} riwayat={riwayat} />}
        </div>
      </div>

      {/* CSS KHUSUS DASHBOARD & PRINT PORTAL */}
      <style jsx global>{`
        .hidden-print-portal {
          position: fixed;
          left: -9999px;
          top: 0;
        }

        @media print {
          .screen-only { display: none !important; }
          .hidden-print-portal {
            position: relative !important;
            left: 0 !important;
            display: block !important;
          }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
