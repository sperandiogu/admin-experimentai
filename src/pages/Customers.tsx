import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import CustomerForm from '../components/forms/CustomerForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import { formatPhone, formatCPF } from '../utils/formatters';
import type { Customer } from '../types';

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const { showToast } = useToast();

  const itemsPerPage = 10;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.cpf && customer.cpf.includes(searchTerm))
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateCustomer = async (customerData: any) => {
    try {
      await createCustomer.mutateAsync(customerData);
      showToast('Cliente criado com sucesso!', 'success');
      setShowForm(false);
    } catch (error) {
      showToast('Erro ao criar cliente', 'error');
    }
  };

  const handleUpdateCustomer = async (customerData: any) => {
    if (!editingCustomer) return;
    
    try {
      await updateCustomer.mutateAsync({
        customer_id: editingCustomer.customer_id,
        ...customerData
      });
      showToast('Cliente atualizado com sucesso!', 'success');
      setShowForm(false);
      setEditingCustomer(null);
    } catch (error) {
      showToast('Erro ao atualizar cliente', 'error');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      await deleteCustomer.mutateAsync(customerToDelete.customer_id);
      showToast('Cliente excluído com sucesso!', 'success');
      setShowDeleteDialog(false);
      setCustomerToDelete(null);
    } catch (error) {
      showToast('Erro ao excluir cliente', 'error');
    }
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteDialog(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

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
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gerencie sua base de clientes</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-green-600">{customers.filter(c => c.stripe_customer_id).length}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Novos Este Mês</p>
              <p className="text-2xl font-bold text-purple-600">
                {customers.filter(c => {
                  const created = new Date(c.created_at);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Plus className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Com Endereço</p>
              <p className="text-2xl font-bold text-orange-600">{customers.filter(c => c.address).length}</p>
            </div>
            <MapPin className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.phone && (
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {formatPhone(customer.phone)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.cpf && (
                      <span className="text-sm text-gray-900">{formatCPF(customer.cpf)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.address && (
                      <div className="text-sm text-gray-900 flex items-center max-w-xs truncate">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.stripe_customer_id ? 'success' : 'secondary'}>
                      {customer.stripe_customer_id ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">
                      {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(customer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(customer)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
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
            totalItems={filteredCustomers.length}
          />
        </div>
      </Card>

      {/* Customer Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
      >
        <CustomerForm
          customer={editingCustomer}
         onSuccess={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
         onCancel={closeForm}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteCustomer}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${customerToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}