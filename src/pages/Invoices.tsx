import React, { useState } from 'react';
import { Search, FileText, ExternalLink, CreditCard, Eye, Download, User } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useInvoices } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusColors = {
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  cancelled: 'default'
} as const;

const statusLabels = {
  paid: 'Pago',
  pending: 'Pendente',
  failed: 'Falhou',
  cancelled: 'Cancelado'
};

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.last_card_number?.includes(searchTerm);
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const invoiceStats = {
    total: invoices?.length || 0,
    paid: invoices?.filter(i => i.status === 'paid').length || 0,
    pending: invoices?.filter(i => i.status === 'pending').length || 0,
    failed: invoices?.filter(i => i.status === 'failed').length || 0,
    totalRevenue: invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0) || 0
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faturas</h1>
          <p className="text-gray-600 mt-1">Gerencie cobranças e pagamentos</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, email ou cartão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Todos os status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{invoiceStats.total}</p>
            <p className="text-sm text-gray-600">Total de Faturas</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{invoiceStats.paid}</p>
            <p className="text-sm text-gray-600">Pagas</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{invoiceStats.pending}</p>
            <p className="text-sm text-gray-600">Pendentes</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                notation: 'compact'
              }).format(invoiceStats.totalRevenue)}
            </p>
            <p className="text-sm text-gray-600">Receita</p>
          </div>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método de Pagamento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice: any) => (
              <TableRow key={invoice.invoice_id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{invoice.customer?.name}</div>
                    <div className="text-sm text-gray-500">{invoice.customer?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format((invoice.amount || 0) / 100)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[invoice.status as keyof typeof statusColors] || 'default'}>
                    {statusLabels[invoice.status as keyof typeof statusLabels] || invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-900">{invoice.payment_method || 'N/A'}</div>
                      {invoice.last_card_number && (
                        <div className="text-xs text-gray-500">**** {invoice.last_card_number}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(invoice.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingInvoice(invoice)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {invoice.invoice_link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(invoice.invoice_link, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredInvoices.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma fatura encontrada</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'As faturas aparecerão aqui quando forem geradas'}
            </p>
          </div>
        </Card>
      )}

      {/* Invoice Details Modal */}
      <Modal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        title={`Fatura #${viewingInvoice?.invoice_id?.slice(0, 8)}`}
        size="md"
      >
        {viewingInvoice && (
          <div className="space-y-6">
            {/* Status and Amount */}
            <div className="flex items-center justify-between">
              <Badge variant={statusColors[viewingInvoice.status as keyof typeof statusColors] || 'default'} size="md">
                {statusLabels[viewingInvoice.status as keyof typeof statusLabels] || viewingInvoice.status}
              </Badge>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format((viewingInvoice.amount || 0) / 100)}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(viewingInvoice.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Cliente</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-900">{viewingInvoice.customer?.name}</p>
                <p className="text-gray-600">{viewingInvoice.customer?.email}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Pagamento</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="text-gray-900">{viewingInvoice.payment_method || 'N/A'}</span>
                </div>
                {viewingInvoice.last_card_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cartão:</span>
                    <span className="text-gray-900">**** **** **** {viewingInvoice.last_card_number}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Actions */}
            {viewingInvoice.invoice_link && (
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => window.open(viewingInvoice.invoice_link, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Fatura Completa
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}