import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmDialogProps) {
  const colors = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'primary' as const,
    info: 'primary' as const
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-6 h-6 ${colors[variant]}`} />
          <p className="text-gray-700">{message}</p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            variant={buttonVariants[variant]}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}