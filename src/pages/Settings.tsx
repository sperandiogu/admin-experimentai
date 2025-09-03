import React, { useState } from 'react';
import { Settings as SettingsIcon, Webhook, Plus, Trash2, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useWebhookConfigs, useCreateWebhookConfig, useDeleteWebhookConfig } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Settings() {
  const { data: webhooks, isLoading } = useWebhookConfigs();
  const createWebhook = useCreateWebhookConfig();
  const deleteWebhook = useDeleteWebhookConfig();
  
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookError, setWebhookError] = useState('');

  const validateWebhookUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl.trim()) {
      setWebhookError('URL é obrigatória');
      return;
    }

    if (!validateWebhookUrl(webhookUrl)) {
      setWebhookError('URL deve ser válida e usar HTTPS');
      return;
    }

    try {
      await createWebhook.mutateAsync({ url: webhookUrl });
      setWebhookUrl('');
      setWebhookError('');
      setShowWebhookForm(false);
    } catch (error) {
      setWebhookError('Erro ao criar webhook');
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este webhook?')) {
      try {
        await deleteWebhook.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao excluir webhook:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
      </div>

      {/* Webhook Configuration */}
      <Card>
        <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Webhook className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Webhooks</h2>
              <p className="text-sm text-gray-600">Configure URLs para receber notificações de eventos</p>
            </div>
          </div>
          <Button onClick={() => setShowWebhookForm(true)}>
            <Plus className="w-4 h-4" />
            Novo Webhook
          </Button>
        </div>

        {webhooks && webhooks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{webhook.url}</span>
                        <a
                          href={webhook.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(webhook.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        ) : (
          <div className="text-center py-8">
            <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum webhook configurado</h3>
            <p className="text-gray-500 mt-1">Configure webhooks para receber notificações de eventos</p>
          </div>
        )}
        </div>
      </Card>

      {/* System Information */}
      <Card>
        <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-lg">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Informações do Sistema</h2>
            <p className="text-sm text-gray-600">Detalhes sobre a configuração atual</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-full">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Versão:</span>
              <span className="text-sm text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Ambiente:</span>
              <span className="text-sm text-gray-900">Produção</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Última Atualização:</span>
              <span className="text-sm text-gray-900">
                {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Total de Webhooks:</span>
              <span className="text-sm text-gray-900">{webhooks?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Status do Sistema:</span>
              <span className="text-sm text-green-600 font-medium">Operacional</span>
            </div>
          </div>
        </div>
        </div>
      </Card>

      {/* Webhook Form Modal */}
      <Modal
        isOpen={showWebhookForm}
        onClose={() => {
          setShowWebhookForm(false);
          setWebhookUrl('');
          setWebhookError('');
        }}
        title="Novo Webhook"
        size="md"
      >
        <form onSubmit={handleCreateWebhook} className="space-y-4">
          <Input
            label="URL do Webhook"
            value={webhookUrl}
            onChange={setWebhookUrl}
            required
            error={webhookError}
            placeholder="https://exemplo.com/webhook"
          />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> O webhook receberá notificações sobre mudanças de status dos pedidos.
              Certifique-se de que a URL seja acessível e use HTTPS.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createWebhook.isPending}
              className="flex-1"
            >
              {createWebhook.isPending ? 'Criando...' : 'Criar Webhook'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowWebhookForm(false);
                setWebhookUrl('');
                setWebhookError('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
