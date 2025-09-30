import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Obter o token JWT do Firebase
          const idToken = await firebaseUser.getIdToken();
          
          // Tentar autenticar no Supabase com o token do Firebase
          console.log('Tentando autenticar no Supabase...');
          const { data, error } = await supabase.auth.signInWithIdToken({ 
            provider: 'jwt', 
            token: idToken 
          });
          
          if (error) {
            console.error('Erro ao autenticar no Supabase:', error);
            // Se falhar, usar sessão anônima ou temporária
            console.log('Continuando sem autenticação Supabase...');
          } else {
            console.log('Autenticação Supabase bem-sucedida:', data);
          }
          
        } catch (error) {
          console.error('Erro ao sincronizar autenticação com Supabase:', error);
        }
        
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
          avatar: firebaseUser.photoURL || '',
          role: 'admin'
        });
      } else {
        // Limpar token do Supabase quando usuário faz logout
        await supabase.auth.signOut();
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Force account selection
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    try {
      // Limpar token do Supabase e fazer logout no Firebase
      await supabase.auth.signOut();
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error('Erro ao fazer logout');
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/popup-closed-by-user':
        return 'Login cancelado pelo usuário';
      case 'auth/popup-blocked':
        return 'Popup bloqueado pelo navegador. Permita popups para este site';
      case 'auth/cancelled-popup-request':
        return 'Solicitação de login cancelada';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      case 'auth/user-disabled':
        return 'Conta desabilitada. Entre em contato com o suporte';
      default:
        return 'Erro de autenticação. Tente novamente';
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}