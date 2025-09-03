import React from 'react';
import { Package, Users, Calendar, CreditCard, Truck, MapPin } from 'lucide-react';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order } from '../types';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

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
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado'
};

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pedido #${order.order_id.slice(0, 8)}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Status and Basic Info */}
        <div className="flex items-center justify-between">
          <Badge variant={statusColors[order.status as keyof typeof statusColors] || 'default'} size="md">
            {statusLabels[order.status as keyof typeof statusLabels] || order.status}
          </Badge>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format((order.amount || 0) / 100)}
            </p>
            <p className="text-sm text-gray-500">
              {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Informações do Cliente</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Nome</p>
              <p className="text-gray-900">{order.customer?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{order.customer?.email}</p>
            </div>
            {order.customer?.phone && (
              <div>
                <p className="text-sm font-medium text-gray-600">Telefone</p>
                <p className="text-gray-900">{order.customer.phone}</p>
              </div>
            )}
            {order.customer?.address && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600">Endereço</p>
                <p className="text-gray-900">{order.customer.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Detalhes do Pedido</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Edição</p>
              <p className="text-gray-900">{order.edition_data?.edition || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Marca</p>
              <p className="text-gray-900">{order.brand || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Tracking Information */}
        {(order.tracking_code || order.tracking_url) && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Rastreamento</h3>
            </div>
            <div className="space-y-2">
              {order.tracking_code && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Código de Rastreamento</p>
                  <p className="font-mono text-gray-900">{order.tracking_code}</p>
                </div>
              )}
              {order.tracking_url && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Link de Rastreamento</p>
                  <a 
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Acompanhar entrega
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Information */}
        {order.invoice && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Informações de Pagamento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Status do Pagamento</p>
                <p className="text-gray-900">{order.invoice.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Método de Pagamento</p>
                <p className="text-gray-900">{order.invoice.payment_method || 'N/A'}</p>
              </div>
              {order.invoice.last_card_number && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Cartão</p>
                  <p className="text-gray-900">**** **** **** {order.invoice.last_card_number}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Timeline do Pedido</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Pedido criado</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            </div>
            
            {order.updated_at !== order.created_at && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Última atualização</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(order.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}