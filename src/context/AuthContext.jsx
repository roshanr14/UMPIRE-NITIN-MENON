import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseManager } from '../lib/supabase';
import { storage } from '../lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(supabaseManager.isConfigured);

  useEffect(() => {
    async function loadSession() {
      try {
        const currentSession = await supabaseManager.getCurrentSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          // Default guest umpire profile if not logged in
          const settings = storage.getSettings();
          setUser({
            id: 'guest_umpire',
            email: 'umpire@cricketground.org',
            user_metadata: {
              name: settings.scorerName || 'Official Umpire',
              role: settings.scorerRole || 'Lead Match Umpire',
            },
            isGuest: true,
          });
        }
      } catch (err) {
        console.warn('Auth session load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (email, password) => {
    const result = await supabaseManager.signIn(email, password);
    if (result.data?.user) {
      setUser(result.data.user);
      setSession(result.data.session);
    }
    return result;
  };

  const signup = async (email, password, name, role) => {
    const result = await supabaseManager.signUp(email, password, name, role);
    if (result.data?.user) {
      setUser(result.data.user);
      setSession(result.data.session);
    }
    return result;
  };

  const logout = async () => {
    await supabaseManager.signOut();
    setUser({
      id: 'guest_umpire',
      email: 'umpire@cricketground.org',
      user_metadata: {
        name: 'Official Umpire',
        role: 'Lead Match Umpire',
      },
      isGuest: true,
    });
    setSession(null);
  };

  const updateProfile = (name, role) => {
    if (user) {
      const updated = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          name,
          role,
        },
      };
      setUser(updated);
      const settings = storage.getSettings();
      settings.scorerName = name;
      settings.scorerRole = role;
      storage.saveSettings(settings);
    }
  };

  const updateSupabaseConfig = (url, anonKey) => {
    const ok = supabaseManager.saveConfig(url, anonKey);
    setIsConfigured(supabaseManager.isConfigured);
    return ok;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        login,
        signup,
        logout,
        updateProfile,
        updateSupabaseConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
