import React from 'react';
import Barcode from 'react-barcode';

interface Riwayat {
  tingkat: string;
  no_sertifikat: string;
  tahun: string;
}

interface CetakProfilProps {
  data: any;
  riwayat: Riwayat[];
}

export const CetakProfil = React.forwardRef<HTMLDivElement, CetakProfilProps>(
  ({ data, riwayat }, ref) => {
    const tanggalCetak = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return (
      <div
        ref={ref}
        className="bg-white text-black font-serif p-12"
        style={{
          width: '210mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
          margin: '0 auto',
        }}
      >
        {/* KOP SURAT */}
        <div className="flex justify-between items-center border-b-4 border-double border-black pb-2 mb-6">
          <img src="/images/ipsi.png" className="w-20 h-20 object-contain" alt="IPSI" />

          <div className="text-center flex-grow px-4">
            <h2 className="font-bold uppercase text-[14pt] leading-tight">
              Institut Seni Bela Diri Silat
            </h2>
            <h1 className="font-extrabold uppercase text-[20pt] leading-tight">
              CIPTA SEJATI
            </h1>
            <h3 className="font-bold uppercase text-[12pt] leading-tight text-blue-800">
              CABANG KEBUMEN
            </h3>
            <p className="italic text-[8.5pt]">
              Alamat: Ds. Tlepok Rt 03/ Rw 01, Kec. Karangsambung, Kab. Kebumen
            </p>
          </div>

          <img src="/images/isbds.png" className="w-20 h-20 object-contain" alt="ISBDS" />
        </div>

        <h4 className="text-center font-bold underline mb-8 uppercase text-[12pt]">
          Keterangan Tentang Data Diri Anggota
        </h4>

        {/* DATA DIRI */}
        <div className="space-y-2 text-sm mb-8 ml-4">
          <div className="flex">
            <div className="w-64 font-bold">1. Nama Anggota</div>
            <div>: {data.nama_lengkap || '-'}</div>
          </div>
          <div className="flex">
            <div className="w-64 font-bold">2. Nomor Induk Anggota (NIA)</div>
            <div className="font-mono">: {data.nia || '-'}</div>
          </div>
          <div className="flex">
            <div className="w-64 font-bold">3. Tempat, Tanggal Lahir</div>
            <div>
              : {data.tempat_lahir || '-'}, {data.tanggal_lahir || '-'}
            </div>
          </div>
          <div className="flex">
            <div className="w-64 font-bold">4. Jenis Kelamin</div>
            <div>: {data.jenis_kelamin || '-'}</div>
          </div>
          <div className="flex">
            <div className="w-64 font-bold">5. Alamat Lengkap</div>
            <div className="flex-1">: {data.alamat_lengkap || '-'}</div>
          </div>
          <div className="flex">
            <div className="w-64 font-bold">6. Ranting / Unit</div>
            <div>: {data.ranting || '-'}</div>
          </div>
          <div className="flex">
            <div className="w-64 font-bold">7. Cabang</div>
            <div>: KEBUMEN</div>
          </div>
          <div className="flex">
            <div className="w-64 font-bold">8. No. HP / WhatsApp</div>
            <div>: {data.no_hp || '-'}</div>
          </div>
        </div>

        <p className="font-bold text-sm mb-2">9. Riwayat Sabuk</p>
        <table className="w-full border-collapse border border-black text-sm mb-12">
          <thead className="bg-gray-100 uppercase font-bold text-center">
            <tr>
              <th className="border border-black p-2 w-12">No</th>
              <th className="border border-black p-2">Tingkat Sabuk</th>
              <th className="border border-black p-2">No. Sertifikat</th>
              <th className="border border-black p-2 w-24">Tahun</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length > 0 ? (
              riwayat.map((r, i) => (
                <tr key={i} className="text-center">
                  <td className="border border-black p-2">{i + 1}</td>
                  <td className="border border-black p-2 text-left px-4 italic font-semibold">
                    {r.tingkat}
                  </td>
                  <td className="border border-black p-2">{r.no_sertifikat}</td>
                  <td className="border border-black p-2">{r.tahun}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-black p-4 text-center italic text-gray-500">
                  Data riwayat belum tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* TANDA TANGAN */}
        <div className="flex justify-between items-start px-10">
          <div className="border border-black w-32 h-40 flex items-center justify-center bg-gray-50 overflow-hidden shadow-sm">
            {data.foto_url ? (
              <img src={data.foto_url} alt="Foto anggota" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[8px] text-gray-400">PAS FOTO 3X4</span>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm">Kebumen, {tanggalCetak}</p>
            <p className="text-sm mb-24">Ketua Cabang ISBDS CS Kebumen,</p>
            <p className="font-bold underline text-sm uppercase">AHMAD TAUFIK</p>
            <p className="text-xs">NIA. 03.06.02.00003</p>
          </div>
        </div>

        {/* FOOTER BARCODE */}
<div className="mt-16 pt-4 border-t border-gray-200 flex items-center justify-between">
  <div className="scale-75 origin-left">
    {/* Menggunakan format data gabungan */}
    <Barcode 
      value={`${data.nia}-${data.nama_lengkap}-${data.tempat_lahir || ''}, ${data.tanggal_lahir || ''}-ISBDSCSKBM`} 
      format="CODE128"
      height={50} 
      width={1}
      fontSize={10} 
      margin={0} 
      displayValue={true}
    />
</div>
          <p className="text-[9px] text-gray-400 text-right leading-tight">
            Dokumen ini dihasilkan secara otomatis oleh
            <br />
            <span className="font-bold uppercase">SIM ISBDS Cipta Sejati Cabang Kebumen</span>
          </p>
        </div>
      </div>
    );
  }
);

CetakProfil.displayName = 'CetakProfil';
