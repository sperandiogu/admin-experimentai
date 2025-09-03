import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, Edit, Eye, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Pagination } from '../components/ui/Pagination';
import { useSupabase } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatters';
import type { Order } from '../types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const { fetchOrders, updateOrder } = useSupabase();
  const { showToast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, [currentPage, searchTerm, statusFilter, brandFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, total } = await fetchOrders({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        brand: brandFilter
      });
      setOrders(data);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      showToast('Erro ao carregar pedidos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      await updateOrder(orderId, updates);
      showToast('Pedido atualizado com sucesso!', 'success');
      loadOrders();
    } catch (error) {
      showToast('Erro ao atualizar pedido', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'PENDING': { variant: 'warning' as const, label: 'Pendente' },
      'PROCESSING': { variant: 'info' as const, label: 'Processando' },
      'SHIPPED': { variant: 'success' as const, label: 'Enviado' },
      'DELIVERED': { variant: 'success' as const, label: 'Entregue' },
      'CANCELED': { variant: 'error' as const, label: 'Cancelado' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const totalRevenue = orders
    .filter(order => order.status !== 'CANCELED')
    .reduce((sum, order) => sum + (order.amount || 0), 0);

  const shippedOrders = orders.filter(order => order.status === 'SHIPPED' || order.status === 'DELIVERED').length;
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length;

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
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600">Acompanhe todos os pedidos e entregas</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enviados</p>
              <p className="text-2xl font-bold text-blue-600">{shippedOrders}</p>
            </div>
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
            </div>
            <Filter className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar pedidos..."
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
            <option value="PENDING">Pendente</option>
            <option value="PROCESSING">Processando</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELED">Cancelado</option>
          </Select>
          <Select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">Todas as marcas</option>
            {Array.from(new Set(orders.map(order => order.brand).filter(Boolean))).map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setBrandFilter('');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>ID do Pedido</th>
                <th>Cliente</th>
                <th>Edição</th>
                <th>Marca</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Rastreamento</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td>
                    <span className="font-mono text-sm text-gray-900">
                      {order.order_id.slice(0, 8)}...
                    </span>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900">
                      {order.customer?.name || 'Cliente não encontrado'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.customer?.email}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-gray-900">
                      {order.edition_info?.edition || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-900">{order.brand || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(order.amount || 0)}
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(order.status)}
                  </td>
                  <td>
                    {order.tracking_code ? (
                      <div className="text-sm">
                        <div className="font-mono text-gray-900">{order.tracking_code}</div>
                        {order.tracking_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(order.tracking_url, '_blank')}
                            className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                          >
                            Rastrear
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td>
                    <span className="text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={showOrderDetails}
          onClose={closeOrderDetails}
          order={selectedOrder}
          onUpdate={handleUpdateOrder}
        />
      )}
    </div>
  );
}