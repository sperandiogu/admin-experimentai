import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários pré-definidos (em produção, isso viria de uma API)
const ADMIN_USERS = [
  {
    id: '1',
    email: 'admin@admin.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar credenciais
    const adminUser = ADMIN_USERS.find(u => u.email === email && u.password === password);
    
    if (!adminUser) {
      throw new Error('Email ou senha incorretos');
    }

    const userSession = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    };

    // Salvar no localStorage
    localStorage.setItem('admin_user', JSON.stringify(userSession));
    setUser(userSession);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar se email já existe
    const existingUser = ADMIN_USERS.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Este email já está cadastrado');
    }

    // Em um sistema real, isso salvaria no banco de dados
    // Por enquanto, vamos apenas simular sucesso
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name: fullName,
      role: 'admin'
    };

    // Adicionar à lista de usuários (temporário)
    ADMIN_USERS.push(newUser);
    
    // Não fazer login automático, apenas confirmar criação
  };

  const signOut = async () => {
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
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