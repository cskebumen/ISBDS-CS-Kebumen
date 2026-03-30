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

    // Menentukan skala berdasarkan jumlah riwayat sabuk
    const jumlahRiwayat = riwayat.length;
    let baseFontSize = '13.5pt';   // default normal
    let lineHeight = 1.3;
    let padding = '5mm 8mm';
    let headerFontSize = '15pt';
    let titleFontSize = '12pt';
    let tableFontSize = '11pt';
    let qrSize = 70;
    let fotoSize = 'w-32 h-40';
    let marginBottom = 2;

    if (jumlahRiwayat > 4 && jumlahRiwayat <= 9) {
      baseFontSize = '11.5pt';
      lineHeight = 1.25;
      padding = '4mm 7mm';
      headerFontSize = '13pt';
      titleFontSize = '11pt';
      tableFontSize = '9.5pt';
      qrSize = 65;
      fotoSize = 'w-30 h-38';
      marginBottom = 1.5;
    } else if (jumlahRiwayat > 9) {
      baseFontSize = '10pt';
      lineHeight = 1.2;
      padding = '4mm 6mm';
      headerFontSize = '11pt';
      titleFontSize = '10pt';
      tableFontSize = '8.5pt';
      qrSize = 60;
      fotoSize = 'w-28 h-36';
      marginBottom = 1;
    }

    return (
      <div
        ref={ref}
        className="bg-white text-black"
        style={{
          width: '210mm',
          height: '297mm',
          padding: padding,
          boxSizing: 'border-box',
          margin: '0 auto',
          fontSize: baseFontSize,
          lineHeight: lineHeight,
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
              <h2 className={`font-bold uppercase leading-tight`} style={{ fontSize: headerFontSize }}>
                Institut Seni Bela Diri Silat
              </h2>
              <h1 className={`font-extrabold uppercase leading-tight`} style={{ fontSize: `calc(${headerFontSize} + 6pt)` }}>
                CIPTA SEJATI
              </h1>
              <h3 className={`font-bold uppercase leading-tight text-blue-800`} style={{ fontSize: `calc(${headerFontSize} - 2pt)` }}>
                CABANG KEBUMEN
              </h3>
              <p className="italic" style={{ fontSize: `calc(${baseFontSize} - 2pt)` }}>
                Alamat: Ds. Tlepok Rt 03/ Rw 01, Kec. Karangsambung, Kab. Kebumen
              </p>
            </div>
            <img src="/images/isbds.png" className="w-16 h-16 object-contain" alt="ISBDS" />
          </div>

          <h4 className="text-center font-bold underline mb-3 uppercase" style={{ fontSize: titleFontSize }}>
            Keterangan Tentang Data Diri Anggota
          </h4>

          {/* DATA DIRI */}
          <div className="space-y-0.5 mb-3 ml-2" style={{ fontSize: `calc(${baseFontSize} - 1pt)` }}>
            <div className="flex"><div className="w-52 font-bold">1. Nama Anggota</div><div>: {data.nama_lengkap || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">2. Nomor Induk Anggota (NIA)</div><div className="font-mono">: {data.nia || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">3. Tempat, Tanggal Lahir</div><div>: {data.tempat_lahir || '-'}, {data.tanggal_lahir || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">4. Jenis Kelamin</div><div>: {data.jenis_kelamin || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">5. Alamat Lengkap</div><div className="flex-1">: {data.alamat_lengkap || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">6. Ranting / Unit</div><div>: {data.ranting || '-'}</div></div>
            <div className="flex"><div className="w-52 font-bold">7. Cabang</div><div>: KEBUMEN</div></div>
            <div className="flex"><div className="w-52 font-bold">8. No. HP / WhatsApp</div><div>: {data.no_hp || '-'}</div></div>
          </div>

          <p className="font-bold mb-1" style={{ fontSize: `calc(${baseFontSize} - 0.5pt)` }}>9. Riwayat Sabuk</p>
          <table className="w-full border-collapse border border-black mb-2" style={{ fontSize: tableFontSize }}>
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
                    <td className="border border-black p-1 text-left px-2 italic font-semibold">{r.tingkat}</td>
                    <td className="border border-black p-1" style={{ fontSize: `calc(${tableFontSize} - 1pt)` }}>{r.no_sertifikat}</td>
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
        <div className={`flex justify-between items-start px-2 ${marginBottom === 2 ? 'mt-2' : marginBottom === 1.5 ? 'mt-1' : 'mt-0'}`}>
          <div className={`border border-black ${fotoSize} flex items-center justify-center bg-gray-50 overflow-hidden shadow-sm`}>
            {data.foto_url ? (
              <img src={data.foto_url} alt="Foto anggota" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[7px] text-gray-400">PAS FOTO 3X4</span>
            )}
          </div>
          <div className="text-center">
            <p style={{ fontSize: `calc(${baseFontSize} - 1pt)` }}>Kebumen, {tanggalCetak}</p>
            <p style={{ fontSize: `calc(${baseFontSize} - 1pt)`, marginBottom: baseFontSize === '13.5pt' ? '2rem' : (baseFontSize === '11.5pt' ? '1.5rem' : '1rem') }}>
              Ketua Cabang ISBDS CS Kebumen,
            </p>
            <p className="font-bold underline" style={{ fontSize: `calc(${baseFontSize} - 0.5pt)` }}>AHMAD TAUFIK</p>
            <p style={{ fontSize: `calc(${baseFontSize} - 2pt)` }}>NIA. 03.06.02.00003</p>
          </div>
        </div>

        {/* FOOTER BARCODE */}
        <div className={`mt-${marginBottom} pt-2 border-t border-gray-200 flex items-center justify-between`}>
          <div>
            <QRCodeSVG
              value={qrData}
              size={qrSize}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "/images/isbds.png",
                height: Math.max(10, qrSize * 0.2),
                width: Math.max(10, qrSize * 0.2),
                excavate: true,
              }}
            />
          </div>
          <p className="text-right leading-tight" style={{ fontSize: `calc(${baseFontSize} - 2pt)` }}>
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
