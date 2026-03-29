'use client';

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  Printer, Search, ShieldCheck, Edit3, 
  Download, History, Smartphone, MapPin, 
  Calendar, Hash, User 
} from 'lucide-react';
import { CetakProfil } from '@/components/CetakProfil';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilAnggota() {
  // 1. Ref khusus untuk konten yang akan dicetak (Kop Surat, dll)
  const componentRef = useRef<HTMLDivElement>(null);
  
  const [data, setData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNia, setSearchNia] = useState('');

  // 2. Logika Cetak menggunakan react-to-print terbaru
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
      alert("NIA tidak ditemukan atau terjadi kesalahan koneksi.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-900 pb-20">
      {/* HEADER DASHBOARD (Sesuai profil.html) */}
      <div className="max-w-7xl mx-auto px-8 pt-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase">Profil Anggota</h1>
            <p className="text-slate-500 font-medium">Manajemen data personal dan riwayat sertifikasi ISBDS Cipta Sejati.</p>
          </div>
          <div className="flex gap-3">
            {data && (
              <button 
                onClick={() => handlePrint()} 
                className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
              >
                <Printer size={18} /> CETAK
              </button>
            )}
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:opacity-90 transition-all">
              <Edit3 size={18} /> EDIT DATA
            </button>
          </div>
        </div>

        {/* SEARCH BAR (Sesuai profil.html) */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm mb-12 border border-slate-100">
          <div className="max-w-2xl">
            <label className="block text-sm font-bold text-slate-400 mb-3 px-1 uppercase tracking-wider">Cari NIA Anggota</label>
            <div className="relative flex items-center">
              <Search className="absolute left-5 text-slate-300" size={20} />
              <input 
                type="text" 
                value={searchNia}
                onChange={(e) => setSearchNia(e.target.value)}
                placeholder="Masukkan 12 digit NIA..." 
                className="w-full pl-14 pr-32 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all text-lg font-bold"
              />
              <button 
                onClick={() => fetchProfilData(searchNia)}
                className="absolute right-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                {loading ? '...' : 'CARI'}
              </button>
            </div>
          </div>
        </div>

        {data ? (
          <div className="grid grid-cols-12 gap-8">
            {/* KARTU PROFIL UTAMA */}
            <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-bl-full"></div>
              
              <div className="w-64 shrink-0 text-center">
                <div className="aspect-[3/4] rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-md">
                  {data.foto_url ? (
                    <img src={data.foto_url} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <User size={64} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase mt-4">Tanpa Foto</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-extrabold uppercase">{data.status_anggota || 'AKTIF'}</span>
                </div>
              </div>

              <div className="flex-1 space-y-8">
                <div>
                  <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">Identitas Anggota</p>
                  <h2 className="text-3xl font-extrabold text-slate-800 leading-tight uppercase">{data.nama_lengkap}</h2>
                  <p className="text-lg font-medium text-slate-500 font-mono">NIA: {data.nia}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tempat, Tanggal Lahir</label>
                    <p className="text-sm font-bold text-slate-700">{data.tempat_lahir}, {data.tanggal_lahir}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</label>
                    <p className="text-sm font-bold text-slate-700">{data.jenis_kelamin}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Lengkap</label>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{data.alamat_lengkap}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor HP/WA</label>
                    <p className="text-sm font-bold text-slate-700">{data.no_hp || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Ranting</label>
                    <p className="text-sm font-bold text-slate-700">{data.ranting}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIWAYAT SABUK (SIDEBAR) */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200/50">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-extrabold uppercase tracking-tight">Riwayat Sabuk</h4>
                  <History size={20} className="text-slate-400" />
                </div>
                <div className="space-y-4">
                  {riwayat.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${item.tingkat?.toLowerCase().includes('biru') ? 'bg-blue-800' : 'bg-yellow-400'}`}></div>
                        <div>
                          <p className="text-sm font-bold uppercase">Sabuk {item.tingkat}</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">SK: {item.no_sertifikat}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{item.tahun}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
            <ShieldCheck size={80} className="mx-auto text-slate-100 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-bold text-slate-300 uppercase italic">Masukkan NIA untuk memuat profil</h3>
          </div>
        )}
      </div>

      {/* --- BAGIAN RENDER CETAK (OFF-SCREEN) --- */}
      {/* Diletakkan di dalam div tersembunyi agar tidak merusak UI Dashboard. 
          Isinya akan menggunakan template dari cetak-profil.html.
      */}
      <div style={{ display: 'none' }}>
        <div ref={componentRef}>
          {data && <CetakProfil data={data} riwayat={riwayat} />}
        </div>
      </div>
    </div>
  );
}
