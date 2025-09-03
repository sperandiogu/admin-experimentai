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
    // Check for redirect result first
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in via redirect
          console.log('Login via redirect successful');
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
          avatar: firebaseUser.photoURL || '',
          role: 'admin'
        });
      } else {
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
      if (error.code === 'auth/popup-blocked') {
        throw new Error('POPUP_BLOCKED');
      }
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signInWithGoogleRedirect = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Erro de autenticação via redirect:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    try {
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
    signInWithGoogleRedirect,
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