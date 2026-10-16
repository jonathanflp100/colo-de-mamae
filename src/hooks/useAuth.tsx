import React, { createContext, useContext, useEffect, useState } from 'react';
import { dataService } from '../data/dataService';
import { AuthUser, Profile, Turma } from '../data/types';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  turma: Turma | null;
  loading: boolean;
  isDemoMode: boolean;
  isAccessValid: boolean;
  isAccessExpired: boolean;
  needsOnboarding: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [turma, setTurma] = useState<Turma | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const currentUser = await dataService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const prof = await dataService.getProfile(currentUser.id);
        setProfile(prof);

        if (prof?.turma_id) {
          const t = await dataService.getTurma(prof.turma_id);
          setTurma(t);
        } else {
          setTurma(null);
        }
      } else {
        setProfile(null);
        setTurma(null);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    setLoading(true);
    await loadUserData();
  };

  const signOut = async () => {
    await dataService.signOut();
    setUser(null);
    setProfile(null);
    setTurma(null);
  };

  const deleteAccount = async () => {
    if (!user) return;
    await dataService.deleteAccount(user.id);
    setUser(null);
    setProfile(null);
    setTurma(null);
  };

  // Determine access validity
  const now = new Date().getTime();
  const accessUntilTime = profile?.access_until ? new Date(profile.access_until).getTime() : 0;
  const isAccessValid = !!profile && accessUntilTime > now;
  const isAccessExpired = !!profile && !isAccessValid && !!profile.access_until;

  // Onboarding is needed if user has no nickname, hasn't accepted terms, or has date < 2020 (data errada)
  const dueYear = profile?.due_date ? parseInt(profile.due_date.slice(0, 4), 10) : 0;
  const birthYear = profile?.baby_birth_date ? parseInt(profile.baby_birth_date.slice(0, 4), 10) : 0;
  const hasDateBefore2020 = (dueYear > 0 && dueYear < 2020) || (birthYear > 0 && birthYear < 2020);
  const needsOnboarding = !!user && (!profile || !profile.nickname || !profile.accepted_terms_at || hasDateBefore2020);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        turma,
        loading,
        isDemoMode: dataService.isDemoMode,
        isAccessValid,
        isAccessExpired,
        needsOnboarding,
        refreshProfile,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
