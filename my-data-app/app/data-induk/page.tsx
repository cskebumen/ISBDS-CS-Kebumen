'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';
import Link from 'next/link';
import * as XLSX from 'xlsx';

type Anggota = {
  nia: string;
  nama: string;
  ranting: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat: string;
  no_hp: string;
  status_anggota: string;
};

export default function DataIndukPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingAnggota, setEditingAnggota] = useState<Anggota | null>(null);
  const [formData, setFormData] = useState<Partial<Anggota>>({
    nama: '', ranting: '', tempat_lahir: '', tanggal_lahir: '', 
    jenis_kelamin: 'Laki-laki', alamat: '', no_hp: '', status_anggota: 'Aktif'
  });

  // 1. Fetch Data dari Database
  const fetchAnggota = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('anggota')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setAnggota(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnggota();
  }, []);

  // 2. Logika Auto-Generate NIA (03.06.02.xxxxxx)
  const generateNextNIA = async () => {
    const { data } = await supabase
      .from('anggota')
      .select('nia')
      .like('nia', '03.06.02.%')
      .order('nia', { ascending: false })
      .limit(1);

    const prefix = "03.06.02.";
    if (data && data.length > 0) {
      const lastNia = data[0].nia;
      const lastNum = parseInt(lastNia.split('.').pop() || '0');
      const nextNum = (lastNum + 1).toString().padStart(6, '0');
      return prefix + nextNum;
    }
    return prefix + "000001";
  };

  // 3. Simpan Data (Tambah/Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingAnggota) {
        // Update
        const { error } = await supabase
          .from('anggota')
          .update(formData)
          .eq('nia', editingAnggota.nia);
        if (error) throw error;
      } else {
        // Insert Baru dengan Auto NIA
        const newNia = await generateNextNIA();
        const { error } = await supabase
          .from('anggota')
          .insert([{ ...formData, nia: newNia }]);
        if (error) throw error;
      }
      
      setShowTambahModal(false);
      fetchAnggota();
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (nia: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      const { error } = await supabase.from('anggota').delete().eq('nia', nia);
      if (!error) fetchAnggota();
    }
  };

  const filteredAnggota = anggota.filter(item =>
    item.nia?.includes(searchTerm) ||
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ranting?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col bg-surface pb-24">
        {/* Header Fixed */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 py-3 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-blue-900">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-sm">search</span>
              </span>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm w-40 md:w-64 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                placeholder="Cari anggota..." 
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">Admin Cabang</p>
              <p className="text-[10px] text-slate-500">Kebumen</p>
            </div>
            <ProfilePopup />
          </div>
        </header>

        <div className="pt-20 px-4 md:px-8 pb-12 flex-1">
          {/* Action Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-primary">Data Induk</h2>
              <p className="text-sm text-gray-500">Total: {anggota.length} Anggota terdaftar</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button onClick={() => {
                setEditingAnggota(null);
                setFormData({ nama: '', ranting: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', alamat: '', no_hp: '', status_anggota: 'Aktif' });
                setShowTambahModal(true);
              }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200">
                <span className="material-symbols-outlined text-lg">add</span> Tambah Anggota
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">NIA</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Nama & Ranting</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-10 text-slate-400">Memuat data...</td></tr>
                  ) : filteredAnggota.map(item => (
                    <tr key={item.nia} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-bold text-slate-600">{item.nia}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {item.nama?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-none mb-1">{item.nama}</p>
                            <p className="text-xs text-slate-500">{item.ranting}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status_anggota === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status_anggota}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <Link href={`/profil/${item.nia}`} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Detail">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Link>
                          <button onClick={() => {
                            setEditingAnggota(item);
                            setFormData(item);
                            setShowTambahModal(true);
                          }} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg" title="Edit">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => handleDelete(item.nia)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Footer />
      </main>

      {/* Modal Form Tambah/Edit */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="text-xl font-black text-primary uppercase tracking-tight">
                {editingAnggota ? 'Update Data' : 'Tambah Anggota'}
              </h3>
              <button onClick={() => setShowTambahModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Nama Lengkap sesuai Identitas</label>
                  <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Tempat Lahir</label>
                  <input type="text" value={formData.tempat_lahir} onChange={e => setFormData({...formData, tempat_lahir: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Tanggal Lahir</label>
                  <input type="date" value={formData.tanggal_lahir} onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Jenis Kelamin</label>
                  <select value={formData.jenis_kelamin} onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Nomor WhatsApp</label>
                  <input type="tel" value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="08xxx" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Alamat Tinggal Sekarang</label>
                  <textarea rows={2} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Ranting</label>
                  <input required type="text" value={formData.ranting} onChange={e => setFormData({...formData, ranting: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" placeholder="Contoh: Kebumen Kota" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Status Keanggotaan</label>
                  <select value={formData.status_anggota} onChange={e => setFormData({...formData, status_anggota: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm">
                    <option value="Aktif">Aktif</option>
                    <option value="Istirahat">Istirahat</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                </div>
                
                {editingAnggota && (
                  <div className="md:col-span-2 p-4 bg-blue-50 rounded-xl">
                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">NIA (ID Tidak bisa diubah)</p>
                    <p className="text-sm font-mono font-bold text-primary">{formData.nia}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowTambahModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">BATAL</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:opacity-90 transition-opacity">
                  {isSaving ? 'MEMPROSES...' : 'SIMPAN DATA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
