'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose}></div>
      )}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-50 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full py-8">
          <div className="px-8 mb-8 flex justify-between items-center">
            <h1 className="text-lg font-bold text-blue-900">ISBDS Cipta Sejati</h1>
            <button onClick={onClose} className="md:hidden p-2 text-slate-500">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path) ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="px-6 pt-6 border-t border-slate-200">
            <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
