import React, { useState } from 'react';
import { Search, ShoppingCart, Truck, Eye, Package2, Edit, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useOrders, useUpdateOrderStatus, useUpdateOrderTracking } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';
import type { Order } from '../types';

const statusColors = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'error'
} as const;

const statusLabels = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  IN_TRANSIT: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado'
};

export default function Orders() {
  const { data: orders, isLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateOrderTracking = useUpdateOrderTracking();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'PENDING').length || 0,
    processing: orders?.filter(o => o.status === 'PROCESSING').length || 0,
    shipped: orders?.filter(o => o.status === 'SHIPPED').length || 0,
    delivered: orders?.filter(o => o.status === 'DELIVERED').length || 0
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };

  const handleEditTracking = (order: Order) => {
    setEditingOrder(order);
    setTrackingCode(order.tracking_code || '');
    setTrackingUrl(order.tracking_url || '');
  };

  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      await updateOrderTracking.mutateAsync({
        orderId: editingOrder.order_id,
        tracking_code: trackingCode,
        tracking_url: trackingUrl
      });
      setEditingOrder(null);
      setTrackingCode('');
      setTrackingUrl('');
    } catch (error) {
      console.error('Erro ao atualizar rastreamento:', error);
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
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-1">Acompanhe todos os pedidos</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, email ou código de rastreamento..."
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
            <p className="text-sm text-gray-600">Pendentes</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
            <p className="text-sm text-gray-600">Processando</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
            <p className="text-sm text-gray-600">Enviados</p>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
            <p className="text-sm text-gray-600">Entregues</p>
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Edição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Rastreamento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order: any) => (
                <TableRow key={order.order_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{order.customer?.name}</div>
                      <div className="text-sm text-gray-500">{order.customer?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {order.edition?.edition || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status as keyof typeof statusColors] || 'default'}>
                      {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(order.amount || 0, true)}
                  </TableCell>
                  <TableCell>
                    {order.tracking_code ? (
                      <div>
                        <div className="font-mono text-sm">{order.tracking_code}</div>
                        {order.tracking_url && (
                          <a 
                            href={order.tracking_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Rastrear
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Não disponível</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTracking(order)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {filteredOrders.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Os pedidos aparecerão aqui quando forem criados'}
            </p>
          </div>
        </Card>
      )}

      {/* Edit Tracking Modal */}
      <Modal
        isOpen={!!editingOrder}
        onClose={() => {
          setEditingOrder(null);
          setTrackingCode('');
          setTrackingUrl('');
        }}
        title="Editar Rastreamento"
        size="md"
      >
        {editingOrder && (
          <form onSubmit={handleUpdateTracking} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Pedido #{editingOrder.order_id.slice(0, 8)}</h3>
              <p className="text-sm text-gray-600">Cliente: {editingOrder.customer?.name}</p>
            </div>

            <Input
              label="Código de Rastreamento"
              value={trackingCode}
              onChange={setTrackingCode}
              placeholder="Ex: BR123456789BR"
            />

            <Input
              label="URL de Rastreamento"
              value={trackingUrl}
              onChange={setTrackingUrl}
              placeholder="https://rastreamento.correios.com.br/..."
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateOrderTracking.isPending}
                className="flex-1"
              >
                {updateOrderTracking.isPending ? 'Salvando...' : 'Atualizar Rastreamento'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingOrder(null);
                  setTrackingCode('');
                  setTrackingUrl('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={viewingOrder}
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
      />
    </div>
  );
}