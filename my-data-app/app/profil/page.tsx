'use client';

import React, { useRef, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import { useReactToPrint } from 'react-to-print';
import { Printer, Search, ShieldCheck, Hash } from 'lucide-react';
import { CetakProfil } from '@/components/CetakProfil';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilAnggota() {
  // Gunakan ref ini khusus untuk area yang akan dicetak
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchNia, setSearchNia] = useState('');

  // Konfigurasi print
  const handlePrint = useReactToPrint({
    // Pastikan ini mengarah ke printAreaRef
    contentRef: printAreaRef, 
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

      if (anggota) {
        const { data: sabuk } = await supabase
          .from('riwayat_sabuk')
          .select('*')
          .eq('anggota_id', anggota.id)
          .order('tahun', { ascending: true });

        setData(anggota);
        setRiwayat(sabuk || []);
      }
    } catch (err) {
      alert("NIA tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* --- UI DASHBOARD (TIDAK AKAN DICETAK) --- */}
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <div className="flex justify-between items-end mb-10">
          <h1 className="text-4xl font-black uppercase">Profil Anggota</h1>
          {data && (
            <button 
              onClick={() => handlePrint()} 
              className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg"
            >
              <Printer size={18} /> CETAK SEKARANG
            </button>
          )}
        </div>

        {/* Input Cari */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-10 border border-slate-100 flex gap-4">
          <input 
            type="text" 
            value={searchNia}
            onChange={(e) => setSearchNia(e.target.value)}
            placeholder="Masukkan NIA..." 
            className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold"
          />
          <button onClick={() => fetchProfilData(searchNia)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black">
            CARI
          </button>
        </div>

        {/* Tampilan di Layar (Hanya untuk Preview) */}
        {data && (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
             <h2 className="text-2xl font-bold mb-4 uppercase">{data.nama_lengkap}</h2>
             <p className="text-slate-500 font-mono">NIA: {data.nia}</p>
             {/* ... Sisa UI preview layar Anda ... */}
          </div>
        )}
      </div>

      {/* --- AREA KHUSUS CETAK (HIDDEN DI LAYAR) --- */}
      <div style={{ display: 'none' }}>
        <div ref={printAreaRef} className="print-container">
          {data && (
            <CetakProfil 
              data={data} 
              riwayat={riwayat} 
            />
          )}
        </div>
      </div>

      {/* Tambahkan CSS Internal untuk memastikan hasil cetak bersih */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
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
