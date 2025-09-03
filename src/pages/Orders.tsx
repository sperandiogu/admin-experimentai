import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, Edit, Eye, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { useOrders, useUpdateOrderStatus } from '../hooks/useSupabase';
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

  const { data: allOrders = [], isLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const { showToast } = useToast();

  const itemsPerPage = 10;

  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesBrand = !brandFilter || order.brand === brandFilter;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const orders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleUpdateOrder = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      showToast('Pedido atualizado com sucesso!', 'success');
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

  const totalRevenue = allOrders
    .filter(order => order.status !== 'CANCELED')
    .reduce((sum, order) => sum + (order.amount || 0), 0);

  const shippedOrders = allOrders.filter(order => order.status === 'SHIPPED' || order.status === 'DELIVERED').length;
  const pendingOrders = allOrders.filter(order => order.status === 'PENDING').length;

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
              <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
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
           onChange={setStatusFilter}
           options={[
             { value: '', label: 'Todos os status' },
             { value: 'PENDING', label: 'Pendente' },
             { value: 'PROCESSING', label: 'Processando' },
             { value: 'SHIPPED', label: 'Enviado' },
             { value: 'DELIVERED', label: 'Entregue' },
             { value: 'CANCELED', label: 'Cancelado' }
           ]}
          >
          </Select>
          <Select
            value={brandFilter}
           onChange={setBrandFilter}
           options={[
             { value: '', label: 'Todas as marcas' },
             ...Array.from(new Set(allOrders.map(order => order.brand).filter(Boolean))).map(brand => ({
               value: brand!,
               label: brand!
             }))
           ]}
          >
          </Select>
          <Button
           variant="secondary"
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
            <TableHeader>
              <TableRow>
                <TableHead>ID do Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Edição</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rastreamento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell>
                    <span className="font-mono text-sm text-gray-900">
                      {order.order_id.slice(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {order.customer?.name || 'Cliente não encontrado'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.customer?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">
                      {order.edition_data?.edition || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">{order.brand || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(order.amount || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell>
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
            totalItems={filteredOrders.length}
          />
        </div>
      </Card>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={closeOrderDetails}
        order={selectedOrder}
      />
    </div>
  );
}