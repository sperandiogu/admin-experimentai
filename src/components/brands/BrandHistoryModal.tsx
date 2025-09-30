import React from 'react';
import { History, ArrowRight, User, Calendar } from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { useBrandHistory } from '../../hooks/useBrands';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BrandHistoryModalProps {
  brandId: string;
  brandName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BrandHistoryModal({ 
  brandId, 
  brandName, 
  isOpen, 
  onClose 
}: BrandHistoryModalProps) {
  const { data: history = [], isLoading } = useBrandHistory(brandId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Histórico - ${brandName}`}
      size="lg"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <History className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {entry.from_status ? (
                      <>
                        <Badge variant="default" className="text-xs">
                          {entry.from_status.name}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <Badge variant="success" className="text-xs">
                          {entry.to_status?.name}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-600">Criado em</span>
                        <Badge variant="success" className="text-xs">
                          {entry.to_status?.name}
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(entry.moved_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    
                    {entry.moved_by && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Movido pelo sistema</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum histórico encontrado
            </h3>
            <p className="text-gray-500">
              O histórico de movimentações aparecerá aqui conforme a marca for movida entre status.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}