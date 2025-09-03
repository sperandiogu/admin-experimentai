import React, { useState } from 'react';
import { Plus, Search, Package, Edit, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import BoxForm from '../components/forms/BoxForm';
import { useBoxes, useDeleteBox } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Box } from '../types';

export default function Boxes() {
  const { data: boxes, isLoading } = useBoxes();
  const deleteBox = useDeleteBox();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBox, setEditingBox] = useState<Box | null>(null);

  const filteredBoxes = boxes?.filter(box =>
    box.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
    box.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (box: Box) => {
    setEditingBox(box);
    setShowForm(true);
  };

  const handleDelete = async (boxId: string) => {
    if (confirm('Tem certeza que deseja excluir esta caixa?')) {
      try {
        await deleteBox.mutateAsync(boxId);
      } catch (error) {
        console.error('Erro ao excluir caixa:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBox(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBox(null);
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
          <h1 className="text-3xl font-bold text-gray-900">Caixas Temáticas</h1>
          <p className="text-gray-600 mt-1">Gerencie os temas das suas caixas de assinatura</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Nova Caixa
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar caixas por tema ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Caixas</p>
              <p className="text-2xl font-bold text-gray-900">{boxes?.length || 0}</p>
            </div>
          </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Caixa Mais Recente</p>
              <p className="text-lg font-bold text-gray-900">
                {boxes?.[0]?.theme || 'Nenhuma'}
              </p>
            </div>
          </div>
          </div>
        </Card>
      </div>

      {/* Boxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBoxes.map((box) => (
          <Card key={box.id} className="group hover:shadow-lg transition-all duration-200">
            <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(box)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(box.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {box.theme}
                </h3>
                {box.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{box.description}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Criado em {format(new Date(box.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
                <span className="text-xs text-gray-500">
                  Atualizado {format(new Date(box.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBoxes.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma caixa encontrada</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece criando sua primeira caixa temática'}
            </p>
          </div>
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingBox ? 'Editar Caixa' : 'Nova Caixa'}
        size="md"
      >
        <BoxForm
          box={editingBox || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
}