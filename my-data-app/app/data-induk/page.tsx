'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import Link from 'next/link';
import * as XLSX from 'xlsx';

// --- Types ---
type RiwayatSabuk = {
  tingkat: string;
  no_sertifikat: string;
  tahun: string | number;
};

type Anggota = {
  id?: string;
  nia: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat_lengkap: string;
  ranting: string;
  cabang: string;
  no_hp: string;
  status_anggota: string;
  foto_url?: string;
};

export default function DataIndukPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);

  const listSabuk = [
    'Kuning', 'Hijau', 'Biru', 'Cokelat', 
    'Hitam 1', 'Hitam 2', 'Hitam 3', 'Hitam 4',
    'Merah 1', 'Merah 2', 'Merah 3', 'Merah 4'
  ];

  const [formData, setFormData] = useState<Partial<Anggota>>({
    nama_lengkap: '', ranting: '', cabang: 'Kebumen', tempat_lahir: '', tanggal_lahir: '', 
    jenis_kelamin: 'Laki-laki', alamat_lengkap: '', no_hp: '', status_anggota: 'Aktif'
  });
  
  const [riwayatFields, setRiwayatFields] = useState<RiwayatSabuk[]>([{ tingkat: '', no_sertifikat: '', tahun: '' }]);

  useEffect(() => { fetchAnggota(); }, []);

  const fetchAnggota = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('anggota').select('*').order('created_at', { ascending: false });
    if (!error && data) setAnggota(data);
    setLoading(false);
  };

  // --- Fitur Excel (Export/Import/Template) ---
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(anggota.map(a => ({
      NIA: a.nia, 'Nama Lengkap': a.nama_lengkap, Ranting: a.ranting, Cabang: a.cabang, Status: a.status_anggota, 'No HP': a.no_hp
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Induk');
    XLSX.writeFile(workbook, `data_induk_isbds_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const downloadTemplate = () => {
    const template = [{
      NIA: '03.06.02.XXXXXX', 'Nama Lengkap': 'Nama Anggota', Ranting: 'Kebumen', 'Tempat Lahir': 'Kebumen', 'Tanggal Lahir': '1990-01-01', 'Jenis Kelamin': 'Laki-laki', 'Alamat Lengkap': 'Alamat...', 'No HP': '0812...', 'Status Anggota': 'Aktif'
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_import_isbds.xlsx');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(ws);
      
      const formattedData = data.map(row => ({
        nia: row.NIA || '',
        nama_lengkap: row['Nama Lengkap'] || '',
        ranting: row.Ranting || '',
        cabang: 'Kebumen',
        status_anggota: row['Status Anggota'] || 'Aktif',
        no_hp: row['No HP'] || ''
      }));

      const { error } = await supabase.from('anggota').insert(formattedData);
      if (error) alert("Gagal import: " + error.message);
      else {
        alert(`Berhasil import ${data.length} data`);
        fetchAnggota();
      }
      setShowImportModal(false);
    };
    reader.readAsBinaryString(file);
  };

  // --- CRUD Logic ---
  const generateNextNIA = async () => {
    const { data } = await supabase.from('anggota').select('nia').like('nia', '03.06.02.%').order('nia', { ascending: false }).limit(1);
    const prefix = "03.06.02.";
    if (data && data.length > 0) {
      const lastNum = parseInt(data[0].nia.split('.').pop() || '0');
      return prefix + (lastNum + 1).toString().padStart(6, '0');
    }
    return prefix + "000001";
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Hapus data ${nama}?`)) {
      await supabase.from('riwayat_sabuk').delete().eq('anggota_id', id);
      const { error } = await supabase.from('anggota').delete().eq('id', id);
      if (!error) fetchAnggota();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let anggotaId = editingAnggota?.id;
      if (editingAnggota) {
        await supabase.from('anggota').update(formData).eq('id', anggotaId);
      } else {
        const newNia = await generateNextNIA();
        const { data } = await supabase.from('anggota').insert([{ ...formData, nia: newNia }]).select().single();
        anggotaId = data.id;
      }
      if (anggotaId) {
        await supabase.from('riwayat_sabuk').delete().eq('anggota_id', anggotaId);
        const riwayatData = riwayatFields.filter(r => r.tingkat !== '').map(r => ({
          anggota_id: anggotaId, tingkat: r.tingkat, no_sertifikat: r.no_sertifikat, tahun: parseInt(r.tahun.toString()) || null
        }));
        if (riwayatData.length > 0) await supabase.from('riwayat_sabuk').insert(riwayatData);
      }
      setShowTambahModal(false);
      fetchAnggota();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally { setIsSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-poppins">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col pb-20">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/90 backdrop-blur-md flex justify-between items-center px-4 py-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600">
                <span className="material-symbols-outlined">menu</span>
            </button>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-100 rounded-full pl-4 pr-4 py-1.5 text-[11px] w-40 outline-none border border-transparent focus:border-primary/30" placeholder="Cari nama..." />
          </div>
          <ProfilePopup />
        </header>

        <div className="pt-16 px-4 flex-1">
          {/* Action Bar */}
          <div className="flex justify-between items-center my-4">
            <div>
                <h2 className="text-lg font-black text-primary uppercase leading-tight">Data Induk</h2>
                <p className="text-[10px] text-slate-400 hidden md:block">Kelola basis data anggota organisasi</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={exportToExcel} className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-200"><span className="material-symbols-outlined text-sm">download</span></button>
              <button onClick={() => setShowImportModal(true)} className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200"><span className="material-symbols-outlined text-sm">upload_file</span></button>
              <button onClick={() => { setEditingAnggota(null); setShowTambahModal(true); }} className="px-3 py-2 bg-blue-700 text-white rounded-xl font-bold text-[10px] shadow-md">+ ANGGOTA</button>
            </div>
          </div>

          {/* Table Container - Mobile Optimized */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase">Info Anggota</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-slate-500 uppercase text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan={2} className="py-10 text-center text-[11px] text-slate-400">Memuat basis data...</td></tr>
                ) : anggota.filter(a => a.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-800 uppercase line-clamp-1">{item.nama_lengkap}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-slate-400">{item.nia}</span>
                            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1 rounded">{item.ranting}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center items-center gap-1.5">
                        <Link href={`/profil/${item.nia}`} className="p-1 text-blue-500 bg-blue-50 rounded-md"><span className="material-symbols-outlined text-[18px]">visibility</span></Link>
                        <button onClick={async () => { 
                            setEditingAnggota(item); 
                            setFormData(item); 
                            const { data } = await supabase.from('riwayat_sabuk').select('*').eq('anggota_id', item.id); 
                            setRiwayatFields(data && data.length > 0 ? data : [{ tingkat: '', no_sertifikat: '', tahun: '' }]); 
                            setShowTambahModal(true); 
                        }} className="p-1 text-amber-500 bg-amber-50 rounded-md"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button onClick={() => handleDelete(item.id!, item.nama_lengkap)} className="p-1 text-red-500 bg-red-50 rounded-md"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </main>

      {/* Modal Form Tambah/Edit */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-20">
              <h3 className="font-black text-primary uppercase text-[11px]">{editingAnggota ? 'Edit Data' : 'Tambah Anggota'}</h3>
              <button onClick={() => setShowTambahModal(false)} className="material-symbols-outlined text-xl text-slate-400">close</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                  <input required value={formData.nama_lengkap} onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} className="w-full bg-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none border focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Ranting</label>
                  <input required value={formData.ranting} onChange={e => setFormData({...formData, ranting: e.target.value})} className="w-full bg-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none border transition-all" />
                </div>
                <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">WA / No HP</label>
                    <input value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} className="w-full bg-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none border" placeholder="08..." />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Cabang</label>
                  <input value={formData.cabang} disabled className="w-full bg-slate-100 rounded-lg px-3 py-2.5 text-xs text-slate-400 border border-slate-200" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Alamat Lengkap</label>
                <textarea value={formData.alamat_lengkap} onChange={e => setFormData({...formData, alamat_lengkap: e.target.value})} className="w-full bg-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none border" rows={2} />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-[10px] text-primary uppercase">Riwayat Sabuk</h4>
                  <button type="button" onClick={() => setRiwayatFields([...riwayatFields, { tingkat: '', no_sertifikat: '', tahun: '' }])} className="text-[9px] font-bold text-blue-600">+ TAMBAH BARIS</button>
                </div>
                {riwayatFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <select value={field.tingkat} onChange={e => { const u = [...riwayatFields]; u[idx].tingkat = e.target.value; setRiwayatFields(u); }} className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px]">
                      <option value="">Pilih Sabuk</option>
                      {listSabuk.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="No Sert" value={field.no_sertifikat} onChange={e => { const u = [...riwayatFields]; u[idx].no_sertifikat = e.target.value; setRiwayatFields(u); }} className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px]" />
                    <input type="number" placeholder="Tahun" value={field.tahun} onChange={e => { const u = [...riwayatFields]; u[idx].tahun = e.target.value; setRiwayatFields(u); }} className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px]" />
                    <button type="button" onClick={() => setRiwayatFields(riwayatFields.filter((_, i) => i !== idx))} className="text-red-500 material-symbols-outlined text-[18px]">close</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowTambahModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-[10px] text-slate-500 uppercase">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold text-[10px] shadow-lg active:scale-95 transition-all uppercase">
                  {isSaving ? 'Memproses...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="font-black text-primary text-sm uppercase mb-4">Import Data Excel</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => document.getElementById('fileImport')?.click()}>
                <span className="material-symbols-outlined text-4xl text-slate-300">cloud_upload</span>
                <p className="text-[11px] font-bold text-slate-500 mt-2">Klik untuk Pilih File</p>
                <input id="fileImport" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
              </div>
              <button onClick={downloadTemplate} className="w-full text-center text-[10px] font-bold text-blue-600 underline">Unduh Template Import (.xlsx)</button>
              <button onClick={() => setShowImportModal(false)} className="w-full py-2 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
