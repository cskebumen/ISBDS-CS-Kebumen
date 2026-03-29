'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode.react';

// Tipe data
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

type RiwayatSabuk = {
  tingkat: string;
  no_sertifikat: string;
  tahun: number;
};

export default function CetakProfilPage() {
  const params = useParams();
  const nia = params.nia as string;
  const [anggota, setAnggota] = useState<Anggota | null>(null);
  const [riwayat, setRiwayat] = useState<RiwayatSabuk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ganti dengan fetch dari Supabase
    setTimeout(() => {
      setAnggota({
        nia: nia,
        nama_lengkap: 'Bambang Wijaya Kusuma',
        tempat_lahir: 'Kebumen',
        tanggal_lahir: '14 Mei 1995',
        jenis_kelamin: 'Laki-laki',
        alamat_lengkap: 'Jl. Pahlawan No. 45, Kedungwinangun, Klirong, Kebumen',
        ranting: 'Klirong',
        cabang: 'Kebumen',
        no_hp: '+62 812-3456-7890',
        status: 'Aktif',
        terdaftar_sejak: '12 Januari 2018',
        sabuk_terakhir: 'Biru',
        foto_url: '/images/placeholder-3x4.png'
      });
      setRiwayat([
        { tingkat: 'Biru', no_sertifikat: '2022/ISBDS/CERT/089', tahun: 2022 },
        { tingkat: 'Hijau', no_sertifikat: '2020/ISBDS/CERT/112', tahun: 2020 },
        { tingkat: 'Kuning', no_sertifikat: '2018/ISBDS/CERT/204', tahun: 2018 }
      ]);
      setLoading(false);
    }, 300);
  }, [nia]);

  useEffect(() => {
    // Setelah data siap, trigger print otomatis (opsional)
    if (!loading && anggota) {
      // window.print();
    }
  }, [loading, anggota]);

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!anggota) return <div className="p-8 text-center">Data tidak ditemukan</div>;

  const today = new Date();
  const tanggalCetak = today.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  // Data untuk QR Code (isi sesuai kebutuhan)
  const qrData = `${anggota.nia}-${anggota.nama_lengkap}-${anggota.tempat_lahir}, ${anggota.tanggal_lahir}-ISBDSCSKBM-${anggota.sabuk_terakhir}`;

  return (
    <div className="bg-white p-8 min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-4xl mx-auto bg-white shadow-lg p-8">
        {/* Kop */}
        <div className="flex justify-between items-center border-b-4 border-double border-black pb-2 mb-4">
          <img src="/images/ipsi.png" className="h-16 w-auto" alt="IPSI" />
          <div className="text-center flex-grow px-2">
            <h2 className="font-bold uppercase leading-tight text-[14pt] m-0">Institut Seni Bela Diri Silat</h2>
            <h1 className="font-extrabold uppercase leading-tight text-[20pt] m-0">CIPTA SEJATI</h1>
            <h3 className="font-bold uppercase leading-tight text-[12pt] text-blue-700 m-0">CABANG KEBUMEN</h3>
            <p className="italic text-[8.5pt] m-0">Alamat: Ds. Tlepok Rt 03/ Rw 01, Kec. Karangsambung, Kab. Kebumen</p>
          </div>
          <img src="/images/isbds.png" className="h-16 w-auto" alt="ISBDS" />
        </div>

        <h4 className="text-center font-bold underline mb-6 uppercase text-[12pt]">Keterangan Tentang Data Diri Anggota</h4>

        <div className="space-y-1 text-sm mb-6">
          <div className="flex"><div className="w-48 font-bold">1. Nama Anggota</div><div>: {anggota.nama_lengkap}</div></div>
          <div className="flex"><div className="w-48 font-bold">2. Nomor Induk Anggota (NIA)</div><div>: {anggota.nia}</div></div>
          <div className="flex"><div className="w-48 font-bold">3. Tempat, Tanggal Lahir</div><div>: {anggota.tempat_lahir}, {anggota.tanggal_lahir}</div></div>
          <div className="flex"><div className="w-48 font-bold">4. Jenis Kelamin</div><div>: {anggota.jenis_kelamin}</div></div>
          <div className="flex"><div className="w-48 font-bold">5. Alamat</div><div>: {anggota.alamat_lengkap}</div></div>
          <div className="flex"><div className="w-48 font-bold">6. Ranting</div><div>: {anggota.ranting}</div></div>
          <div className="flex"><div className="w-48 font-bold">7. Cabang</div><div>: {anggota.cabang}</div></div>
          <div className="flex"><div className="w-48 font-bold">8. No. HP / WA</div><div>: {anggota.no_hp}</div></div>
        </div>

        <p className="font-bold text-sm mb-2 mt-4">9. Riwayat Sabuk</p>
        <table className="w-full border-collapse border border-black text-sm mb-10">
          <thead className="bg-gray-100 uppercase text-center font-bold">
            <tr>
              <th className="border border-black p-2 w-12">No</th>
              <th className="border border-black p-2">Tingkat Sabuk</th>
              <th className="border border-black p-2">No. Sertifikat</th>
              <th className="border border-black p-2 w-24">Tahun</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.map((item, idx) => (
              <tr key={idx} className="text-center">
                <td className="border border-black p-1">{idx + 1}</td>
                <td className="border border-black p-1 text-left px-2">{item.tingkat}</td>
                <td className="border border-black p-1">{item.no_sertifikat}</td>
                <td className="border border-black p-1">{item.tahun}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-start mt-10 px-10">
          <div className="border border-black w-32 h-40 flex items-center justify-center relative overflow-hidden bg-gray-50">
            <img src={anggota.foto_url} className="w-full h-full object-cover" alt="Foto" />
          </div>
          <div className="text-center">
            <p className="text-sm">Kebumen, {tanggalCetak}</p>
            <p className="text-sm mb-20">Ketua Cabang ISBDS CS Kebumen,</p>
            <p className="font-bold underline text-sm">AHMAD TAUFIK</p>
            <p className="text-xs">NIA. 03.06.02.00003</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 flex items-center">
          <div className="w-1/2">
            <QRCode value={qrData} size={100} />
          </div>
          <div className="w-1/2 text-xs text-center">
            Dokumen ini resmi dicetak oleh<br />
            <span className="font-bold">ISBDS CIPTA SEJATI Cabang Kebumen</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Cetak / Simpan PDF
          </button>
        </div>
      </div>
    </div>
  );
}
