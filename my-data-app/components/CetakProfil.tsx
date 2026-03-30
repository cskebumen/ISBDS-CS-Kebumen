import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

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
    const qrData = `${data.nia}-${data.nama_lengkap}-${data.tempat_lahir || ''}, ${data.tanggal_lahir || ''}-ISBDSCSKBM`;

    return (
      <div
        ref={ref}
        className="bg-white text-black"
        style={{
          width: '210mm',
          height: '297mm', // fixed height A4
          padding: '5mm 8mm',
          boxSizing: 'border-box',
          margin: '0 auto',
          fontSize: '11pt',
          lineHeight: '1.3',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* KOP SURAT */}
          <div className="flex justify-between items-center border-b-4 border-double border-black pb-1 mb-3">
            <img src="/images/ipsi.png" className="w-16 h-16 object-contain" alt="IPSI" />
            <div className="text-center flex-grow px-2">
              <h2 className="font-bold uppercase text-[13pt] leading-tight">Institut Seni Bela Diri Silat</h2>
              <h1 className="font-extrabold uppercase text-[18pt] leading-tight">CIPTA SEJATI</h1>
              <h3 className="font-bold uppercase text-[11pt] leading-tight text-blue-800">CABANG KEBUMEN</h3>
              <p className="italic text-[10pt]">Alamat: Ds. Tlepok Rt 03/ Rw 01, Kec. Karangsambung, Kab. Kebumen</p>
            </div>
            <img src="/images/isbds.png" className="w-16 h-16 object-contain" alt="ISBDS" />
          </div>

          <h4 className="text-center font-bold underline mb-3 uppercase text-[12pt]">
            Keterangan Tentang Data Diri Anggota
          </h4>

          {/* DATA DIRI */}
          <div className="space-y-0.5 text-[10.5pt] mb-3 ml-2">
            <div className="flex"><div className="w-52 font-bold">1. Nama Anggota</div><div>: {data.nama_lengkap || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">2. Nomor Induk Anggota (NIA)</div><div className="font-mono">: {data.nia || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">3. Tempat, Tanggal Lahir</div><div>: {data.tempat_lahir || '-'}, {data.tanggal_lahir || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">4. Jenis Kelamin</div><div>: {data.jenis_kelamin || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">5. Alamat Lengkap</div><div className="flex-1">: {data.alamat_lengkap || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">6. Ranting / Unit</div><div>: {data.ranting || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">7. Cabang</div><div>: KEBUMEN</div></div>
            <div className="flex"><div className="w-52 font-bold">8. No. HP / WhatsApp</div><div>: {data.no_hp || '-'}</div></div>
          </div>

          <p className="font-bold text-[10pt] mb-1">9. Riwayat Sabuk</p>
          <table className="w-full border-collapse border border-black text-[9.5pt] mb-2">
            <thead className="bg-gray-100 uppercase font-bold text-center">
              <tr>
                <th className="border border-black p-1 w-8">No</th>
                <th className="border border-black p-1">Tingkat Sabuk</th>
                <th className="border border-black p-1">No. Sertifikat</th>
                <th className="border border-black p-1 w-20">Tahun</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? (
                riwayat.map((r, i) => (
                  <tr key={i} className="text-center">
                    <td className="border border-black p-1">{i + 1}</td>
                    <td className="border border-black p-1 text-left px-2  font-semibold">{r.tingkat}</td>
                    <td className="border border-black p-1 text-[9pt]">{r.no_sertifikat}</td>
                    <td className="border border-black p-1">{r.tahun}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-black p-2 text-center italic text-gray-500">Data riwayat belum tersedia</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TANDA TANGAN dan QR - akan menempel di bawah karena flex column */}
        <div className="flex justify-between items-start px-2 mt-2">
          <div className="border border-black w-28 h-36 flex items-center justify-center bg-gray-50 overflow-hidden shadow-sm">
            {data.foto_url ? (
              <img src={data.foto_url} alt="Foto anggota" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[8px] text-gray-400">PAS FOTO 3X4</span>
            )}
          </div>
          <div className="text-center">
            <p className="text-[9pt]">Kebumen, {tanggalCetak}</p>
            <p className="text-[9pt] mb-12">Ketua Cabang ISBDS CS Kebumen,</p>
            <p className="font-bold underline text-[9pt] uppercase">AHMAD TAUFIK</p>
            <p className="text-[8pt]">NIA. 03.06.02.000003</p>
          </div>
        </div>

        {/* FOOTER BARCODE */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
          <div>
            <QRCodeSVG 
              value={qrData}
              size={60}
              level={"H"}
              includeMargin={false}
              imageSettings={{
                src: "/images/isbds.png",
                height: 12,
                width: 12,
                excavate: true,
              }}
            />
          </div>
          <p className="text-[7px] text-gray-400 text-right leading-tight">
            Dokumen ini dicetak secara otomatis oleh
            <br />
            <span className="font-bold uppercase">ISBDS Cipta Sejati Cabang Kebumen</span>
          </p>
        </div>
      </div>
    );
  }
);

CetakProfil.displayName = 'CetakProfil';
