import React, { useState } from 'react';
import { Plus, Search, Calendar, Package, Edit, Trash2, Settings } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EditionForm from '../components/forms/EditionForm';
import EditionProductManager from '../components/EditionProductManager';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useEditions, useDeleteEdition } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Edition } from '../types';

export default function Editions() {
  const { data: editions, isLoading } = useEditions();
  const deleteEdition = useDeleteEdition();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null);
  const [managingEdition, setManagingEdition] = useState<Edition | null>(null);

  const filteredEditions = editions?.filter(edition =>
    edition.edition.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (edition: Edition) => {
    setEditingEdition(edition);
    setShowForm(true);
  };

  const handleDelete = async (editionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta edição? Esta ação não pode ser desfeita.')) {
      try {
        await deleteEdition.mutateAsync(editionId);
      } catch (error) {
        console.error('Erro ao excluir edição:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEdition(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEdition(null);
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
          <h1 className="text-3xl font-bold text-gray-900">Edições</h1>
          <p className="text-gray-600 mt-1">Gerencie as edições mensais das caixas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Nova Edição
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar edições..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Edições</p>
              <p className="text-2xl font-bold text-gray-900">{editions?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Edição Mais Recente</p>
              <p className="text-lg font-bold text-gray-900">
                {editions?.[0]?.edition || 'Nenhuma'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Editions Table */}
      <div className="overflow-x-auto">
        <Card>
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
            {filteredEditions.map((edition) => (
              <TableRow key={edition.edition_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{edition.edition}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(edition.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {format(new Date(edition.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setManagingEdition(edition)}
                    >
                      <Package className="w-4 h-4" />
                      Ver Produtos
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(edition)}
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(edition.edition_id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </Card>
      </div>

      {filteredEditions.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma edição encontrada</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando sua primeira edição'}
            </p>
          </div>
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingEdition ? 'Editar Edição' : 'Nova Edição'}
        size="md"
      >
        <EditionForm
          edition={editingEdition || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Product Manager Modal */}
      <Modal
        isOpen={!!managingEdition}
        onClose={() => setManagingEdition(null)}
        title="Gerenciar Produtos da Edição"
        size="xl"
      >
        {managingEdition && (
          <EditionProductManager
            edition={managingEdition}
            onClose={() => setManagingEdition(null)}
          />
        )}
      </Modal>
    </div>
  );
}