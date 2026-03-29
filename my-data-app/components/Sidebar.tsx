'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Data Induk', icon: 'database', path: '/data-induk' },
    { name: 'Profil Anggota', icon: 'person', path: '/profil' },
    { name: 'E-sertifikat', icon: 'card_membership', path: '/sertifikat' },
    { name: 'E-KTA', icon: 'contact_mail', path: '/kta' },
    { name: 'E-Surat', icon: 'mail', path: '/surat' },
  ];

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col bg-slate-50 dark:bg-slate-900 shadow-xl z-40 py-8 gap-1">
      <div className="px-8 mb-8">
        <h1 className="text-lg font-bold text-blue-900 dark:text-blue-50">ISBDS Cipta Sejati</h1>
      </div>
      <div className="flex flex-col flex-1 gap-1 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-200 ease-in-out active:scale-95 ${
              isActive(item.path)
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-manrope font-semibold text-sm tracking-tight">{item.name}</span>
          </Link>
        ))}
      </div>
      <div className="mt-auto px-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <img
            alt="Admin"
            className="w-10 h-10 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/..."
          />
          <div className="overflow-hidden">
            <p className="font-manrope font-bold text-sm text-blue-900 truncate">Admin Kebumen</p>
            <p className="text-xs text-slate-500 truncate">Administrator</p>
          </div>
        </div>
        <Link href="/login" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg px-4 py-3 flex items-center gap-3 transition-all">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-manrope font-semibold text-sm tracking-tight">Logout</span>
        </Link>
      </div>
    </aside>
  );
}
