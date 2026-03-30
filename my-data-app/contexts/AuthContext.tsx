'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type AuthContextType = {
  user: any | null;
  role: string;
  nia: string | null;
  ranting: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'anggota',
  nia: null,
  ranting: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('anggota');
  const [nia, setNia] = useState<string | null>(null);
  const [ranting, setRanting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('user_profil')
          .select('role, nia, ranting')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setRole(profile.role);
          setNia(profile.nia);
          setRanting(profile.ranting);
        }
      }
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        supabase
          .from('user_profil')
          .select('role, nia, ranting')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setRole(data.role);
              setNia(data.nia);
              setRanting(data.ranting);
            }
            setLoading(false);
          });
      } else {
        setUser(null);
        setRole('anggota');
        setNia(null);
        setRanting(null);
        setLoading(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, nia, ranting, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
