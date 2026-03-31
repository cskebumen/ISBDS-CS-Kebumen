'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import ProfilePopup from '@/components/ProfilePopup';

type User = {
  id: string;
  email: string;
  nama_lengkap: string;
  nia: string | null;
  role: string;
};

type Anggota = {
  id: string;
  nia: string;
  nama_lengkap: string;
};

export default function KelolaUserPage() {
  const router = useRouter();
  const { role: currentRole, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nia: '',
    role: 'anggota',
    email: '',
  });
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Proteksi: jika bukan admin, redirect ke dashboard
  useEffect(() => {
    if (!authLoading && currentRole !== 'admin') {
      router.push('/dashboard');
    }
  }, [authLoading, currentRole, router]);

  useEffect(() => {
    if (currentRole === 'admin') {
      fetchUsers();
      fetchAnggotaList();
    }
  }, [currentRole]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profil')
      .select('id, email, nama_lengkap, nia, role')
      .order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    else console.error('Error fetching users:', error);
    setLoading(false);
  };

  const fetchAnggotaList = async () => {
    const { data, error } = await supabase
      .from('anggota')
      .select('id, nia, nama_lengkap')
      .order('nia', { ascending: true });
    if (!error && data) setAnggotaList(data);
    else console.error('Error fetching anggota:', error);
  };

  const handleNiaChange = (nia: string) => {
    setFormData({ ...formData, nia });
    const anggota = anggotaList.find(a => a.nia === nia);
    setSelectedAnggota(anggota || null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nia && formData.email !== 'isbdscskebumen96@gmail.com') {
      alert('NIA wajib diisi kecuali untuk admin utama');
      return;
    }
    if (!formData.email) {
      alert('Email wajib diisi');
      return;
    }

    const password = 'CSKebumen1996';
    const namaLengkap = selectedAnggota?.nama_lengkap || formData.email.split('@')[0];

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password,
      email_confirm: true,
      user_metadata: {
        nama_lengkap: namaLengkap,
        nia: formData.nia || null,
        role: formData.role,
      },
    });

    if (authError) {
      alert('Gagal membuat user: ' + authError.message);
      return;
    }

    alert('User berhasil dibuat. Password default: CSKebumen1996');
    fetchUsers();
    setShowForm(false);
    setFormData({ nia: '', role: 'anggota', email: '' });
    setSelectedAnggota(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Yakin hapus user ini?')) return;
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) alert('Gagal hapus: ' + error.message);
    else fetchUsers();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentRole !== 'admin') return null;

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
                <p className="text-xs font-bold text-slate-800">Admin Utama</p>
                <p className="text-[10px] text-slate-500 font-medium">Administrator</p>
              </div>
              <ProfilePopup />
            </div>
          </div>
        </header>

        <div className="pt-24 px-4 md:px-8 pb-12 flex-1 w-full max-w-full overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight">Kelola User</h1>
              <p className="text-tertiary font-medium mt-1">Tambah, edit, dan hapus user yang dapat mengakses sistem</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-700 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Tambah User
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nama Lengkap</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">NIA</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm break-words">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.nama_lengkap || '-'}</td>
                      <td className="px-6 py-4 text-sm font-mono">{user.nia || '-'}</td>
                      <td className="px-6 py-4 text-sm capitalize">{user.role}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
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

      {/* Modal Tambah User */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-4">Tambah User Baru</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">NIA (Kosongkan untuk admin utama)</label>
                <select
                  value={formData.nia}
                  onChange={(e) => handleNiaChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                >
                  <option value="">-- Pilih NIA (opsional) --</option>
                  {anggotaList.map(anggota => (
                    <option key={anggota.id} value={anggota.nia}>{anggota.nia} - {anggota.nama_lengkap}</option>
                  ))}
                </select>
              </div>
              {selectedAnggota && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap (Otomatis)</label>
                  <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm">
                    {selectedAnggota.nama_lengkap}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="sekretaris">Sekretaris</option>
                  <option value="bendahara">Bendahara</option>
                  <option value="ketua cabang">Ketua Cabang</option>
                  <option value="ketua ranting">Ketua Ranting</option>
                  <option value="anggota">Anggota</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 italic">Password default: <strong>CSKebumen1996</strong></p>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold text-sm">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-blue-700 text-white rounded-xl font-bold text-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
