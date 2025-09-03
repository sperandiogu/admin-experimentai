import React, { useState, useEffect } from 'react';
import { Search, FileText, DollarSign, CreditCard, ExternalLink, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Pagination } from '../components/ui/Pagination';
import { useSupabase } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatters';
import type { Invoice } from '../types';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { fetchInvoices } = useSupabase();
  const { showToast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    loadInvoices();
  }, [currentPage, searchTerm, statusFilter, paymentMethodFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const { data, total } = await fetchInvoices({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        paymentMethod: paymentMethodFilter
      });
      setInvoices(data);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      showToast('Erro ao carregar faturas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'paid': { variant: 'success' as const, label: 'Pago' },
      'pending': { variant: 'warning' as const, label: 'Pendente' },
      'failed': { variant: 'error' as const, label: 'Falhou' },
      'canceled': { variant: 'secondary' as const, label: 'Cancelado' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap = {
      'card': 'Cartão',
      'pix': 'PIX',
      'boleto': 'Boleto',
      'bank_transfer': 'Transferência'
    };
    return methodMap[method as keyof typeof methodMap] || method;
  };

  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  const pendingAmount = invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faturas</h1>
            <p className="text-gray-600">Acompanhe pagamentos e cobranças</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Faturas</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-purple-600">
                {invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100) : 0}%
              </p>
            </div>
            <Filter className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar faturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="failed">Falhou</option>
            <option value="canceled">Cancelado</option>
          </Select>
          <Select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          >
            <option value="">Todos os métodos</option>
            <option value="card">Cartão</option>
            <option value="pix">PIX</option>
            <option value="boleto">Boleto</option>
            <option value="bank_transfer">Transferência</option>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setPaymentMethodFilter('');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>ID da Fatura</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Método de Pagamento</th>
                <th>Cartão</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.invoice_id}>
                  <td>
                    <span className="font-mono text-sm text-gray-900">
                      {invoice.invoice_id.slice(0, 8)}...
                    </span>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900">
                      {invoice.customer?.name || 'Cliente não encontrado'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.customer?.email}
                    </div>
                  </td>
                  <td>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(invoice.amount || 0)}
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(invoice.status || 'pending')}
                  </td>
                  <td>
                    <span className="text-sm text-gray-900">
                      {getPaymentMethodLabel(invoice.payment_method || '')}
                    </span>
                  </td>
                  <td>
                    {invoice.last_card_number && (
                      <span className="text-sm text-gray-900">
                        **** {invoice.last_card_number}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="text-sm text-gray-900">
                      {new Date(invoice.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {invoice.invoice_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(invoice.invoice_link, '_blank')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
}