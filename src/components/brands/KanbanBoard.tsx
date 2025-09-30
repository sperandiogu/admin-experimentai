import React, { useState } from 'react';
import { Plus, MoreVertical, Settings } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import BrandCard from './BrandCard';
import BrandForm from './BrandForm';
import StatusForm from './StatusForm';
import { useBrandStatuses, useBrands, useMoveBrand, type Brand, type BrandStatus } from '../../hooks/useBrands';
import { useToast } from '../../hooks/useToast';

export default function KanbanBoard() {
  const { data: statuses = [], isLoading: statusLoading } = useBrandStatuses();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const moveBrand = useMoveBrand();
  const { showToast } = useToast();
  
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<string>('');
  const [draggedBrand, setDraggedBrand] = useState<Brand | null>(null);

  // Group brands by status
  const brandsByStatus = statuses.reduce((acc, status) => {
    acc[status.id] = brands.filter(brand => brand.status_id === status.id);
    return acc;
  }, {} as Record<string, Brand[]>);

  const handleDragStart = (e: React.DragEvent, brand: Brand) => {
    setDraggedBrand(brand);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedBrand(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatusId: string) => {
    e.preventDefault();
    
    if (!draggedBrand || draggedBrand.status_id === targetStatusId) {
      return;
    }

    try {
      await moveBrand.mutateAsync({
        brandId: draggedBrand.id,
        fromStatusId: draggedBrand.status_id,
        toStatusId: targetStatusId
      });
      showToast(`Marca movida para ${statuses.find(s => s.id === targetStatusId)?.name}`, 'success');
    } catch (error) {
      showToast('Erro ao mover marca', 'error');
    }
  };

  const handleNewBrand = (statusId: string) => {
    setSelectedStatusId(statusId);
    setEditingBrand(null);
    setShowBrandForm(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setSelectedStatusId(brand.status_id);
    setShowBrandForm(true);
  };

  const handleFormClose = () => {
    setShowBrandForm(false);
    setEditingBrand(null);
    setSelectedStatusId('');
  };

  if (statusLoading || brandsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Pipeline de Marcas</h2>
        <Button
          variant="secondary"
          onClick={() => setShowStatusForm(true)}
        >
          <Settings className="w-4 h-4" />
          Gerenciar Status
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4 min-h-96">
        {statuses.map((status) => {
          const statusBrands = brandsByStatus[status.id] || [];
          
          return (
            <div
              key={status.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status.id)}
            >
              <Card className="h-full">
                {/* Column Header */}
                <div
                  className="p-4 border-b"
                  style={{ backgroundColor: `${status.color}10` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <h3 className="font-semibold text-gray-900">{status.name}</h3>
                      <Badge variant="info">{statusBrands.length}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNewBrand(status.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Cards */}
                <div className="p-4 space-y-3 min-h-96">
                  {statusBrands.map((brand) => (
                    <BrandCard
                      key={brand.id}
                      brand={brand}
                      onEdit={handleEditBrand}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                  
                  {statusBrands.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Nenhuma marca neste status</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNewBrand(status.id)}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar primeira marca
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Brand Form Modal */}
      <Modal
        isOpen={showBrandForm}
        onClose={handleFormClose}
        title={editingBrand ? 'Editar Marca' : 'Nova Marca'}
        size="lg"
      >
        <BrandForm
          brand={editingBrand}
          defaultStatusId={selectedStatusId}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      </Modal>

      {/* Status Form Modal */}
      <Modal
        isOpen={showStatusForm}
        onClose={() => setShowStatusForm(false)}
        title="Gerenciar Status"
        size="lg"
      >
        <StatusForm onClose={() => setShowStatusForm(false)} />
      </Modal>
    </div>
  );
}