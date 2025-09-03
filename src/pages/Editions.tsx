import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Calendar, Package, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import EditionForm from '../components/forms/EditionForm';
import EditionProductManager from '../components/EditionProductManager';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { useEditions, useCreateEdition, useUpdateEdition, useDeleteEdition } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import type { Edition } from '../types';

export default function Editions() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showProductManager, setShowProductManager] = useState(false);
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null);
  const [managingEdition, setManagingEdition] = useState<Edition | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editionToDelete, setEditionToDelete] = useState<Edition | null>(null);

  const { data: editions = [], isLoading } = useEditions();
  const createEdition = useCreateEdition();
  const updateEdition = useUpdateEdition();
  const deleteEdition = useDeleteEdition();
  const { showToast } = useToast();

  const itemsPerPage = 10;

  const filteredEditions = editions.filter(edition =>
    edition.edition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEditions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEditions = filteredEditions.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateEdition = async (editionData: any) => {
    try {
      await createEdition.mutateAsync(editionData);
      showToast('Edição criada com sucesso!', 'success');
      setShowForm(false);
    } catch (error) {
      showToast('Erro ao criar edição', 'error');
    }
  };

  const handleUpdateEdition = async (editionData: any) => {
    if (!editingEdition) return;
    
    try {
      await updateEdition.mutateAsync({
        edition_id: editingEdition.edition_id,
        ...editionData
      });
      showToast('Edição atualizada com sucesso!', 'success');
      setShowForm(false);
      setEditingEdition(null);
    } catch (error) {
      showToast('Erro ao atualizar edição', 'error');
    }
  };

  const handleDeleteEdition = async () => {
    if (!editionToDelete) return;

    try {
      await deleteEdition.mutateAsync(editionToDelete.edition_id);
      showToast('Edição excluída com sucesso!', 'success');
      setShowDeleteDialog(false);
      setEditionToDelete(null);
    } catch (error) {
      showToast('Erro ao excluir edição', 'error');
    }
  };

  const openEditForm = (edition: Edition) => {
    setEditingEdition(edition);
    setShowForm(true);
  };

  const openProductManager = (edition: Edition) => {
    setManagingEdition(edition);
    setShowProductManager(true);
  };

  const openDeleteDialog = (edition: Edition) => {
    setEditionToDelete(edition);
    setShowDeleteDialog(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEdition(null);
  };

  const closeProductManager = () => {
    setShowProductManager(false);
    setManagingEdition(null);
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
          <Calendar className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edições</h1>
            <p className="text-gray-600">Gerencie as edições mensais das caixas</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nova Edição</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Edições</p>
              <p className="text-2xl font-bold text-gray-900">{editions.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Edições Este Ano</p>
              <p className="text-2xl font-bold text-green-600">
                {editions.filter(e => {
                  const created = new Date(e.created_at);
                  const now = new Date();
                  return created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Edições Recentes</p>
              <p className="text-2xl font-bold text-purple-600">
                {editions.filter(e => {
                  const created = new Date(e.created_at);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return created >= thirtyDaysAgo;
                }).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar edições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Editions Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Edição</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEditions.map((edition) => (
                <TableRow key={edition.edition_id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{edition.edition}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">
                      {new Date(edition.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">
                      {new Date(edition.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openProductManager(edition)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Package className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(edition)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(edition)}
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
            totalItems={filteredEditions.length}
          />
        </div>
      </Card>

      {/* Edition Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingEdition ? 'Editar Edição' : 'Nova Edição'}
      >
        <EditionForm
          edition={editingEdition}
         onSuccess={editingEdition ? handleUpdateEdition : handleCreateEdition}
          onCancel={closeForm}
        />
      </Modal>

      {/* Product Manager Modal */}
      <Modal
        isOpen={showProductManager}
        onClose={closeProductManager}
        title={`Gerenciar Produtos - ${managingEdition?.edition}`}
        size="xl"
      >
        {managingEdition && (
          <EditionProductManager
            edition={managingEdition}
            onClose={closeProductManager}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteEdition}
        title="Excluir Edição"
        message={`Tem certeza que deseja excluir a edição "${editionToDelete?.edition}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}