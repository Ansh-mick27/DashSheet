// ==========================================
// DashSheet — Auth Context
// ==========================================
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Member } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  member: Member | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadMember(): Member | null {
  const raw = sessionStorage.getItem('dashsheet_member');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Member;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(() => loadMember());

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('login_member', {
      p_username: username.trim().toLowerCase(),
      p_password: password
    });

    if (error || !data || data.length === 0) return false;

    const row = data[0];
    const loggedInMember: Member = {
      id: row.id,
      name: row.name,
      department: row.department,
      batch: row.batch,
      email: row.email,
      role: row.role,
      username: row.username
    };

    setMember(loggedInMember);
    sessionStorage.setItem('dashsheet_member', JSON.stringify(loggedInMember));
    return true;
  }, []);

  const logout = useCallback(() => {
    setMember(null);
    sessionStorage.removeItem('dashsheet_member');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: member !== null, member, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
