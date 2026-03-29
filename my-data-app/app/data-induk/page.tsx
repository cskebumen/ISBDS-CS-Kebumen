'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import * as XLSX from 'xlsx';

type Anggota = {
  nia: string;
  nama: string;
  ranting: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  alamat: string;
  noHp: string;
  status: string;
};

// Data awal
const dummyAnggota: Anggota[] = [
  { nia: '03.06.02.000001', nama: 'Imam Nawawi', ranting: 'Kebumen', tempatLahir: 'Kebumen', tanggalLahir: '1990-01-01', jenisKelamin: 'Laki-laki', alamat: 'Jl. Merdeka 1', noHp: '081234567890', status: 'Aktif' },
  { nia: '03.06.02.000002', nama: 'Ahmad Setiawan', ranting: 'Gombong', tempatLahir: 'Gombong', tanggalLahir: '1992-05-10', jenisKelamin: 'Laki-laki', alamat: 'Jl. Sudirman 2', noHp: '081234567891', status: 'Aktif' },
  { nia: '03.06.02.000003', nama: 'Siti Purwanti', ranting: 'Karanganyar', tempatLahir: 'Karanganyar', tanggalLahir: '1995-08-15', jenisKelamin: 'Perempuan', alamat: 'Jl. Diponegoro 3', noHp: '081234567892', status: 'Aktif' },
  { nia: '03.06.02.000004', nama: 'Bambang Riyadi', ranting: 'Kutowinangun', tempatLahir: 'Kutowinangun', tanggalLahir: '1988-12-20', jenisKelamin: 'Laki-laki', alamat: 'Jl. A. Yani 4', noHp: '081234567893', status: 'Aktif' },
  { nia: '03.06.02.000005', nama: 'Dewi Safitri', ranting: 'Prembun', tempatLahir: 'Prembun', tanggalLahir: '1993-03-25', jenisKelamin: 'Perempuan', alamat: 'Jl. Pahlawan 5', noHp: '081234567894', status: 'Aktif' },
  { nia: '03.06.02.000006', nama: 'Rian Kurniawan', ranting: 'Kebumen', tempatLahir: 'Kebumen', tanggalLahir: '1991-07-30', jenisKelamin: 'Laki-laki', alamat: 'Jl. Sisingamangaraja 6', noHp: '081234567895', status: 'Aktif' },
  { nia: '03.06.02.000007', nama: 'Eko Nugroho', ranting: 'Petanahan', tempatLahir: 'Petanahan', tanggalLahir: '1994-09-05', jenisKelamin: 'Laki-laki', alamat: 'Jl. Veteran 7', noHp: '081234567896', status: 'Aktif' },
  { nia: '03.06.02.000008', nama: 'Mulyadi Saputra', ranting: 'Klirong', tempatLahir: 'Klirong', tanggalLahir: '1996-11-10', jenisKelamin: 'Laki-laki', alamat: 'Jl. Gajah Mada 8', noHp: '081234567897', status: 'Aktif' },
];

type RiwayatSabuk = {
  tingkat: string;
  noSertifikat: string;
  tahun: string;
};

export default function DataIndukPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [anggota, setAnggota] = useState<Anggota[]>(dummyAnggota);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);
  const [riwayatSabuk, setRiwayatSabuk] = useState<RiwayatSabuk[]>([{ tingkat: '', noSertifikat: '', tahun: '' }]);
  
  // Form state
  const [formData, setFormData] = useState<Anggota>({
    nia: '', nama: '', ranting: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'Laki-laki', alamat: '', noHp: '', status: 'Aktif'
  });

  const filteredAnggota = anggota.filter(item =>
    item.nia.includes(searchTerm) ||
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ranting.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (nia: string) => {
    if (confirm('Yakin hapus data ini?')) setAnggota(anggota.filter(a => a.nia !== nia));
  };

  const handleEdit = (item: Anggota) => {
    setEditingAnggota(item);
    setFormData(item);
    setShowTambahModal(true);
  };

  const handleSave = () => {
    if (editingAnggota) {
      setAnggota(anggota.map(a => a.nia === editingAnggota.nia ? formData : a));
    } else {
      if (anggota.find(a => a.nia === formData.nia)) {
        alert('NIA sudah ada!');
        return;
      }
      setAnggota([...anggota, formData]);
    }
    setShowTambahModal(false);
    setEditingAnggota(null);
    setFormData({ nia: '', nama: '', ranting: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'Laki-laki', alamat: '', noHp: '', status: 'Aktif' });
    setRiwayatSabuk([{ tingkat: '', noSertifikat: '', tahun: '' }]);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(anggota.map(({ nia, nama, ranting, tempatLahir, tanggalLahir, jenisKelamin, alamat, noHp, status }) => ({
      NIA: nia, 'Nama Lengkap': nama, Ranting: ranting, 'Tempat Lahir': tempatLahir, 'Tanggal Lahir': tanggalLahir, 'Jenis Kelamin': jenisKelamin, Alamat: alamat, 'No HP': noHp, Status: status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Induk');
    XLSX.writeFile(workbook, `data_induk_${new Date().toISOString().slice(0,19)}.xlsx`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      const newAnggota: Anggota[] = rows.map(row => ({
        nia: row.NIA || row.nia || '',
        nama: row['Nama Lengkap'] || row.nama || '',
        ranting: row.Ranting || row.ranting || '',
        tempatLahir: row['Tempat Lahir'] || row.tempatLahir || '',
        tanggalLahir: row['Tanggal Lahir'] || row.tanggalLahir || '',
        jenisKelamin: row['Jenis Kelamin'] || row.jenisKelamin || 'Laki-laki',
        alamat: row.Alamat || row.alamat || '',
        noHp: row['No HP'] || row.noHp || '',
        status: row.Status || row.status || 'Aktif'
      }));
      setAnggota(prev => [...prev, ...newAnggota.filter(a => !prev.find(p => p.nia === a.nia))]);
      alert(`Berhasil import ${newAnggota.length} data`);
    };
    reader.readAsBinaryString(file);
    setShowImportModal(false);
  };

  const downloadTemplate = () => {
    const template = [{
      NIA: '03.06.02.000XXX', 'Nama Lengkap': 'Contoh Nama', Ranting: 'Kebumen', 'Tempat Lahir': 'Kebumen', 'Tanggal Lahir': '1990-01-01', 'Jenis Kelamin': 'Laki-laki', Alamat: 'Jl. Contoh No.1', 'No HP': '081234567890', Status: 'Aktif'
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_data_induk.xlsx');
  };

  const addRiwayatField = () => setRiwayatSabuk([...riwayatSabuk, { tingkat: '', noSertifikat: '', tahun: '' }]);
  const removeRiwayatField = (idx: number) => setRiwayatSabuk(riwayatSabuk.filter((_, i) => i !== idx));
  const updateRiwayat = (idx: number, field: keyof RiwayatSabuk, value: string) => {
    const newRiwayat = [...riwayatSabuk];
    newRiwayat[idx][field] = value;
    setRiwayatSabuk(newRiwayat);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col bg-surface pb-24">
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-3 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-blue-900"><span className="material-symbols-outlined">menu</span></button>
            <div className="relative"><span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><span className="material-symbols-outlined text-sm">search</span></span><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm w-48 md:w-64 focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Cari data anggota..." /></div>
          </div>
<div className="flex items-center gap-3 pl-4 border-l border-slate-100">
  <div className="text-right">
    <p className="text-xs font-bold">Budi Santoso</p>
    <p className="text-[10px] text-slate-500">Admin Cabang</p>
  </div>
  <ProfilePopup />
</div>
 </header>
        <div className="pt-20 px-4 md:px-8 pb-12 flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"><div><h2 className="text-2xl font-extrabold text-primary">Data Induk</h2><p className="text-sm text-gray-500">Kelola data seluruh anggota aktif dan non-aktif Cabang Kebumen.</p></div><div className="flex gap-3"><button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-semibold text-sm"><span className="material-symbols-outlined text-lg">download</span>Export to Excel</button><button onClick={() => { setEditingAnggota(null); setFormData({ nia: '', nama: '', ranting: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: 'Laki-laki', alamat: '', noHp: '', status: 'Aktif' }); setShowTambahModal(true); }} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-xl font-bold text-sm"><span className="material-symbols-outlined text-lg">add</span>Tambah Anggota</button></div></div>
          <div className="bg-blue-50 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600"><span className="material-symbols-outlined text-3xl">upload_file</span></div><div><h4 className="font-bold text-blue-800">Butuh menginput data induk anggota secara masal?</h4><p className="text-sm text-blue-700/70">Gunakan fitur import excel untuk mempercepat proses entri data ribuan anggota sekaligus.</p></div></div><button onClick={() => setShowImportModal(true)} className="px-6 py-2 bg-white text-blue-600 border border-blue-200 rounded-xl font-bold text-sm">Import Data</button></div>
          <div className="bg-white rounded-2xl overflow-hidden shadow border border-slate-100"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-gray-50 border-b"><th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">NIA</th><th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Nama Lengkap</th><th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Ranting</th><th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Aksi</th></tr></thead><tbody>{filteredAnggota.map(item => (<tr key={item.nia} className="hover:bg-gray-50 border-b"><td className="px-6 py-4 text-sm font-medium">{item.nia}</td><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{item.nama.charAt(0)}</div><span className="text-sm font-semibold">{item.nama}</span></div></td><td className="px-6 py-4 text-sm text-gray-500">{item.ranting}</td><td className="px-6 py-4"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(item)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"><span className="material-symbols-outlined text-lg">edit</span></button><button onClick={() => handleDelete(item.nia)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-lg">delete</span></button></div></td></tr>))}</tbody></table></div><div className="px-6 py-5 bg-gray-50 flex justify-between items-center"><p className="text-xs text-slate-500">Menampilkan {filteredAnggota.length} dari {anggota.length} data</p><div className="flex gap-2"><button className="px-4 py-2 bg-white border rounded-lg text-xs">Sebelumnya</button><button className="px-4 py-2 bg-white border rounded-lg text-xs">Selanjutnya</button></div></div></div>
        </div>
        <Footer />
      </main>

      {/* Modal Tambah/Edit */}
      {showTambahModal && (<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"><div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"><div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center"><div><h3 className="text-xl font-extrabold text-blue-800">{editingAnggota ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h3><p className="text-sm text-gray-500">Lengkapi data personal dan riwayat sabuk</p></div><button onClick={() => setShowTambahModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">close</span></button></div><div className="p-6"><form className="space-y-8" onSubmit={e => { e.preventDefault(); handleSave(); }}><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><div className="md:col-span-1"><label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Foto Anggota</label><div className="aspect-[3/4] rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4"><span className="material-symbols-outlined text-4xl text-gray-300 mb-2">add_a_photo</span><p className="text-xs text-gray-400">Klik upload</p></div></div><div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"><div className="md:col-span-2"><label className="text-xs font-bold uppercase text-slate-500">Nama Lengkap</label><input type="text" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm" required /></div><div><label>Tempat Lahir</label><input type="text" value={formData.tempatLahir} onChange={e => setFormData({ ...formData, tempatLahir: e.target.value })} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm" /></div><div><label>Tanggal Lahir</label><input type="date" value={formData.tanggalLahir} onChange={e => setFormData({ ...formData, tanggalLahir: e.target.value })} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm" /></div><div><label>Jenis Kelamin</label><select value={formData.jenisKelamin} onChange={e => setFormData({ ...formData, jenisKelamin: e.target.value })} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm"><option>Laki-laki</option><option>Perempuan</option></select></div><div><label>No HP/WA</label><input type="tel" value={formData.noHp} onChange={e => setFormData({ ...formData, noHp: e.target.value })} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm" /></div></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="md:col-span-3"><label>Alamat Lengkap</label><textarea rows={2} value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm"></textarea></div><div><label>Ranting</label><input type="text" value={formData.ranting} onChange={e => setFormData({ ...formData, ranting: e.target.value })} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm" /></div><div><label>Cabang</label><input type="text" disabled value="Kebumen" className="w-full bg-gray-200 rounded-xl px-4 py-3 text-sm" /></div><div><label>Status Aktif</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm"><option>Aktif</option><option>Cuti/Mangkir</option><option>Alumni</option></select></div><div className="md:col-span-2"><label>NIA</label><input type="text" value={formData.nia} onChange={e => setFormData({ ...formData, nia: e.target.value })} className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm" required disabled={!!editingAnggota} /></div></div><div className="pt-6 border-t"><div className="flex justify-between items-center mb-4"><h4 className="font-bold">Riwayat Sabuk</h4><button type="button" onClick={addRiwayatField} className="text-xs text-blue-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">add_circle</span>Tambah Riwayat</button></div>{riwayatSabuk.map((item, idx) => (<div key={idx} className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-xl"><input placeholder="Tingkat Sabuk" value={item.tingkat} onChange={e => updateRiwayat(idx, 'tingkat', e.target.value)} className="bg-white border rounded-lg px-3 py-2 text-sm" /><input placeholder="No Sertifikat" value={item.noSertifikat} onChange={e => updateRiwayat(idx, 'noSertifikat', e.target.value)} className="bg-white border rounded-lg px-3 py-2 text-sm" /><div className="flex gap-2"><input placeholder="Tahun" value={item.tahun} onChange={e => updateRiwayat(idx, 'tahun', e.target.value)} className="bg-white border rounded-lg px-3 py-2 text-sm w-full" /><button type="button" onClick={() => removeRiwayatField(idx)} className="text-red-500"><span className="material-symbols-outlined">delete</span></button></div></div>))}</div><div className="flex justify-end gap-3 pt-6"><button type="button" onClick={() => setShowTambahModal(false)} className="px-6 py-2 bg-gray-200 rounded-xl font-bold">Batal</button><button type="submit" className="px-8 py-2 bg-blue-700 text-white rounded-xl font-bold">Simpan</button></div></form></div></div></div>)}

      {/* Modal Import */}
      {showImportModal && (<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-lg rounded-3xl p-8"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-extrabold text-blue-800">Import Data Induk</h3><button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">close</span></button></div><div className="space-y-6"><div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center cursor-pointer" onClick={() => document.getElementById('fileInput')?.click()}><div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-3xl">upload_file</span></div><p className="font-bold">Pilih File Excel</p><p className="text-xs text-gray-500">.xls atau .xlsx</p><input id="fileInput" type="file" accept=".xls,.xlsx" className="hidden" onChange={handleImport} /></div><div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl"><div className="flex items-center gap-3"><span className="material-symbols-outlined text-blue-600">info</span><p className="text-xs font-medium">Belum punya format file?</p></div><button onClick={downloadTemplate} className="text-xs font-bold text-blue-700 underline">Download Template</button></div><div className="flex gap-3"><button onClick={() => setShowImportModal(false)} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold">Batal</button></div></div></div></div>)}
    </div>
  );
}
