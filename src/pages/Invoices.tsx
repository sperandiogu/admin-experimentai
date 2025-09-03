import React, { useState, useEffect } from 'react';
import { Search, FileText, DollarSign, CreditCard, ExternalLink, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { useInvoices } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatters';
import type { Invoice } from '../types';

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: allInvoices = [], isLoading } = useInvoices();
  const { showToast } = useToast();

  const itemsPerPage = 10;

  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    const matchesPaymentMethod = !paymentMethodFilter || invoice.payment_method === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

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

  const totalRevenue = allInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  const pendingAmount = allInvoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  if (isLoading) {
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
              <p className="text-2xl font-bold text-gray-900">{allInvoices.length}</p>
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
                {allInvoices.length > 0 ? Math.round((allInvoices.filter(i => i.status === 'paid').length / allInvoices.length) * 100) : 0}%
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
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'paid', label: 'Pago' },
              { value: 'pending', label: 'Pendente' },
              { value: 'failed', label: 'Falhou' },
              { value: 'canceled', label: 'Cancelado' }
            ]}
          >
          </Select>
          <Select
            value={paymentMethodFilter}
            onChange={setPaymentMethodFilter}
            options={[
              { value: '', label: 'Todos os métodos' },
              { value: 'card', label: 'Cartão' },
              { value: 'pix', label: 'PIX' },
              { value: 'boleto', label: 'Boleto' },
              { value: 'bank_transfer', label: 'Transferência' }
            ]}
          >
          </Select>
          <Button
            variant="secondary"
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
            <TableHeader>
              <TableRow>
                <TableHead>ID da Fatura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método de Pagamento</TableHead>
                <TableHead>Cartão</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.invoice_id}>
                  <TableCell>
                    <span className="font-mono text-sm text-gray-900">
                      {invoice.invoice_id.slice(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {invoice.customer?.name || 'Cliente não encontrado'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.customer?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(invoice.amount || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status || 'pending')}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">
                      {getPaymentMethodLabel(invoice.payment_method || '')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {invoice.last_card_number && (
                      <span className="text-sm text-gray-900">
                        **** {invoice.last_card_number}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">
                      {new Date(invoice.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredInvoices.length}
          />
        </div>
      </Card>
    </div>
  );
}