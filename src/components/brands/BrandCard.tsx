import React, { useState } from 'react';
import { Calendar, DollarSign, User, MoreVertical, CreditCard as Edit, Trash2, History, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import BrandHistoryModal from './BrandHistoryModal';
import { useDeleteBrand, type Brand } from '../../hooks/useBrands';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BrandCardProps {
  brand: Brand;
  onEdit: (brand: Brand) => void;
  onDragStart: (e: React.DragEvent, brand: Brand) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export default function BrandCard({ brand, onEdit, onDragStart, onDragEnd }: BrandCardProps) {
  const deleteBrand = useDeleteBrand();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteBrand.mutateAsync(brand.id);
      showToast('Marca excluída com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao excluir marca', 'error');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, brand);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  const isOverdue = brand.deadline && new Date(brand.deadline) < new Date();
  const isDueSoon = brand.deadline && !isOverdue && 
    new Date(brand.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return (
    <>
      <Card
        className={`cursor-move hover:shadow-md transition-all duration-200 group select-none ${
          isDragging ? 'opacity-50 scale-95 rotate-2' : 'hover:scale-105'
        }`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1">
              {brand.name}
            </h4>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => {
                        onEdit(brand);
                        setShowMenu(false);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => {
                        setShowHistory(true);
                        setShowMenu(false);
                      }}
                    >
                      <History className="w-4 h-4" />
                      Histórico
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={() => {
                        setShowDeleteDialog(true);
                        setShowMenu(false);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {brand.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {brand.description}
            </p>
          )}

          {/* Details */}
          <div className="space-y-2">
            {brand.responsible && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{brand.responsible}</span>
              </div>
            )}

            {brand.value > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(brand.value)}
                </span>
              </div>
            )}

            {brand.deadline && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span className={`flex items-center gap-1 ${
                  isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {format(new Date(brand.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                  {isOverdue && <Clock className="w-3 h-3" />}
                </span>
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 mt-3">
            {isOverdue && (
              <Badge variant="error" size="sm">Atrasado</Badge>
            )}
            {isDueSoon && !isOverdue && (
              <Badge variant="warning" size="sm">Urgente</Badge>
            )}
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
            Criado em {format(new Date(brand.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Excluir Marca"
        message={`Tem certeza que deseja excluir a marca "${brand.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
      />

      {/* History Modal */}
      <BrandHistoryModal
        brandId={brand.id}
        brandName={brand.name}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
}