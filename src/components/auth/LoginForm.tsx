import React, { useState } from 'react';
import { Chrome, Shield, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function LoginForm() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600 mt-2">Clube de Assinatura</p>
            </div>

            {/* Features Preview */}
            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Gerenciar clientes e assinantes</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <BarChart3 className="w-4 h-4 text-green-500" />
                <span>Acompanhar vendas e métricas</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>Controle total do sistema</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 border rounded-lg bg-red-50 border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Google Sign In */}
            <div>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                variant="secondary"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Chrome className="w-5 h-5 text-blue-500" />
                )}
                <span className="font-medium">
                  {loading ? 'Conectando...' : 'Entrar com Google'}
                </span>
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Acesso restrito a administradores autorizados
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Acesso Seguro</h3>
                  <p className="text-xs text-blue-700 mt-1">
                    Autenticação via Google para máxima segurança. Apenas contas autorizadas podem acessar o painel.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2024 Clube de Assinatura - Todos os direitos reservados
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}