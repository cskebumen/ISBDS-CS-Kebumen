'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Edit3, Search, ShieldCheck, Phone, MapPin, Calendar, Hash } from 'lucide-react';
import { CetakProfil } from '@/components/CetakProfil';
import { supabase } from '@/lib/supabaseClient'; // Pastikan path ini sesuai dengan config Supabase Anda

export default function ProfilAnggota() {
  const componentRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchNia, setSearchNia] = useState('');

  // Fungsi untuk mengambil data berdasarkan NIA (atau data login jika tersedia)
  const fetchProfilData = async (targetNia?: string) => {
    setLoading(true);
    try {
      // 1. Ambil data utama anggota
      const { data: anggota, error: errAnggota } = await supabase
        .from('anggota')
        .select('*')
        .eq('nia', targetNia || '') // Sesuaikan filter jika ingin default ke user login
        .single();

      if (errAnggota) throw errAnggota;

      // 2. Ambil riwayat sabuk (Relasi ke anggota_id)
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
    } finally {
      setLoading(false);
    }
  };

  // Load awal (bisa dikosongkan jika harus cari NIA dulu)
  useEffect(() => {
    // fetchProfilData('03.06.02.000001'); // Contoh panggil data awal
  }, []);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Profil_Anggota_${data?.nama_lengkap}`,
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-900 pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Profil Anggota</h1>
            <p className="text-slate-500 font-medium italic">Sistem Informasi Manajemen ISBDS Cipta Sejati Cabang Kebumen</p>
          </div>
          <div className="flex gap-3">
            {data && (
              <button 
                onClick={handlePrint} 
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

        {/* SEARCH BOX (Untuk mencari profil berdasarkan NIA) */}
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
            className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-700 transition-all"
          >
            CARI DATA
          </button>
        </div>

        {!data ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
            <ShieldCheck size={80} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-bold text-slate-400 uppercase">Silakan cari NIA untuk melihat profil</h3>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
            
            {/* KARTU PROFIL UTAMA */}
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">Anggota Resmi</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 leading-tight uppercase tracking-tight">{data.nama_lengkap}</h2>
                  <div className="flex items-center gap-2 mt-2 text-slate-400 font-mono font-bold text-lg">
                    <Hash size={18} /> {data.nia}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-slate-50">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase"><Calendar size={12}/> TTL</p>
                    <p className="text-sm font-bold text-slate-700 uppercase">{data.tempat_lahir}, {data.tanggal_lahir}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase"><MapPin size={12}/> Ranting</p>
                    <p className="text-sm font-bold text-slate-700 uppercase">{data.ranting}</p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase"><MapPin size={12}/> Alamat Lengkap</p>
                    <p className="text-sm font-bold text-slate-700 uppercase leading-relaxed">{data.alamat_lengkap}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase"><Phone size={12}/> WhatsApp</p>
                    <p className="text-sm font-bold text-slate-700">{data.no_hp}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR: RIWAYAT SABUK */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/10 h-full">
                <h3 className="text-lg font-black mb-8 flex items-center gap-3 italic tracking-tight uppercase text-blue-400">
                  <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                  Riwayat Sabuk
                </h3>
                <div className="space-y-4">
                  {riwayat.length > 0 ? riwayat.map((item, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${
                          item.tingkat?.toLowerCase() === 'kuning' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 
                          item.tingkat?.toLowerCase() === 'hijau' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                          item.tingkat?.toLowerCase() === 'biru' ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-slate-400'
                        }`}></div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight">Sabuk {item.tingkat}</p>
                          <p className="text-[9px] text-white/40 font-bold uppercase mt-1">SK: {item.no_sertifikat}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black bg-white/10 px-3 py-1 rounded-lg text-blue-400">{item.tahun}</span>
                    </div>
                  )) : (
                    <p className="text-center text-white/20 py-10 font-bold uppercase text-xs border border-dashed border-white/10 rounded-2xl">Data Riwayat Kosong</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* KOMPONEN CETAK (HIDDEN) */}
      <div className="hidden">
        {data && <CetakProfil ref={componentRef} data={data} riwayat={riwayat} />}
      </div>
    </div>
  );
}
