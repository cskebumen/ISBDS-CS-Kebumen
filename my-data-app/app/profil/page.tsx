'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Edit3, Search, ShieldCheck, Phone, MapPin, Calendar, Hash } from 'lucide-react';
import { CetakProfil } from '@/components/CetakProfil';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilAnggota() {
  // 1. Ref ini harus disambungkan ke komponen CetakProfil
  const contentRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNia, setSearchNia] = useState('');

  // 2. Perbaikan konfigurasi useReactToPrint sesuai versi terbaru
  const handlePrint = useReactToPrint({
    contentRef: contentRef, // Menggunakan contentRef, bukan content () => ...
    documentTitle: `Profil_Anggota_${data?.nama_lengkap || 'Dokumen'}`,
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
        const { data: sabuk, error: errSabuk } = await supabase
          .from('riwayat_sabuk')
          .select('*')
          .eq('anggota_id', anggota.id)
          .order('tahun', { ascending: true });

        setData(anggota);
        setRiwayat(sabuk || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      alert("Data tidak ditemukan atau terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-900 pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Profil Anggota</h1>
            <p className="text-slate-500 font-medium italic">Sistem Informasi Manajemen ISBDS Cipta Sejati</p>
          </div>
          <div className="flex gap-3">
            {data && (
              <button 
                onClick={() => handlePrint()} // Memanggil fungsi print
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
              >
                <Printer size={18} /> CETAK PROFIL
              </button>
            )}
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 hover:opacity-90 transition-all">
              <Edit3 size={18} /> EDIT DATA
            </button>
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-10 border border-slate-100 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              value={searchNia}
              onChange={(e) => setSearchNia(e.target.value)}
              placeholder="Masukkan NIA (Contoh: 03.06.02.000042)" 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all text-lg font-bold"
            />
          </div>
          <button 
            onClick={() => fetchProfilData(searchNia)}
            disabled={loading}
            className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? 'MEMUAT...' : 'CARI DATA'}
          </button>
        </div>

        {data ? (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Tampilan Profil (Sama seperti sebelumnya) */}
            <div className="col-span-12 lg:col-span-8 bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10">
               <div className="w-full md:w-64 shrink-0">
                <div className="aspect-[3/4] rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-md">
                  {data.foto_url ? (
                    <img src={data.foto_url} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                      <ShieldCheck size={64} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase mt-4">Foto Kosong</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-black text-blue-600 uppercase">Status</span>
                  <span className="text-xs font-black text-blue-800 uppercase tracking-tighter">{data.status_anggota || 'AKTIF'}</span>
                </div>
              </div>

              <div className="flex-1 space-y-8">
                <div>
                  <h2 className="text-4xl font-black text-slate-800 leading-tight uppercase tracking-tight">{data.nama_lengkap}</h2>
                  <div className="flex items-center gap-2 mt-2 text-slate-400 font-mono font-bold text-lg">
                    <Hash size={18} /> {data.nia}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-slate-50">
                  <div className="space-y-1 text-sm font-bold text-slate-700 uppercase">
                    <p className="text-[10px] font-black text-slate-400">TTL</p>
                    {data.tempat_lahir}, {data.tanggal_lahir}
                  </div>
                  <div className="space-y-1 text-sm font-bold text-slate-700 uppercase">
                    <p className="text-[10px] font-black text-slate-400">Ranting</p>
                    {data.ranting}
                  </div>
                  <div className="md:col-span-2 space-y-1 text-sm font-bold text-slate-700 uppercase">
                    <p className="text-[10px] font-black text-slate-400">Alamat</p>
                    {data.alamat_lengkap}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Riwayat */}
            <div className="col-span-12 lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] text-white">
              <h3 className="text-lg font-black mb-6 text-blue-400 uppercase italic">Riwayat Sabuk</h3>
              <div className="space-y-4">
                {riwayat.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-black uppercase">Sabuk {item.tingkat}</p>
                      <p className="text-[9px] text-white/40 uppercase">SK: {item.no_sertifikat}</p>
                    </div>
                    <span className="text-[11px] font-black text-blue-400">{item.tahun}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
            <ShieldCheck size={80} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-bold text-slate-400 uppercase">Cari NIA untuk memuat profil</h3>
          </div>
        )}
      </div>

      {/* 3. BAGIAN KRUSIAL: Menghubungkan ref ke komponen cetak */}
      <div className="hidden">
        <div ref={contentRef}>
          {data && <CetakProfil data={data} riwayat={riwayat} />}
        </div>
      </div>
    </div>
  );
}
