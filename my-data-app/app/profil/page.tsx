'use client';

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  Printer, Search, ShieldCheck, Edit3, 
  History, User, Download 
} from 'lucide-react';
import { CetakProfil } from '@/components/CetakProfil';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilAnggota() {
  // Ref ini harus mengarah ke div yang membungkus komponen CetakProfil secara eksklusif
  const componentRef = useRef<HTMLDivElement>(null);
  
  const [data, setData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNia, setSearchNia] = useState('');

  // Fungsi Cetak
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Profil_Anggota_${data?.nama_lengkap || 'ISBDS'}`,
  });

  const fetchProfilData = async (targetNia: string) => {
    if (!targetNia) return;
    setLoading(true);
    try {
      const { data: anggota, error: errAnggota } = await supabase
        .from('anggota')
        .select('*')
        .eq('nia', targetNia)
        .single();

      if (errAnggota) throw errAnggota;

      if (anggota) {
        const { data: sabuk } = await supabase
          .from('riwayat_sabuk')
          .select('*')
          .eq('anggota_id', anggota.id)
          .order('tahun', { ascending: true });

        setData(anggota);
        setRiwayat(sabuk || []);
      }
    } catch (error) {
      alert("NIA tidak ditemukan.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 no-print-area">
      {/* 1. UI DASHBOARD (Hanya tampil di layar) 
          Sesuai referensi profil.html
      */}
      <div className="max-w-7xl mx-auto px-8 pt-10 screen-only">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-extrabold uppercase italic tracking-tighter">Profil Anggota</h1>
            <p className="text-slate-500 font-medium mt-1">Sistem Informasi Manajemen ISBDS Cipta Sejati</p>
          </div>
          <div className="flex gap-3">
            {data && (
              <button 
                onClick={() => handlePrint()} 
                className="flex items-center gap-2 px-8 py-3 bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-105 transition-all"
              >
                <Printer size={20} /> CETAK PROFIL
              </button>
            )}
          </div>
        </div>

        {/* Form Pencarian */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm mb-12 border border-slate-100 flex gap-4 items-center">
           <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
              <input 
                type="text" 
                value={searchNia}
                onChange={(e) => setSearchNia(e.target.value)}
                placeholder="Cari berdasarkan NIA..." 
                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] font-bold text-lg focus:ring-2 focus:ring-blue-500/20"
              />
           </div>
           <button 
             onClick={() => fetchProfilData(searchNia)}
             className="px-12 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-blue-800 transition-all shadow-lg"
           >
             {loading ? '...' : 'CARI'}
           </button>
        </div>

        {/* Tampilan Preview Dashboard (profil.html) */}
        {data ? (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex gap-10">
              <div className="w-56 shrink-0 aspect-[3/4] rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-md">
                 <img src={data.foto_url || '/placeholder.png'} className="w-full h-full object-cover" alt="Foto" />
              </div>
              <div className="flex-1">
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">{data.status_anggota || 'AKTIF'}</span>
                <h2 className="text-4xl font-black mt-4 text-slate-900 leading-tight uppercase">{data.nama_lengkap}</h2>
                <p className="text-xl font-bold text-blue-600 font-mono mt-1">NIA: {data.nia}</p>
                <div className="grid grid-cols-2 gap-6 mt-10 pt-10 border-t border-slate-50">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tempat, Tgl Lahir</label>
                    <p className="font-bold text-slate-700">{data.tempat_lahir}, {data.tanggal_lahir}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Ranting</label>
                    <p className="font-bold text-slate-700">{data.ranting}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Sidebar Riwayat (profil.html) */}
            <div className="col-span-4 bg-slate-900 p-8 rounded-[3rem] text-white">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-black uppercase tracking-widest text-sm">Riwayat Sabuk</h3>
                  <History className="opacity-30" />
               </div>
               <div className="space-y-4">
                  {riwayat.map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <p className="text-xs font-black uppercase text-blue-400">Sabuk {s.tingkat}</p>
                        <p className="text-[10px] font-medium opacity-50 italic">SK: {s.no_sertifikat}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-white/10 rounded-lg">{s.tahun}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <ShieldCheck size={64} className="mx-auto text-slate-200 mb-4" />
             <p className="font-black text-slate-300 uppercase italic tracking-widest text-lg">Data belum dimuat</p>
          </div>
        )}
      </div>

      {/* 2. AREA CETAK KHUSUS (TERSEMBUNYI DI LAYAR)
          Sesuai referensi cetak-profil.html
      */}
      <div className="print-only-container">
        <div ref={componentRef}>
          {data && <CetakProfil data={data} riwayat={riwayat} />}
        </div>
      </div>

      {/* CSS CRITICAL UNTUK MEMISAHKAN LAYAR & HASIL CETAK */}
      <style jsx global>{`
        /* Sembunyikan container cetak di browser biasa */
        .print-only-container {
          display: none;
        }

        @media print {
          /* Hilangkan SEMUA elemen dashboard saat print */
          .screen-only, 
          header, 
          aside, 
          button, 
          .no-print-area {
            display: none !important;
          }

          /* Tampilkan HANYA container cetak */
          .print-only-container {
            display: block !important;
            width: 100%;
            height: auto;
            background: white;
            padding: 0;
            margin: 0;
          }

          /* Reset margin halaman agar pas A4 */
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}

