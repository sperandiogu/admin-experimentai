import React from 'react';
import { Users, ShoppingCart, FileText, Package, TrendingUp, DollarSign } from 'lucide-react';
import Card from '../components/ui/Card';
import { useDashboardStats, useOrders, useInvoices } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RevenueChart from '../components/analytics/RevenueChart';
import StatusPieChart from '../components/analytics/StatusPieChart';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: orders } = useOrders();
  const { data: invoices } = useInvoices();

  const recentOrders = orders?.slice(0, 5) || [];
  
  // Chart data
  const ordersByStatus = [
    { name: 'Pendente', value: orders?.filter(o => o.status === 'PENDING').length || 0, color: '#F59E0B' },
    { name: 'Processando', value: orders?.filter(o => o.status === 'PROCESSING').length || 0, color: '#3B82F6' },
    { name: 'Enviado', value: orders?.filter(o => o.status === 'SHIPPED').length || 0, color: '#10B981' },
    { name: 'Entregue', value: orders?.filter(o => o.status === 'DELIVERED').length || 0, color: '#6366F1' }
  ];

  const monthlyRevenue = invoices?.reduce((acc: any[], invoice) => {
    const month = format(new Date(invoice.created_at), 'MMM', { locale: ptBR });
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      existing.revenue += (invoice.amount || 0) / 100; // <-- Corrigido
    } else {
      acc.push({ month, revenue: (invoice.amount || 0) / 100 }); // <-- Corrigido
    }
    
    return acc;
  }, []) || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do seu clube de assinatura</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalCustomers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format((stats?.totalRevenue || 0) / 100)} {/* <-- Corrigido */}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produtos</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Receita Mensal</h3>
            <div className="text-sm text-gray-500">Últimos 6 meses</div>
          </div>
          <RevenueChart data={monthlyRevenue} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status dos Pedidos</h3>
            <div className="text-sm text-gray-500">Distribuição atual</div>
          </div>
          <StatusPieChart data={ordersByStatus} />
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todos
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Edição</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Valor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.order_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{order.customer?.name}</div>
                      <div className="text-sm text-gray-500">{order.customer?.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{order.edition?.edition}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format((order.amount || 0) / 100)} {/* <-- Corrigido */}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
