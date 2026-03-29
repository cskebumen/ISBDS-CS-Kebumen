'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

// Tipe data anggota
type Anggota = {
  nia: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat_lengkap: string;
  ranting: string;
  cabang: string;
  no_hp: string;
  status: string;
  terdaftar_sejak: string;
  sabuk_terakhir: string;
  foto_url?: string;
};

export default function DetailProfilPage() {
  const params = useParams();
  const nia = params.nia as string;
  const [anggota, setAnggota] = useState<Anggota | null>(null);
  const [loading, setLoading] = useState(true);
  const [riwayatSabuk, setRiwayatSabuk] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Ganti dengan fetch dari Supabase
    // Simulasi data
    setTimeout(() => {
      setAnggota({
        nia: nia,
        nama_lengkap: 'Bambang Wijaya Kusuma',
        tempat_lahir: 'Kebumen',
        tanggal_lahir: '14 Mei 1995',
        jenis_kelamin: 'Laki-laki',
        alamat_lengkap: 'Jl. Pahlawan No. 45, Desa Kedungwinangun, Kec. Klirong, Kab. Kebumen, Jawa Tengah 54381',
        ranting: 'Klirong',
        cabang: 'Kebumen',
        no_hp: '+62 812-3456-7890',
        status: 'Aktif',
        terdaftar_sejak: '12 Januari 2018',
        sabuk_terakhir: 'Biru (Asisten Pelatih)',
        foto_url: 'https://lh3.googleusercontent.com/aida-public/...'
      });
      setRiwayatSabuk([
        { tingkat: 'Biru', no_sertifikat: '2022/ISBDS/CERT/089', tahun: 2022 },
        { tingkat: 'Hijau', no_sertifikat: '2020/ISBDS/CERT/112', tahun: 2020 },
        { tingkat: 'Kuning', no_sertifikat: '2018/ISBDS/CERT/204', tahun: 2018 }
      ]);
      setLoading(false);
    }, 500);
  }, [nia]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!anggota) return <div className="flex justify-center items-center h-screen">Data tidak ditemukan</div>;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeMenu="profil" />
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <div className="p-8">
          {/* Tombol kembali & cetak */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/profil" className="text-primary flex items-center gap-1">
              <span className="material-symbols-outlined">arrow_back</span> Kembali
            </Link>
            <div className="flex gap-3">
              <Link href={`/cetak-profil/${nia}`} target="_blank" className="px-6 py-2.5 rounded-xl border-2 border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">print</span> Cetak Profil
              </Link>
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-sm shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">edit</span> Edit Data
              </button>
            </div>
          </div>

          {/* Konten profil sesuai desain asli */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-[0px_24px_48px_rgba(0,31,64,0.06)] flex gap-12 relative overflow-hidden">
              {/* Foto dan info */}
              <div className="w-64 shrink-0">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-inner bg-surface-container-highest">
                  <img src={anggota.foto_url || '/images/default-avatar.png'} alt="Foto Anggota" className="w-full h-full object-cover" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-extrabold uppercase tracking-tight">{anggota.status}</span>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Terdaftar Sejak</p>
                    <p className="text-sm font-bold text-on-surface">{anggota.terdaftar_sejak}</p>
                  </div>
                </div>
              </div>

              {/* Data diri */}
              <div className="flex-1 space-y-8">
                <div>
                  <p className="text-xs font-bold text-primary tracking-widest uppercase mb-1">Identitas Anggota</p>
                  <h3 className="text-3xl font-extrabold font-headline text-on-surface">{anggota.nama_lengkap}</h3>
                  <p className="text-lg font-medium text-on-surface-variant font-headline">NIA: {anggota.nia}</p>
                </div>
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tempat, Tanggal Lahir</label>
                    <p className="text-sm font-semibold text-on-surface">{anggota.tempat_lahir}, {anggota.tanggal_lahir}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</label>
                    <p className="text-sm font-semibold text-on-surface">{anggota.jenis_kelamin}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Alamat Lengkap</label>
                    <p className="text-sm font-semibold text-on-surface leading-relaxed">{anggota.alamat_lengkap}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor HP/WA</label>
                    <div className="flex items-center space-x-2">
                      <span className="material-symbols-outlined text-emerald-500 text-base">chat</span>
                      <p className="text-sm font-semibold text-on-surface">{anggota.no_hp}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Ranting / Cabang</label>
                    <p className="text-sm font-semibold text-on-surface">{anggota.ranting} / {anggota.cabang}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <div className="flex-1 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Tingkat Sabuk Saat Ini</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-8 bg-blue-800 rounded-sm"></div>
                      <p className="text-xl font-extrabold text-blue-900 font-headline">{anggota.sabuk_terakhir}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Sabuk */}
            <div className="col-span-4 space-y-6">
              <div className="bg-surface-container-low p-8 rounded-[2rem]">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold font-headline">Riwayat Sabuk</h4>
                  <span className="material-symbols-outlined text-slate-400">history</span>
                </div>
                <div className="space-y-4">
                  {riwayatSabuk.map((item, idx) => (
                    <div key={idx} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-10 rounded-full ${
                          item.tingkat === 'Biru' ? 'bg-blue-800' : item.tingkat === 'Hijau' ? 'bg-green-600' : 'bg-yellow-400'
                        }`}></div>
                        <div>
                          <p className="text-sm font-bold">{item.tingkat}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.no_sertifikat}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-lg">{item.tahun}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 border-2 border-dashed border-outline-variant rounded-2xl text-xs font-bold text-slate-400 hover:border-primary hover:text-primary transition-all">
                  + Tambah Riwayat Sabuk
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-8 mt-auto flex flex-col md:flex-row justify-between items-center px-12 opacity-60">
          <div className="flex space-x-8 mb-4 md:mb-0">
            <a href="#" className="text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline font-inter text-xs tracking-wide transition-all">Kebijakan Privasi</a>
            <a href="#" className="text-slate-400 hover:text-blue-500 underline-offset-4 hover:underline font-inter text-xs tracking-wide transition-all">Syarat & Ketentuan</a>
          </div>
          <p className="text-slate-500 font-inter text-xs tracking-wide">© 2024 SIM ISBDS Cipta Sejati Cabang Kebumen. All Rights Reserved.</p>
        </footer>
      </main>
    </div>
  );
}
