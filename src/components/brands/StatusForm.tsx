import React, { useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, GripVertical } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { 
  useBrandStatuses, 
  useCreateBrandStatus, 
  useUpdateBrandStatus, 
  useDeleteBrandStatus,
  type BrandStatus 
} from '../../hooks/useBrands';
import { useToast } from '../../hooks/useToast';

interface StatusFormProps {
  onClose: () => void;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export default function StatusForm({ onClose }: StatusFormProps) {
  const { data: statuses = [] } = useBrandStatuses();
  const createStatus = useCreateBrandStatus();
  const updateStatus = useUpdateBrandStatus();
  const deleteStatus = useDeleteBrandStatus();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<BrandStatus | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; status: BrandStatus | null }>({
    isOpen: false,
    status: null
  });

  const [formData, setFormData] = useState({
    name: '',
    color: defaultColors[0],
    order: 0
  });

  const handleNewStatus = () => {
    setEditingStatus(null);
    setFormData({
      name: '',
      color: defaultColors[0],
      order: Math.max(...statuses.map(s => s.order), 0) + 1
    });
    setShowForm(true);
  };

  const handleEditStatus = (status: BrandStatus) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      color: status.color,
      order: status.order
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Nome é obrigatório', 'error');
      return;
    }

    console.log('Submetendo formulário com dados:', formData);

    try {
      if (editingStatus) {
        await updateStatus.mutateAsync({
          id: editingStatus.id,
          ...formData
        });
        showToast('Status atualizado com sucesso!', 'success');
      } else {
        await createStatus.mutateAsync(formData);
        showToast('Status criado com sucesso!', 'success');
      }
      
      setShowForm(false);
      setFormData({
        name: '',
        color: defaultColors[0],
        order: statuses.length + 1
      });
    } catch (error) {
      console.error('Erro detalhado:', error);
      showToast('Erro ao salvar status', 'error');
    }
  };

  const handleDeleteStatus = async () => {
    if (!deleteDialog.status) return;

    try {
      await deleteStatus.mutateAsync(deleteDialog.status.id);
      showToast('Status excluído com sucesso!', 'success');
      setDeleteDialog({ isOpen: false, status: null });
    } catch (error) {
      showToast('Erro ao excluir status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Status do Pipeline</h3>
        <div className="flex gap-2">
          <Button onClick={handleNewStatus}>
            <Plus className="w-4 h-4" />
            Novo Status
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses
              .sort((a, b) => a.order - b.order)
              .map((status) => (
                <TableRow key={status.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{status.order}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="font-medium">{status.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm text-gray-600 font-mono">
                        {status.color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStatus(status)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialog({ isOpen: true, status })}
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

        {statuses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum status configurado</p>
            <Button onClick={handleNewStatus}>
              <Plus className="w-4 h-4" />
              Criar primeiro status
            </Button>
          </div>
        )}
      </Card>

      {/* Status Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingStatus ? 'Editar Status' : 'Novo Status'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Status"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
            placeholder="Ex: Prospecção, Em Negociação..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor do Status
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                disabled={createStatus.isPending || updateStatus.isPending}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
            <Input
              value={formData.color}
              onChange={(value) => setFormData({ ...formData, color: value })}
              placeholder="#3B82F6"
              className="font-mono"
            />
          </div>

          <Input
            label="Ordem"
            type="number"
            min="1"
            value={formData.order.toString()}
            onChange={(value) => setFormData({ ...formData, order: parseInt(value) || 1 })}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createStatus.isPending || updateStatus.isPending}
              className="flex-1"
            >
              {(createStatus.isPending || updateStatus.isPending) ? 'Salvando...' : 
               editingStatus ? 'Atualizar' : 'Criar Status'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, status: null })}
        onConfirm={handleDeleteStatus}
        title="Excluir Status"
        message={`Tem certeza que deseja excluir o status "${deleteDialog.status?.name}"? Todas as marcas neste status precisarão ser movidas para outro status primeiro.`}
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}