'use client';

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Search, ShieldCheck, Edit3, User, History } from 'lucide-react';
import { CetakProfil } from '@/components/CetakProfil';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilAnggota() {
  const [data, setData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNia, setSearchNia] = useState('');
  
  // Ref ini HARUS menempel pada pembungkus CetakProfil saja
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Profil_${data?.nama_lengkap || 'Anggota'}`,
    // Menghapus margin default browser agar layout A4 pas
    pageStyle: `
      @page { size: A4 portrait; margin: 0; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    `
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
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-20">
      {/* TAMPILAN DASHBOARD (Sesuai profil.html) */}
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Profil Anggota</h1>
            <p className="text-slate-400 font-medium italic">Sistem Informasi ISBDS Cipta Sejati</p>
          </div>
          <div className="flex gap-3">
            {data && (
              <button 
                onClick={() => handlePrint()} 
                className="flex items-center gap-2 px-8 py-3 bg-blue-700 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-lg"
              >
                <Printer size={18} /> CETAK PROFIL
              </button>
            )}
            <button className="px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl font-bold text-sm">EDIT</button>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-10 border border-slate-100 flex gap-4">
          <input 
            type="text" 
            value={searchNia}
            onChange={(e) => setSearchNia(e.target.value)}
            placeholder="Masukkan NIA..." 
            className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-xl font-bold text-lg"
          />
          <button onClick={() => fetchProfilData(searchNia)} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black">
            {loading ? '...' : 'CARI'}
          </button>
        </div>

        {/* Dashboard Preview */}
        {data ? (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-300">
            <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 flex gap-10">
              <div className="w-56 h-72 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner border-4 border-white">
                 <img src={data.foto_url || '/placeholder.png'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-black uppercase text-slate-800 leading-none">{data.nama_lengkap}</h2>
                <p className="text-blue-600 font-mono font-bold mt-2">{data.nia}</p>
                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-50">
                  <div className="text-sm font-bold"><p className="text-[10px] text-slate-400 uppercase">Alamat</p>{data.alamat_lengkap}</div>
                  <div className="text-sm font-bold"><p className="text-[10px] text-slate-400 uppercase">Ranting</p>{data.ranting}</div>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] text-white">
              <h3 className="font-black uppercase text-sm mb-6 flex justify-between">Riwayat <span>Sabuk</span></h3>
              <div className="space-y-3">
                {riwayat.map((s, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between text-xs font-bold uppercase">
                    <span>{s.tingkat}</span>
                    <span className="text-blue-400">{s.tahun}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-300 font-bold uppercase">Cari NIA untuk melihat profil</div>
        )}
      </div>

      {/* --- RENDER KHUSUS CETAK (INI YANG PENTING) --- */}
      <div className="hidden-print-container">
        <div ref={contentRef} className="printable-content">
          {data && <CetakProfil data={data} riwayat={riwayat} />}
        </div>
      </div>

      <style jsx global>{`
        /* Sembunyikan konten cetak saat di layar browser */
        .hidden-print-container {
          position: absolute;
          left: -9999px;
          top: 0;
        }

        @media print {
          /* Sembunyikan SEMUA elemen kecuali yang ada di dalam ref contentRef */
          body * {
            visibility: hidden;
          }
          .hidden-print-container, 
          .hidden-print-container *,
          .printable-content, 
          .printable-content * {
            visibility: visible !important;
          }
          .hidden-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
