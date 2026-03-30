'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';

// Dynamic import untuk menghindari error "self is not defined"
const html2pdf = dynamic(() => import('html2pdf.js'), { ssr: false });

// Mapping sabuk ke jabatan
const jabatanMap: Record<string, string> = {
  Kuning: 'Pemula',
  Hijau: 'Dasar 1',
  Biru: 'Dasar 2',
  Cokelat: 'Asisten Pelatih',
  'Hitam 1': 'Pelatih Muda',
  'Hitam 2': 'Pelatih Madya',
  'Hitam 3': 'Pelatih Utama',
  'Hitam 4': 'Asisten Guru Muda',
  'Merah 1': 'Guru Muda',
  'Merah 2': 'Guru Madya',
  'Merah 3': 'Guru Utama',
  'Merah 4': 'Guru Besar',
};

const beltOptions = [
  'Kuning', 'Hijau', 'Biru', 'Cokelat',
  'Hitam 1', 'Hitam 2', 'Hitam 3', 'Hitam 4',
  'Merah 1', 'Merah 2', 'Merah 3', 'Merah 4',
];

type Sertifikat = {
  id: string;
  no_sertifikat: string;
  tingkat: string;
  tanggal_kenaikan: string;
  anggota_id: string;
  created_at: string;
};

type Anggota = {
  id: string;
  nia: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  foto_url?: string;
  cabang: string;
};

export default function SertifikatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchNia, setSearchNia] = useState('');
  const [anggota, setAnggota] = useState<Anggota | null>(null);
  const [riwayatSertifikat, setRiwayatSertifikat] = useState<Sertifikat[]>([]);
  const [selectedBelt, setSelectedBelt] = useState(beltOptions[0]);
  const [tanggalKenaikan, setTanggalKenaikan] = useState(new Date().toISOString().slice(0, 10));
  const [generatedSertifikat, setGeneratedSertifikat] = useState<Sertifikat | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !html2pdf) return;
    const element = contentRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5], // top, right, bottom, left (dalam satuan inci)
      filename: `Sertifikat_${anggota?.nama_lengkap || 'Anggota'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(element).save();
  };

  const fetchAnggota = async (nia: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anggota')
        .select('*')
        .eq('nia', nia)
        .single();
      if (error) throw error;
      setAnggota(data);
      const { data: sertifikatData } = await supabase
        .from('sertifikat')
        .select('*')
        .eq('anggota_id', data.id)
        .order('tanggal_kenaikan', { ascending: false });
      setRiwayatSertifikat(sertifikatData || []);
    } catch (error) {
      alert('NIA tidak ditemukan');
      setAnggota(null);
      setRiwayatSertifikat([]);
    } finally {
      setLoading(false);
    }
  };

  const generateNoSertifikat = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const { data } = await supabase
      .from('sertifikat')
      .select('no_sertifikat')
      .like('no_sertifikat', `ISBDS-CS/%/SERT-PPD/${month}/${year}`);
    let lastNumber = 0;
    if (data && data.length > 0) {
      const numbers = data.map(item => {
        const match = item.no_sertifikat.match(/ISBDS-CS\/(\d+)\/SERT-PPD/);
        return match ? parseInt(match[1], 10) : 0;
      });
      lastNumber = Math.max(...numbers, 0);
    }
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `ISBDS-CS/${nextNumber}/SERT-PPD/${month}/${year}`;
  };

  const handleGenerate = async () => {
    if (!anggota) {
      alert('Silakan cari anggota terlebih dahulu');
      return;
    }
    setIsGenerating(true);
    try {
      const noSertifikat = await generateNoSertifikat();
      const tanggal = tanggalKenaikan;

      const { data: certData, error: certErr } = await supabase
        .from('sertifikat')
        .insert({
          anggota_id: anggota.id,
          no_sertifikat: noSertifikat,
          tingkat: selectedBelt,
          tanggal_kenaikan: tanggal,
        })
        .select()
        .single();

      if (certErr) throw certErr;
      setGeneratedSertifikat(certData);

      const tahun = new Date(tanggal).getFullYear();

      const { data: existingRiwayat } = await supabase
        .from('riwayat_sabuk')
        .select('id')
        .eq('anggota_id', anggota.id)
        .eq('tingkat', selectedBelt)
        .maybeSingle();

      if (existingRiwayat) {
        await supabase
          .from('riwayat_sabuk')
          .update({ no_sertifikat: noSertifikat, tahun })
          .eq('id', existingRiwayat.id);
        alert(`Riwayat sabuk ${selectedBelt} berhasil diperbarui`);
      } else {
        await supabase
          .from('riwayat_sabuk')
          .insert({
            anggota_id: anggota.id,
            tingkat: selectedBelt,
            no_sertifikat: noSertifikat,
            tahun,
          });
        alert(`Riwayat sabuk ${selectedBelt} berhasil ditambahkan`);
      }

      const { data: riwayatBaru } = await supabase
        .from('sertifikat')
        .select('*')
        .eq('anggota_id', anggota.id)
        .order('tanggal_kenaikan', { ascending: false });
      setRiwayatSertifikat(riwayatBaru || []);
    } catch (error: any) {
      alert('Gagal menyimpan: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateRiwayatFromSertifikat = async (sertifikat: Sertifikat) => {
    if (!anggota) return;
    setIsSaving(true);
    try {
      const tahun = new Date(sertifikat.tanggal_kenaikan).getFullYear();
      const { data: existingRiwayat } = await supabase
        .from('riwayat_sabuk')
        .select('id')
        .eq('anggota_id', anggota.id)
        .eq('tingkat', sertifikat.tingkat)
        .maybeSingle();

      if (existingRiwayat) {
        await supabase
          .from('riwayat_sabuk')
          .update({ no_sertifikat: sertifikat.no_sertifikat, tahun })
          .eq('id', existingRiwayat.id);
        alert(`Riwayat sabuk ${sertifikat.tingkat} berhasil diperbarui`);
      } else {
        await supabase
          .from('riwayat_sabuk')
          .insert({
            anggota_id: anggota.id,
            tingkat: sertifikat.tingkat,
            no_sertifikat: sertifikat.no_sertifikat,
            tahun,
          });
        alert(`Riwayat sabuk ${sertifikat.tingkat} berhasil ditambahkan`);
      }
    } catch (error: any) {
      alert('Gagal menyimpan riwayat: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTanggalIndo = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const qrData = generatedSertifikat && anggota
    ? `${anggota.nia}|${generatedSertifikat.tingkat}|${generatedSertifikat.no_sertifikat}`
    : '';

  return (
    <div className="flex min-h-screen bg-surface">
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
                <p className="text-xs font-bold text-slate-800">Admin Kebumen</p>
                <p className="text-[10px] text-slate-500 font-medium">Administrator</p>
              </div>
              <ProfilePopup />
            </div>
          </div>
        </header>

        <div className="pt-24 px-4 md:px-8 pb-12 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">E-Sertifikat</h1>
            <p className="text-tertiary font-medium mt-1">Sistem otomasi pembuatan sertifikat kenaikan tingkat anggota</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Kiri */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">edit_note</span>
                  Data Sertifikat
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Cari Berdasarkan NIA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchNia}
                        onChange={(e) => setSearchNia(e.target.value)}
                        placeholder="Contoh: 03.06.02.000001"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                      <button
                        onClick={() => fetchAnggota(searchNia)}
                        disabled={loading}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                      >
                        Cari
                      </button>
                    </div>
                  </div>

                  {anggota && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Nama Anggota
                        </label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold">
                          {anggota.nama_lengkap}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Tingkat Sabuk
                        </label>
                        <select
                          value={selectedBelt}
                          onChange={(e) => setSelectedBelt(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                        >
                          {beltOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Tanggal Kenaikan
                        </label>
                        <input
                          type="date"
                          value={tanggalKenaikan}
                          onChange={(e) => setTanggalKenaikan(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Nomor Sertifikat (Otomatis)
                        </label>
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 py-2 text-sm font-mono text-primary">
                          {generatedSertifikat?.no_sertifikat || 'Akan di-generate'}
                        </div>
                      </div>
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                        {isGenerating ? 'Memproses...' : 'Generate & Simpan Riwayat'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 mt-0.5">info</span>
                  <div>
                    <p className="text-xs font-bold text-blue-800 uppercase">Panduan Cepat</p>
                    <p className="text-[11px] text-blue-700/80 leading-relaxed">
                      Sertifikat yang di-generate akan otomatis menyimpan/memperbarui riwayat sabuk anggota.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Kanan */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">visibility</span>
                  Pratinjau E-sertifikat
                </h3>
                <div className="flex gap-2">
                  {generatedSertifikat && (
                    <>
                      <button
                        onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
                        title="Perbesar"
                      >
                        <span className="material-symbols-outlined text-sm">zoom_in</span>
                      </button>
                      <button
                        onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
                        title="Perkecil"
                      >
                        <span className="material-symbols-outlined text-sm">zoom_out</span>
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 text-primary font-bold text-xs hover:underline"
                      >
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        Download PDF
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <div className="overflow-x-auto p-4" style={{ maxHeight: '80vh' }}>
                  <div
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
                  >
                    <div ref={contentRef} style={{ width: '210mm', margin: '0 auto' }}>
                      {generatedSertifikat && anggota ? (
                        <div className="bg-white p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {/* Kop */}
                          <div className="flex justify-between items-center border-b-4 border-double border-black pb-2 mb-4">
                            <img src="/images/ipsi.png" className="h-16 w-auto" alt="IPSI" />
                            <div className="text-center flex-grow px-2">
                              <h2 className="font-bold uppercase text-[14pt] m-0">Institut Seni Bela Diri Silat</h2>
                              <h1 className="font-extrabold uppercase text-[20pt] m-0">CIPTA SEJATI</h1>
                              <h3 className="font-bold uppercase text-[12pt] text-blue-700 m-0">CABANG KEBUMEN</h3>
                              <p className="italic text-[8.5pt] m-0">Alamat: Ds. Tlepok Rt 03/ Rw 01, Kec. Karangsambung, Kab. Kebumen</p>
                            </div>
                            <img src="/images/isbds.png" className="h-16 w-auto" alt="ISBDS" />
                          </div>

                          <div className="text-center mt-4">
                            <h1 className="text-[34pt] font-serif italic underline mb-1">Sertifikat</h1>
                            <p className="font-bold text-[10pt] mb-4">Nomor : {generatedSertifikat.no_sertifikat}</p>
                            <p className="mb-2 text-[12pt]">Diberikan kepada :</p>
                            <h2 className="font-bold text-[26pt] mb-3 border-b-2 border-gray-200 inline-block px-8 uppercase">
                              {anggota.nama_lengkap}
                            </h2>
                            <div className="w-[450px] mx-auto text-left text-[10pt] leading-relaxed mt-4">
                              <div className="flex"><div className="w-[180px]">Tempat, Tanggal Lahir</div><div>: {anggota.tempat_lahir}, {anggota.tanggal_lahir}</div></div>
                              <div className="flex"><div className="w-[180px]">Nomor Induk Anggota</div><div>: {anggota.nia}</div></div>
                              <div className="flex"><div className="w-[180px]">Anggota Cabang</div><div>: {anggota.cabang || 'KEBUMEN'}</div></div>
                            </div>
                            <div className="max-w-[80%] mx-auto mt-8 text-[10.5pt] leading-relaxed">
                              <p>
                                Telah menyelesaikan ujian dengan baik dan memenuhi persyaratan untuk lulus ke tingkat{' '}
                                <b className="text-blue-700">{jabatanMap[generatedSertifikat.tingkat] || generatedSertifikat.tingkat}</b>{' '}
                                dalam ujian kenaikan tingkat yang diselenggarakan oleh Institut Seni Bela Diri Silat CIPTA SEJATI dan berhak menyandang sabuk{' '}
                                <b className="text-blue-700">{generatedSertifikat.tingkat}</b>.
                              </p>
                            </div>
                            <p className="text-[11pt] mt-6">Diberikan pada tanggal {formatTanggalIndo(generatedSertifikat.tanggal_kenaikan)}</p>
                          </div>

                          <div className="flex justify-between items-end mt-8 px-4">
                            <div className="text-center min-w-[160px]">
                              <p className="text-[9pt]">Ketua Cabang Kebumen,</p>
                              <div className="h-[70px] flex items-center justify-center my-2">
                                <img src="/images/ketua.png" className="max-h-full" alt="Tanda Tangan" />
                              </div>
                              <p className="font-bold text-[9pt] underline">AHMAD TAUFIK</p>
                              <p className="text-[8pt]">NIA. 03.06.02.000003</p>
                            </div>
                            <div className="text-center min-w-[160px]">
                              <p className="text-[9pt]">Kebumen, {formatTanggalIndo(new Date().toISOString())}</p>
                              <p className="text-[9pt]">Guru Besar,</p>
                              <div className="h-[70px] flex items-center justify-center my-2">
                                <img src="/images/gurubesar.png" className="max-h-full" alt="Tanda Tangan" />
                              </div>
                              <p className="font-bold text-[9pt] underline">GB. Ir. SANTOSO</p>
                              <p className="text-[8pt]">NIA. 02.05.1966.001</p>
                            </div>
                          </div>

                          <div className="flex items-stretch justify-between mt-6 gap-3">
                            <div className="text-center w-[2.5cm]">
                              <div className="border border-black w-[2.2cm] h-[2.8cm] mx-auto overflow-hidden">
                                <img
                                  src={anggota.foto_url || '/images/placeholder-3x4.png'}
                                  className="w-full h-full object-cover"
                                  alt="Foto"
                                  onError={(e) => (e.currentTarget.src = '/images/placeholder-3x4.png')}
                                />
                              </div>
                              <p className="text-[7pt] mt-1">Foto 3x4</p>
                            </div>
                            <div className="w-[3cm] flex flex-col justify-center">
                              <div className="mx-auto">
                                <QRCodeCanvas value={qrData} size={70} />
                              </div>
                              <p className="text-[7pt] leading-tight text-center mt-1">
                                Dokumen ini dicetak resmi oleh<br />
                                <span className="font-bold">ISBDS CS Cabang Kebumen</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-24 text-slate-400">
                          <span className="material-symbols-outlined text-6xl">description</span>
                          <p className="mt-2">Belum ada sertifikat yang di-generate</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Riwayat Sertifikat */}
              {anggota && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h4 className="font-bold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined">history</span>
                      Riwayat Sertifikat
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="px-4 py-3">No. Sertifikat</th>
                          <th className="px-4 py-3">Sabuk</th>
                          <th className="px-4 py-3">Tanggal Kenaikan</th>
                          <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riwayatSertifikat.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-8 text-slate-400">Belum ada data sertifikat</td></tr>
                        ) : (
                          riwayatSertifikat.map(s => (
                            <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm font-mono">{s.no_sertifikat}</td>
                              <td className="px-4 py-3 text-sm">{s.tingkat}</td>
                              <td className="px-4 py-3 text-sm">{formatTanggalIndo(s.tanggal_kenaikan)}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setGeneratedSertifikat(s);
                                      setSelectedBelt(s.tingkat);
                                      setTanggalKenaikan(s.tanggal_kenaikan);
                                    }}
                                    className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                    title="Tampilkan"
                                  >
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                  </button>
                                  <button
                                    onClick={() => handleUpdateRiwayatFromSertifikat(s)}
                                    disabled={isSaving}
                                    className="text-green-600 hover:bg-green-50 p-1 rounded"
                                    title="Update riwayat sabuk"
                                  >
                                    <span className="material-symbols-outlined text-sm">save</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
