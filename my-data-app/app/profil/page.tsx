'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Search, ShieldCheck, Edit3, History, Hash, Phone, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import { CetakProfil } from '@/components/CetakProfil';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilAnggotaPage() {
  const { user, role, nia: userNia, ranting: userRanting, loading: authLoading } = useAuth();
  const router = useRouter();

  const componentRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNia, setSearchNia] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirect jika belum login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Untuk bendahara & anggota: langsung tampilkan profil sendiri
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (role === 'bendahara' || role === 'anggota') {
      if (userNia) {
        fetchProfilData(userNia, true); // force true untuk bypass filter ranting
      } else {
        alert('Profil Anda belum terkait dengan NIA. Hubungi admin.');
      }
    }
  }, [authLoading, user, role, userNia]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Profil_${data?.nama_lengkap || 'Anggota'}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    `,
  });

  const fetchProfilData = async (targetNia: string, forceBypassFilter = false) => {
    const nia = targetNia.trim();
    if (!nia) return;
    setLoading(true);
    try {
      const { data: anggota, error } = await supabase
        .from('anggota')
        .select('*')
        .eq('nia', nia)
        .single();
      if (error) throw error;

      // Proteksi untuk ketua ranting: hanya boleh melihat anggota rantingnya sendiri
      if (!forceBypassFilter && role === 'ketua ranting' && anggota.ranting !== userRanting) {
        alert('Anda tidak memiliki akses ke profil anggota ranting lain.');
        setData(null);
        setRiwayat([]);
        return;
      }

      const { data: sabuk } = await supabase
        .from('riwayat_sabuk')
        .select('*')
        .eq('anggota_id', anggota.id)
        .order('tahun', { ascending: true });
      setData(anggota);
      setRiwayat(sabuk || []);
    } catch (error) {
      alert('NIA tidak ditemukan.');
      setData(null);
      setRiwayat([]);
    } finally {
      setLoading(false);
    }
  };

  // Render search bar hanya untuk role yang diizinkan mencari (bukan bendahara/anggota)
  const canSearch = role !== 'bendahara' && role !== 'anggota';

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <div className="screen-only flex min-h-screen bg-surface">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-surface pb-24">
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
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">Profil Anggota</h1>
              <p className="text-sm text-tertiary font-medium">
                {role === 'bendahara' || role === 'anggota'
                  ? 'Informasi profil Anda'
                  : 'Manajemen Data Personal Anggota dan riwayat sertifikasi anggota ISBDS Cipta Sejati'}
              </p>
            </div>

            {data && (
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => handlePrint()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl font-bold shadow hover:bg-blue-800 transition-all text-xs"
                >
                  <Printer size={14} />
                  CETAK
                </button>
                <button className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:text-blue-600 shadow-sm">
                  <Edit3 size={14} />
                </button>
              </div>
            )}

            {/* Search Bar hanya untuk role yang memiliki hak pencarian */}
            {canSearch && (
              <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex items-center mb-8 group focus-within:border-blue-200 transition-all">
                <div className="flex-1 flex items-center px-4">
                  <Search className="text-slate-300 mr-2" size={14} />
                  <input
                    type="text"
                    value={searchNia}
                    onChange={(e) => setSearchNia(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchProfilData(searchNia); }}
                    placeholder="Cari NIA (Contoh: 03.06.02.000042)"
                    className="w-full py-2 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none"
                  />
                </div>
                <button
                  onClick={() => fetchProfilData(searchNia)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-xs"
                >
                  {loading ? '...' : 'CARI'}
                </button>
              </div>
            )}

            {/* Tampilan data */}
            {data ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ... (sisa JSX tidak berubah) ... */}
                <div className="lg:col-span-4 xl:col-span-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="aspect-[3/4] rounded-xl bg-slate-50 overflow-hidden border-2 border-white shadow">
                      <img src={data.foto_url || '/placeholder.png'} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center">
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Status Anggota</p>
                      <p className="text-[11px] font-bold text-blue-900 uppercase mt-0.5">{data.status_anggota || 'AKTIF'}</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 xl:col-span-9">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase leading-tight tracking-tight">{data.nama_lengkap}</h2>
                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-mono font-bold text-[10px] uppercase">
                          <Hash size={12} className="text-blue-500" />
                          {data.nia}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tempat, Tgl Lahir</label>
                        <p className="text-xs font-semibold text-slate-700">{data.tempat_lahir}, {data.tanggal_lahir}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Jenis Kelamin</label>
                        <p className="text-xs font-semibold text-slate-700">{data.jenis_kelamin || '-'}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1"><Phone size={10} /> No. HP/WA</label>
                        <p className="text-xs font-semibold text-slate-700">{data.no_hp || '-'}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 flex items-center gap-1"><MapPin size={10} /> Ranting</label>
                        <p className="text-xs font-semibold text-slate-700">{data.ranting || '-'}</p>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Cabang</label>
                        <p className="text-xs font-semibold text-slate-700">{data.cabang || 'Kebumen'}</p>
                      </div>
                      <div className="col-span-full">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Alamat Lengkap</label>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">{data.alamat_lengkap || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-md">
                    <h3 className="font-bold uppercase text-[10px] mb-3 text-blue-400 flex justify-between items-center tracking-wider">
                      Riwayat Sabuk <History size={14} />
                    </h3>
                    <div className="space-y-2">
                      {riwayat.length > 0 ? (
                        riwayat.map((s, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold truncate">{s.tingkat}</p>
                              <p className="text-[8px] font-medium text-white/40 italic truncate">{s.no_sertifikat}</p>
                            </div>
                            <span className="text-[10px] font-bold text-blue-400">{s.tahun}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/60">Belum ada riwayat sabuk.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                <ShieldCheck size={48} className="mx-auto text-slate-100 mb-3" />
                <p className="font-bold text-slate-300 uppercase tracking-widest text-sm">
                  {loading ? 'Memuat data...' : (role === 'bendahara' || role === 'anggota') ? 'Profil Anda belum tersedia' : 'Data belum dimuat'}
                </p>
              </div>
            )}
          </div>
          <Footer />
        </main>
      </div>

      <div className="print-only">
        {data && <CetakProfil ref={componentRef} data={data} riwayat={riwayat} />}
      </div>

      <style jsx global>{`
        @media screen {
          .print-only { display: none; }
        }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { visibility: hidden !important; }
          .print-only, .print-only * { visibility: visible !important; }
          .print-only { display: block !important; position: absolute; left: 0; top: 0; width: 210mm; min-height: 297mm; margin: 0 auto; background: white !important; }
          .screen-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
